import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Maximize2, Minimize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

// 增强的markdown渲染函数
const renderMarkdown = (text: string) => {
  let html = text;

  // 预处理：统一换行符
  html = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 处理代码块 (``` 多行代码块) - 必须在其他处理之前
  html = html.replace(/```([a-zA-Z]*)\n?([\s\S]*?)```/g, (match, lang, code) => {
    // 移除代码开头和结尾的空行，但保持内部换行
    const cleanCode = code.trim().replace(/\n/g, '<br>');
    const language = lang ? lang.toLowerCase() : 'text';
    
    // 语言映射，处理常见的语言标识
    const languageMap: { [key: string]: string } = {
      'python': 'Python',
      'py': 'Python',
      'r': 'R',
      'sql': 'SQL',
      'javascript': 'JavaScript',
      'js': 'JavaScript',
      'typescript': 'TypeScript',
      'ts': 'TypeScript',
      'java': 'Java',
      'cpp': 'C++',
      'c++': 'C++',
      'c': 'C',
      'csharp': 'C#',
      'cs': 'C#',
      'php': 'PHP',
      'ruby': 'Ruby',
      'go': 'Go',
      'rust': 'Rust',
      'swift': 'Swift',
      'kotlin': 'Kotlin',
      'scala': 'Scala',
      'matlab': 'MATLAB',
      'spss': 'SPSS',
      'sas': 'SAS',
      'stata': 'Stata',
      'bash': 'Bash',
      'shell': 'Shell',
      'powershell': 'PowerShell',
      'json': 'JSON',
      'xml': 'XML',
      'yaml': 'YAML',
      'yml': 'YAML',
      'css': 'CSS',
      'html': 'HTML',
      'markdown': 'Markdown',
      'md': 'Markdown'
    };
    
    const langDisplay = language === 'text' ? '' : (languageMap[language] || language.toUpperCase());
    
    console.log('Processing code block:', { language, langDisplay }); // 调试信息
    
    return `<div class="code-block-container" style="position: relative; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 12px 0; padding: 0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      ${langDisplay ? `<div style="position: absolute; top: 8px; right: 8px; z-index: 10; background: #dbeafe; color: #1d4ed8; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; border: 1px solid #93c5fd;">${langDisplay}</div>` : ''}
      <pre style="margin: 0; padding: ${langDisplay ? '40px 12px 12px 12px' : '12px'}; overflow-x: auto; font-family: monospace; font-size: 13px; color: #374151; line-height: 1.5;"><code>${cleanCode}</code></pre>
    </div>`;
  });
  
  // 处理标题 (# ## ### #### ##### ######) - 支持空格容错
  html = html.replace(/^#{6}\s+(.*)$/gm, '<h6 class="text-sm font-medium text-gray-700 mb-2">$1</h6>');
  html = html.replace(/^#{5}\s+(.*)$/gm, '<h5 class="text-sm font-semibold text-gray-800 mb-2">$1</h5>');
  html = html.replace(/^#{4}\s+(.*)$/gm, '<h4 class="text-base font-semibold text-gray-800 mb-3">$1</h4>');
  html = html.replace(/^#{3}\s+(.*)$/gm, '<h3 class="text-lg font-semibold text-gray-900 mb-3">$1</h3>');
  html = html.replace(/^#{2}\s+(.*)$/gm, '<h2 class="text-xl font-semibold text-gray-900 mb-4">$1</h2>');
  html = html.replace(/^#{1}\s+(.*)$/gm, '<h1 class="text-2xl font-bold text-gray-900 mb-4">$1</h1>');
  
  // 处理链接 [text](url) - 改进正则避免嵌套问题
  html = html.replace(/\[([^\[\]]*)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // 处理粗体 **text** - 在列表之前处理
  html = html.replace(/\*\*([^*\n]+?)\*\*/g, '<strong class="font-semibold">$1</strong>');
  
  // 处理斜体 *text* - 避免与列表符号冲突，使用更精确的正则
  html = html.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em class="italic">$1</em>');
  
  // 处理无序列表 (- 或 * 开头) - 改进列表处理
  const lines = html.split('\n');
  const processedLines = [];
  let inList = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isListItem = /^\s*[-*+]\s+(.+)$/.test(line);
    
    if (isListItem) {
      if (!inList) {
        processedLines.push('<ul>');
        inList = true;
      }
      const match = line.match(/^\s*[-*+]\s+(.+)$/);
      processedLines.push(`<li>• ${match[1]}</li>`);
    } else if (inList && line.trim() === '') {
      // 空行但仍在列表中，继续
      continue;
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      processedLines.push(line);
    }
  }
  
  if (inList) {
    processedLines.push('</ul>');
  }
  
  html = processedLines.join('\n');
  
  // 处理有序列表 (1. 2. 3.)
  html = html.replace(/^(\s*\d+\.)\s+(.+)$/gm, '<li>$1 $2</li>');
  html = html.replace(/(<li>\d+\..*<\/li>\s*)+/g, '<ol class="list-decimal list-inside">$&</ol>');
  
  // 处理引用 (>)
  html = html.replace(/^>\s*(.+)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 py-1 bg-gray-50 italic">$1</blockquote>');
  
  // 处理行内代码 `code` - 必须在换行处理之前
  html = html.replace(/`([^`\n]+)`/g, '<code class="bg-gray-100 text-gray-800 px-2 py-1 rounded border border-gray-200 font-mono text-sm">$1</code>');
  
  // 处理分割线
  html = html.replace(/^---+$/gm, '<hr class="border-gray-300" />');
  
  // 处理换行
  html = html.replace(/\n/g, '<br />');
  
  return html;
};

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // 添加样式到页面头部
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .markdown-content pre {
        white-space: pre-wrap !important;
        word-wrap: break-word !important;
        overflow-x: auto !important;
        margin: 0 !important;
        line-height: 1.5 !important;
      }
      .markdown-content code {
        white-space: pre-wrap !important;
        word-wrap: break-word !important;
      }
      .markdown-content ul {
        list-style-type: none !important;
        padding-left: 1rem !important;
      }
      .markdown-content ul li {
        margin: 0.25rem 0 !important;
      }
      .markdown-content div {
        position: relative;
      }
      
      /* 移除输入框的默认focus样式 */
      input:focus {
        outline: none !important;
        box-shadow: none !important;
        ring: 0 !important;
      }
      
      /* 代码块样式优化 */
      .markdown-content pre code br {
        line-height: 1.6;
      }
      
      /* 代码块容器样式 */
      .markdown-content .code-block-container {
        position: relative !important;
      }
      
      .markdown-content .code-block-container pre {
        margin: 0 !important;
        white-space: pre-wrap !important;
        word-wrap: break-word !important;
        overflow-x: auto !important;
      }
      
      .markdown-content .code-block-container code {
        white-space: pre-wrap !important;
        word-wrap: break-word !important;
      }
      
      /* 标题样式 */
      .markdown-content h1 {
        font-size: 1.5rem !important;
        font-weight: 700 !important;
        color: #111827 !important;
        margin: 0.5rem 0 0.25rem 0 !important;
        line-height: 1.25 !important;
      }
      
      .markdown-content h2 {
        font-size: 1.25rem !important;
        font-weight: 600 !important;
        color: #111827 !important;
        margin: 0.4rem 0 0.2rem 0 !important;
        line-height: 1.3 !important;
      }
      
      .markdown-content h3 {
        font-size: 1.125rem !important;
        font-weight: 600 !important;
        color: #111827 !important;
        margin: 0.35rem 0 0.15rem 0 !important;
        line-height: 1.35 !important;
      }
      
      .markdown-content h4 {
        font-size: 1rem !important;
        font-weight: 600 !important;
        color: #374151 !important;
        margin: 0.3rem 0 0.1rem 0 !important;
        line-height: 1.4 !important;
      }
      
      .markdown-content h5 {
        font-size: 0.875rem !important;
        font-weight: 600 !important;
        color: #374151 !important;
        margin: 0.25rem 0 0.05rem 0 !important;
        line-height: 1.4 !important;
      }
      
      .markdown-content h6 {
        font-size: 0.75rem !important;
        font-weight: 500 !important;
        color: #6b7280 !important;
        margin: 0.2rem 0 0.05rem 0 !important;
        line-height: 1.4 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
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
          
          // 按行处理数据
          const lines = chunk.split('\n');
          
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
                  
                  // 实时更新消息内容 - 这里是关键的逐字显示逻辑
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  ));
                  
                  // 强制触发重新渲染和滚动
                  await new Promise(resolve => setTimeout(resolve, 0));
                } else {
                  console.log('数据中没有content字段:', data);
                }
              } catch (parseError) {
                console.warn('JSON解析失败:', dataStr, parseError);
              }
            } else {
              console.log('跳过非data行:', trimmedLine);
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
        <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isExpanded ? 'w-[600px] h-[700px]' : 'w-80 h-96'
        }`}>
          <Card className="h-full flex flex-col shadow-xl">
            <CardHeader className="p-3 bg-blue-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">AI助手</CardTitle>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-white hover:bg-blue-700 h-6 w-6 p-0"
                    title={isExpanded ? "缩小" : "放大"}
                  >
                    {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-blue-700 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 p-3 flex flex-col overflow-hidden">
              {/* 消息列表 */}
              <div className="flex-1 overflow-y-auto mb-3 space-y-2 min-h-0">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-4 p-4 rounded-lg my-2 ${
                      message.role === 'user' ? '' : 'bg-gray-50'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] min-w-0 p-3 rounded-lg break-words overflow-wrap-anywhere ${
                        isExpanded ? 'text-sm' : 'text-xs'
                      } ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div
                        className={`markdown-content w-full ${message.role === 'user' ? 'markdown-content-user' : 'markdown-content-assistant'}`}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
                      />
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-1"></span>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && messages.filter(m => m.isStreaming).length === 0 && (
                  <div className="flex justify-start">
                    <div className={`bg-gray-100 p-2 rounded-lg max-w-[80%] ${
                      isExpanded ? 'text-sm' : 'text-xs'
                    }`}>
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
                  className={`flex-1 ${isExpanded ? 'text-sm' : 'text-sm'} border-gray-300 hover:border-blue-500 focus:border-blue-600 focus:ring-0 focus:outline-none transition-colors`}
                  onKeyPress={handleKeyPress}
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
