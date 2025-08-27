'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon, 
  PaperAirplaneIcon,
  SparklesIcon,
  HeartIcon,
  UserIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m MedEngine AI, your intelligent healthcare assistant. 🏥✨\n\nI can help you with:\n• General health information & wellness tips\n• Appointment scheduling guidance\n• Medical terminology explanations\n• Emergency first aid guidance\n• Medication information\n• Mental health support\n\nHow can I assist you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessage = (text: string) => {
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: 'Chat cleared! I\'m MedEngine AI, ready to help you with your healthcare needs. What can I assist you with?',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Call the AI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory: messages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback response
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm experiencing some technical difficulties right now. Please try again in a moment, or contact our support team if the issue persists.",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = async (actionText: string) => {
    setInputMessage(actionText);
    
    // Auto-send the quick action
    const userMessage: Message = {
      id: Date.now().toString(),
      text: actionText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Call the AI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: actionText,
          conversationHistory: messages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback response
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm experiencing some technical difficulties right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20,
          delay: 0.5 
        }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group overflow-hidden"
          whileHover={{ 
            scale: 1.1,
            rotate: [0, -10, 10, 0],
            boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.6)"
          }}
          whileTap={{ scale: 0.9 }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            backgroundPosition: {
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }
          }}
          style={{
            backgroundSize: '200% 200%',
          }}
        >
          {/* Pulse Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-blue-400/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Floating Particles */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/40 rounded-full"
                style={{
                  top: '20%',
                  left: '50%',
                  transformOrigin: '0 20px',
                  transform: `rotate(${i * 60}deg)`,
                }}
                animate={{
                  scale: [0.5, 1, 0.5],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <XMarkIcon className="w-8 h-8 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-32 right-8 w-96 h-[600px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 z-50 overflow-hidden"
            initial={{ 
              opacity: 0, 
              scale: 0.8, 
              y: 100,
              rotateX: -15 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              rotateX: 0 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8, 
              y: 100,
              rotateX: 15 
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25 
            }}
            style={{
              transformStyle: 'preserve-3d',
              perspective: '1000px'
            }}
          >
            {/* Header */}
            <motion.div 
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-6 relative overflow-hidden"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: '200% 200%',
              }}
            >
              {/* Animated Background Pattern */}
              <motion.div
                className="absolute inset-0 opacity-10"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <div className="grid grid-cols-8 gap-2 h-full">
                  {[...Array(32)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="bg-white rounded-full"
                      animate={{
                        scale: [0.5, 1, 0.5],
                        opacity: [0.2, 0.5, 0.2],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <CpuChipIcon className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">MedEngine AI</h3>
                    <motion.div 
                      className="flex items-center space-x-1 text-white/80 text-sm"
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className={`w-2 h-2 ${isOnline ? 'bg-green-400' : 'bg-red-400'} rounded-full animate-pulse`} />
                      <span>{isOnline ? 'Online & Ready' : 'Offline'}</span>
                    </motion.div>
                  </div>
                </div>
                
                {/* Header Actions */}
                <div className="flex items-center space-x-2">
                  <motion.button
                    onClick={clearChat}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Clear Chat"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </motion.button>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <XMarkIcon className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto max-h-[400px] bg-gradient-to-b from-gray-50/50 to-white/80">
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 20, x: message.isUser ? 50 : -50 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{ 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    <div className={`flex items-start space-x-2 max-w-[80%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      <motion.div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.isUser 
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                            : 'bg-gradient-to-br from-green-500 to-blue-600'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {message.isUser ? (
                          <UserIcon className="w-4 h-4 text-white" />
                        ) : (
                          <SparklesIcon className="w-4 h-4 text-white" />
                        )}
                      </motion.div>

                      {/* Message Bubble */}
                      <motion.div
                        className={`px-4 py-3 rounded-2xl shadow-sm ${
                          message.isUser
                            ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                            : 'bg-white border border-gray-200/50 text-gray-800 shadow-lg'
                        } ${
                          message.isUser ? 'rounded-br-md' : 'rounded-bl-md'
                        }`}
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: message.isUser 
                            ? "0 10px 25px -5px rgba(59, 130, 246, 0.3)"
                            : "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <p className="text-sm leading-relaxed">{formatMessage(message.text)}</p>
                        <p className={`text-xs mt-2 ${
                          message.isUser ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}

                {/* Typing Indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      className="flex justify-start"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="flex items-start space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                          <SparklesIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg">
                          <div className="flex space-x-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 bg-gray-400 rounded-full"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </motion.div>
            </div>

            {/* Input Area */}
            <motion.div 
              className="p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200/50"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about healthcare..."
                    className="w-full p-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    rows={2}
                    style={{ maxHeight: '100px' }}
                  />
                  
                  {/* Floating Send Button */}
                  <motion.button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className={`absolute bottom-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      inputMessage.trim()
                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                    whileHover={inputMessage.trim() ? { 
                      scale: 1.1,
                      boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)"
                    } : {}}
                    whileTap={{ scale: 0.9 }}
                    animate={inputMessage.trim() ? {
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    } : {}}
                    transition={{
                      backgroundPosition: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }
                    }}
                    style={{
                      backgroundSize: '200% 200%',
                    }}
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Quick Actions */}
              <motion.div 
                className="flex space-x-2 mt-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {[
                  { text: "How do I book an appointment?", icon: "📅" },
                  { text: "Give me some health tips", icon: "💡" },
                  { text: "What should I do in a medical emergency?", icon: "🚨" }
                ].map((action, index) => (
                  <motion.button
                    key={action.text}
                    className="px-3 py-2 bg-gray-100 hover:bg-blue-50 rounded-lg text-xs font-medium text-gray-600 hover:text-blue-600 transition-all duration-200 border border-gray-200 hover:border-blue-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickAction(action.text)}
                  >
                    <span className="mr-1">{action.icon}</span>
                    {action.text.length > 20 ? action.text.substring(0, 15) + '...' : action.text}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
