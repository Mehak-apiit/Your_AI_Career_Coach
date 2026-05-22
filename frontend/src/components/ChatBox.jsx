import React, { useEffect, useRef, useCallback } from 'react';
import { Send, Loader2, User, Bot, AlertCircle } from 'lucide-react';
import PropTypes from 'prop-types';

const ChatBox = ({ messages, onSend, loading = false, error = '', inputPlaceholder = "Type your message..." }) => {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !loading) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-white/50 rounded-2xl">
            <Bot className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No conversation yet</h3>
            <p className="text-gray-600 max-w-md">Start by typing a message below</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={`${message.role}-${index}`}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-4xl p-4 md:p-6 rounded-3xl shadow-lg ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none ml-auto max-w-md'
                  : 'bg-white border border-gray-200 rounded-bl-none mr-auto max-w-md shadow-xl hover:shadow-2xl transition-shadow'
              }`}>
                {message.role === 'user' ? (
                  <div className="flex items-start">
                    <User className="w-5 h-5 mt-0.5 flex-shrink-0 ml-2" />
                    <div className="prose prose-sm max-w-none text-white/95">
                      <p>{message.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <Bot className="w-5 h-5 mt-0.5 flex-shrink-0 mr-2 text-gray-500" />
                    <div className="prose prose-sm max-w-none">
                      <p>{message.content}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="p-6 bg-white border border-gray-200 rounded-3xl rounded-bl-none shadow-xl max-w-md">
              <div className="flex items-center">
                <div className="flex items-center mr-3">
                  <Bot className="w-5 h-5 mr-2 text-gray-500" />
                  <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                </div>
                <span className="text-gray-700 font-medium">AI Career Coach is typing...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="p-4 bg-red-50 border border-red-200 rounded-3xl max-w-md shadow-lg">
              <div className="flex items-center text-red-800">
                <AlertCircle className="w-5 h-5 mr-3" />
                <span>{error}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex gap-3 items-end max-w-4xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={inputPlaceholder}
            disabled={loading}
            className="flex-1 min-h-[44px] max-h-32 p-4 resize-none rounded-3xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition-all shadow-inner hover:shadow-md disabled:bg-gray-100 disabled:cursor-not-allowed hover:border-gray-300"
            rows="1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            size="lg"
            className="!h-14 !min-h-0 p-3 rounded-3xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} className="transition-transform group-hover:scale-110" />
          </Button>
        </div>
      </div>
    </div>
  );
};

ChatBox.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      role: PropTypes.oneOf(['user', 'assistant']).isRequired,
      content: PropTypes.string.isRequired,
    })
  ),
  onSend: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  inputPlaceholder: PropTypes.string,
};

ChatBox.defaultProps = {
  messages: [],
  loading: false,
  error: '',
  inputPlaceholder: 'Type your message...',
};

export default ChatBox;

