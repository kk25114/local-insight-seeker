
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

// 简单的markdown渲染函数
const renderMarkdown = (text: string) => {
  // 处理换行
  const withBreaks = text.replace(/\n/g, '<br />');
  
  // 处理粗体
  const withBold = withBreaks.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // 处理斜体
  const withItalic = withBold.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // 处理代码块
  const withCode = withItalic.replace(/`(.*?)`/g, '<code class="bg-gray-200 px-1 rounded text-xs">$1</code>');
  
  return withCode;
};

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '您好！我是您的AI助手，有什么可以帮您的吗？',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    // 创建一个新的助手消息用于流式显示
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      console.log('发送聊天请求，消息内容:', currentInput);
      
      const supabaseUrl = "https://nizrlyekwwnujsvcjzwj.supabase.co";
      const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5penJseWVrd3dudWpzdmNqendqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NTA1MTgsImV4cCI6MjA2NDMyNjUxOH0.q6rt3lQTTotcxUJ3hPnluovTisuSQBorlutUflb9nPA";
      
      const response = await fetch(`${supabaseUrl}/functions/v1/analyze-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          prompt: currentInput,
          model_id: 'grok-3-fast',
          provider: 'xai',
          api_key_name: 'XAI_API_KEY',
          stream: true
        })
      });

      console.log('响应状态:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API错误响应:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      if (!response.body) {
        throw new Error('响应体为空');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let buffer = '';

      console.log('开始读取流式数据...');

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('流式数据读取完成');
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          console.log('收到数据块:', chunk);
          
          // 将新的数据块添加到缓冲区
          buffer += chunk;
          
          // 按行处理数据
          const lines = buffer.split('\n');
          
          // 保留最后一行（可能不完整），其余的都处理
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (trimmedLine === '') continue;
            
            console.log('处理行:', trimmedLine);
            
            if (trimmedLine.startsWith('data: ')) {
              const dataStr = trimmedLine.slice(6).trim();
              console.log('提取的数据:', dataStr);
              
              if (dataStr === '[DONE]') {
                console.log('接收到结束标记');
                break;
              }

              try {
                const data = JSON.parse(dataStr);
                console.log('解析的JSON数据:', data);
                
                // 检查是否有内容字段
                if (data.content) {
                  accumulatedContent += data.content;
                  console.log('累积内容:', accumulatedContent);
                  
                  // 实时更新消息内容
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  ));
                } else {
                  console.log('数据中没有content字段:', data);
                }
              } catch (parseError) {
                console.warn('JSON解析失败:', dataStr, parseError);
                // 可能是不完整的JSON，继续处理下一行
              }
            } else {
              console.log('跳过非data行:', trimmedLine);
            }
          }
        }
        
        // 处理缓冲区中剩余的数据
        if (buffer.trim()) {
          console.log('处理缓冲区剩余数据:', buffer);
          const trimmedLine = buffer.trim();
          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.slice(6).trim();
            if (dataStr !== '[DONE]') {
              try {
                const data = JSON.parse(dataStr);
                if (data.content) {
                  accumulatedContent += data.content;
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  ));
                }
              } catch (parseError) {
                console.warn('最终JSON解析失败:', dataStr, parseError);
              }
            }
          }
        }
        
      } finally {
        console.log('清理流式传输状态，最终内容长度:', accumulatedContent.length);
        // 确保流式传输状态被清除
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, isStreaming: false }
            : msg
        ));
      }

      // 如果没有接收到任何内容，显示错误消息
      if (accumulatedContent === '') {
        console.warn('没有接收到任何内容');
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { 
                ...msg, 
                content: '抱歉，没有收到回复，请重试。',
                isStreaming: false 
              }
            : msg
        ));
      } else {
        console.log('成功接收到内容，长度:', accumulatedContent.length);
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "发送失败",
        description: error instanceof Error ? error.message : "无法发送消息，请稍后重试",
        variant: "destructive",
      });
      
      // 更新错误消息
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { 
              ...msg, 
              content: '抱歉，我现在无法回复您的消息，请稍后重试。',
              isStreaming: false 
            }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* 聊天浮框按钮 */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
            size="sm"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* 聊天窗口 */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 h-96">
          <Card className="h-full flex flex-col shadow-xl">
            <CardHeader className="p-3 bg-blue-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">AI助手</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-blue-700 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 p-3 flex flex-col overflow-hidden">
              {/* 消息列表 */}
              <div className="flex-1 overflow-y-auto mb-3 space-y-2 min-h-0">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] min-w-0 p-2 rounded-lg text-xs break-words overflow-wrap-anywhere ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div
                        className="whitespace-pre-wrap leading-relaxed word-break"
                        style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdown(message.content)
                        }}
                      />
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-1"></span>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && messages.filter(m => m.isStreaming).length === 0 && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-2 rounded-lg text-xs max-w-[80%]">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 输入框 */}
              <div className="flex space-x-2 flex-shrink-0">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="输入消息..."
                  className="flex-1 text-sm"
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
