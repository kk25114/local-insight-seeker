
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      console.log('发送聊天请求，消息内容:', inputMessage);
      
      // 使用 Supabase 客户端调用边缘函数
      const { data, error } = await supabase.functions.invoke('analyze-data', {
        body: {
          prompt: inputMessage,
          model_id: 'grok-3-fast',
          provider: 'xai',
          api_key_name: 'XAI_API_KEY',
          stream: true
        }
      });

      if (error) {
        console.error('Supabase函数调用错误:', error);
        throw new Error(error.message || '调用失败');
      }

      console.log('收到响应:', data);

      // 如果有响应内容，更新消息
      if (data && data.content) {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: data.content, isStreaming: false }
            : msg
        ));
      } else {
        // 如果没有内容，显示默认消息
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { 
                ...msg, 
                content: '收到了您的消息，但AI暂时无法生成回复。请稍后重试。',
                isStreaming: false 
              }
            : msg
        ));
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
