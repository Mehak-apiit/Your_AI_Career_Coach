import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2, User, Bot, Trash2, ChevronLeft, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../../lib/api';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/ui/Button';

// Typewriter component for AI responses
const Typewriter = ({ content, onComplete }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  
  useEffect(() => {
    let index = 0;
    const speed = 10; // faster typing speed
    
    const timer = setInterval(() => {
      if (index < content.length) {
        setDisplayedContent(content.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        onComplete?.();
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [content, onComplete]);
  
  // Detect if content is JSON
  const isJSON = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };
  
  // Format JSON with syntax highlighting
  const formatJSON = (str) => {
    try {
      const obj = JSON.parse(str);
      return JSON.stringify(obj, null, 2);
    } catch {
      return str;
    }
  };
  
  const finalContent = isJSON(content) ? formatJSON(content) : displayedContent;
  
  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      components={{
        pre: ({ children }) => (
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono border border-gray-700">
            {children}
          </pre>
        ),
        code: ({ node, inline, className, children, ...props }) => {
          const codeContent = String(children).replace(/\n$/, '');
          const isJsonCode = isJSON(codeContent);
          
          if (inline) {
            return (
              <code className="bg-gray-200 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            );
          }
          
          if (isJsonCode) {
            // Syntax highlighted JSON
            const highlighted = formatJSON(codeContent).split(/(".*?")|(:\s*)|(\{|\}|\[|\])|(\d+)|(true|false|null)/g).map((part, i) => {
              if (!part) return null;
              if (part.match(/^".*?"$/)) return <span key={i} className="text-green-400">{part}</span>;
              if (part.match(/^:\s*$/)) return <span key={i} className="text-gray-400">{part}</span>;
              if (part.match(/^[{}\[\]]$/)) return <span key={i} className="text-yellow-400">{part}</span>;
              if (part.match(/^\d+$/)) return <span key={i} className="text-blue-400">{part}</span>;
              if (part.match(/^(true|false|null)$/)) return <span key={i} className="text-purple-400">{part}</span>;
              return <span key={i}>{part}</span>;
            });
            return <code className="block font-mono text-sm">{highlighted}</code>;
          }
          
          return <code className="block font-mono text-sm" {...props}>{children}</code>;
        },
        h1: ({ children }) => <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4 border-b pb-2">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-bold text-gray-800 mt-5 mb-3">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">{children}</h3>,
        ul: ({ children }) => <ul className="list-disc ml-6 my-3 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal ml-6 my-3 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="text-gray-700">{children}</li>,
        p: ({ children }) => <p className="text-gray-800 my-2 leading-relaxed">{children}</p>,
        a: ({ children, href }) => <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
        blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">{children}</blockquote>,
        table: ({ children }) => <table className="border-collapse border border-gray-300 my-4 w-full">{children}</table>,
        th: ({ children }) => <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold">{children}</th>,
        td: ({ children }) => <td className="border border-gray-300 px-4 py-2">{children}</td>,
      }}
    >
      {finalContent}
    </ReactMarkdown>
  );
};

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [typingMessage, setTypingMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    loadChatHistory();
    scrollToBottom();
  }, []);

  const loadChatHistory = async () => {
    try {
      const response = await api.get('/chat');
      // Backend returns array of chats, get messages from most recent chat
      const chats = response.data || [];
      if (chats.length > 0) {
        setMessages(chats[0].messages || []);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/chat/new', { message: userMessage.content });
      const assistantMsg = response.data.messages?.find(m => m.role === 'assistant');
      const content = assistantMsg?.content || 'No response received';
      
      // Start typing animation
      setTypingMessage({ role: 'assistant', content });
    } catch (err) {
      const errorMessage = { role: 'assistant', content: err.response?.data?.message || 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
      setError('Failed to get response');
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = async () => {
    setMessages([]);
    setTypingMessage(null);
    // Optionally call API to clear server-side chat history if endpoint exists
    try {
      await api.delete('/chat/clear');
    } catch (err) {
      // Silently ignore if endpoint doesn't exist
    }
  };

  const handleTypingComplete = () => {
    if (typingMessage) {
      setMessages(prev => [...prev, typingMessage]);
      setTypingMessage(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Sidebar */}
      <div className="hidden lg:block lg:w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm p-6">
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              aria-label="Back to dashboard"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  AI Career Coach Chat
                </h1>
                <p className="text-sm text-gray-600">Your personal career advisor</p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="ml-auto p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </header>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-24 max-w-6xl mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <Bot className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Start a conversation</h2>
              <p className="text-xl text-gray-600 max-w-md mx-auto">
                Ask me about career advice, resume tips, job search strategies, or anything career-related
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div 
                key={index}
                className={`py-6 ${message.role === 'user' ? 'bg-white' : 'bg-gray-50'}`}
              >
                <div className="max-w-4xl mx-auto px-6 flex gap-4">
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                    message.role === 'user' ? 'bg-blue-600' : 'bg-green-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className={`prose prose-slate max-w-none ${message.role === 'user' ? '' : 'prose-pre:bg-gray-800 prose-pre:text-gray-100'}`}>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          pre: ({ children }) => (
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono border border-gray-700">
                              {children}
                            </pre>
                          ),
                          code: ({ node, inline, className, children, ...props }) => {
                            const codeContent = String(children).replace(/\n$/, '');
                            const isJsonCode = (() => { try { JSON.parse(codeContent); return true; } catch { return false; } })();
                            
                            if (inline) {
                              return (
                                <code className="bg-gray-200 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                  {children}
                                </code>
                              );
                            }
                            
                            if (isJsonCode) {
                              const formatJSON = (str) => { try { return JSON.stringify(JSON.parse(str), null, 2); } catch { return str; } };
                              const highlighted = formatJSON(codeContent).split(/(".*?")|(:\s*)|(\{|\}|\[|\])|(\d+)|(true|false|null)/g).map((part, i) => {
                                if (!part) return null;
                                if (part.match(/^".*?"$/)) return <span key={i} className="text-green-400">{part}</span>;
                                if (part.match(/^:\s*$/)) return <span key={i} className="text-gray-400">{part}</span>;
                                if (part.match(/^[{}\[\]]$/)) return <span key={i} className="text-yellow-400">{part}</span>;
                                if (part.match(/^\d+$/)) return <span key={i} className="text-blue-400">{part}</span>;
                                if (part.match(/^(true|false|null)$/)) return <span key={i} className="text-purple-400">{part}</span>;
                                return <span key={i}>{part}</span>;
                              });
                              return <code className="block font-mono text-sm">{highlighted}</code>;
                            }
                            
                            return <code className="block font-mono text-sm" {...props}>{children}</code>;
                          },
                          h1: ({ children }) => <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4 border-b pb-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-xl font-bold text-gray-800 mt-5 mb-3">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">{children}</h3>,
                          ul: ({ children }) => <ul className="list-disc ml-6 my-3 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal ml-6 my-3 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="text-gray-700">{children}</li>,
                          p: ({ children }) => <p className="text-gray-800 my-2 leading-relaxed">{children}</p>,
                          a: ({ children, href }) => <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                          blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">{children}</blockquote>,
                          table: ({ children }) => <table className="border-collapse border border-gray-300 my-4 w-full">{children}</table>,
                          th: ({ children }) => <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold">{children}</th>,
                          td: ({ children }) => <td className="border border-gray-300 px-4 py-2">{children}</td>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {typingMessage && (
            <div className="py-6 bg-gray-50">
              <div className="max-w-4xl mx-auto px-6 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-green-600 flex-shrink-0 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <Typewriter 
                    content={typingMessage.content} 
                    onComplete={handleTypingComplete}
                  />
                </div>
              </div>
            </div>
          )}

          {loading && !typingMessage && (
            <div className="py-6 bg-gray-50">
              <div className="max-w-4xl mx-auto px-6 flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full bg-green-600 flex-shrink-0 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-3" />
                  <span>AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </div>
            )}
            <div className="relative flex items-end gap-2 bg-gray-100 rounded-2xl p-2 shadow-inner">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message AI Career Coach..."
                className="flex-1 min-h-[44px] max-h-32 p-3 resize-none bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-800 placeholder-gray-500"
                disabled={loading}
                rows={1}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className={`p-2 rounded-xl transition-all ${
                  input.trim() && !loading
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              AI responses are generated automatically. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

