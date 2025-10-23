"use client"

import React, { useEffect, useRef, useState } from "react";
import { faRobot, faPaperPlane, faStop, faTimes } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../styles/hero.css'
import { chatBot } from "../services/smartbot/chat";
import type { ChatResponse } from "../services/smartbot/chat";


export default function HeroSection() {
  const [chatbotInterface, setChatbotInterface] = useState(false);
  const [chatbotAlert, setChatbotAlert] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' | 'loading' }[]>([]);
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const typingIntervalRef = useRef<number | null>(null);
  const stopTypingRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleChatbotInterface = () => {
    setChatbotInterface(prev => !prev);
    setChatbotAlert(false);

    if (!chatbotInterface && messages.length === 0) {
      setShowWelcome(true);
    }
  };

  const clearChatHistory = () => {
    setMessages([]);
    setChatHistory([]);
    setShowWelcome(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setChatbotAlert(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (chatbotAlert) {
      const hideTimer = setTimeout(() => {
        setChatbotAlert(false);
      }, 5000);
      return () => clearTimeout(hideTimer);
    }
  }, [chatbotAlert]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleClose = () => {
    setChatbotAlert(false);
  };

  const stopGeneration = () => {
    setIsLoading(false);
    setIsTyping(false);
    stopTypingRef.current = true;

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    setMessages(prev => prev.filter(msg => msg.sender !== 'loading'));
  };

  const typeMessage = (fullText: string) => {
    return new Promise<void>((resolve) => {
      setIsTyping(true);
      stopTypingRef.current = false;

      let currentIndex = 0;

      setMessages(prev => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.findIndex(msg => msg.sender === 'loading');
        if (loadingIndex >= 0) {
          newMessages[loadingIndex] = { text: '', sender: 'bot' };
        }
        return newMessages;
      });

      typingIntervalRef.current = setInterval(() => {
        if (stopTypingRef.current) {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          setIsTyping(false);
          resolve();
          return;
        }

        if (currentIndex < fullText.length) {
          const currentText = fullText.substring(0, currentIndex + 1);

          setMessages(prev => {
            const newMessages = [...prev];
            const lastIndex = newMessages.length - 1;
            if (newMessages[lastIndex] && newMessages[lastIndex].sender === 'bot') {
              newMessages[lastIndex] = { ...newMessages[lastIndex], text: currentText };
            }
            return newMessages;
          });

          currentIndex++;
        } else {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          setIsTyping(false);
          resolve();
        }
      }, 40); // Adjust speed here (lower = faster typing)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const sendMessage = async () => {
    if (inputValue.trim() && !isLoading) {
      if (showWelcome) setShowWelcome(false);

      const userMessage: { text: string; sender: 'user' } = {
        text: inputValue,
        sender: 'user'
      };
      setMessages(prev => [...prev, userMessage]);
      const currentInput = inputValue;
      setInputValue('');
      setIsLoading(true);

      stopTypingRef.current = false;

      setMessages(prev => [...prev, { text: '', sender: 'loading' }]);

      try {
        const data: ChatResponse = await chatBot(currentInput, chatHistory);

        if (stopTypingRef.current) {
          setIsLoading(false);
          return;
        }

        const fullBotReply = data.response || "I didn't understand that. Could you rephrase?";

        // Update chat history
        setChatHistory(prev => [...prev, currentInput, fullBotReply]);

        await typeMessage(fullBotReply);

        setIsLoading(false);

      } catch (error) {
        console.error('Chat API error:', error);
        setMessages(prev => {
          const newMessages = prev.filter(msg => msg.sender !== 'loading');
          return [...newMessages, {
            text: "Sorry, I'm having trouble responding right now.",
            sender: 'bot'
          }];
        });
        setIsLoading(false);
        setIsTyping(false);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="h-[50vh] sm:h-[75vh] bg-[#fef6e9] bg-[url(/consultancy.jpg)] sm:bg-[url(/hero.jpg)] bg-cover bg-no-repeat bg-center">
      {/* Enhanced Chatbot icon - hidden when interface is open */}
      {!chatbotInterface && (
        <div
          className="fixed flex justify-center items-center bottom-5 right-4 rounded-full h-14 w-14 sm:h-16 sm:w-16 z-[100] shadow-2xl cursor-pointer transition-all duration-300 hover:scale-110 bg-gradient-to-r from-[#00963f] to-[#00b547] hover:shadow-green-500/50"
          onClick={handleChatbotInterface}
        >
          <FontAwesomeIcon
            icon={faRobot}
            className="text-white text-xl sm:text-2xl md:text-3xl transition-transform duration-300 hover:rotate-12 pointer-events-none"
          />
          {/* Pulse animation ring */}
          <div className="absolute inset-0 rounded-full bg-[#00963f] animate-ping opacity-20 pointer-events-none"></div>
        </div>
      )}

      {/* Enhanced floating chatbot alert - hidden when interface is open */}
      {!chatbotInterface && (
        <div className={`fixed bottom-24 right-4 sm:right-6 bg-gradient-to-r from-[#00963f] to-[#00b547] text-white p-4 text-center w-[200px] sm:w-[220px] md:w-[240px]
          rounded-2xl font-medium shadow-2xl transition-all duration-500 transform text-sm sm:text-base border border-white/20
          ${chatbotAlert ? 'translate-x-0 scale-100 opacity-100' : 'translate-x-[140%] scale-95 opacity-0'}`}>
          <div className="absolute -top-2 right-8 w-4 h-4 bg-gradient-to-r from-[#00963f] to-[#00b547] transform rotate-45"></div>
          <button
            className="absolute right-2 top-2 cursor-pointer hover:text-red-300 text-white/80 hover:text-white transition-colors w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center"
            onClick={handleClose}
          >
            ×
          </button>
          <div className="flex items-center justify-center mb-2">
            <FontAwesomeIcon icon={faRobot} className="text-lg mr-2" />
            <span className="font-semibold">Smart Bot</span>
          </div>
          <p className="text-sm">Hello there! 👋<br />Do you need any help?</p>
        </div>
      )}

      {chatbotInterface && (
        <React.Fragment>
          {/* Backdrop for closing chat interface */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] transition-opacity duration-300"
            onClick={() => setChatbotInterface(false)}
          ></div>

          {/* Chat Interface */}
          <div
            className="fixed flex flex-col bg-white min-h-[500px] max-h-[80vh] h-[70vh] w-[95vw] sm:w-[85vw] md:w-[55vw] lg:w-[45vw] xl:w-[35vw] rounded-2xl bottom-24 right-2 sm:right-4 z-[105] shadow-2xl border border-gray-200 transition-all duration-300 transform animate-in slide-in-from-bottom-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Enhanced Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#00963f] to-[#00b547] rounded-t-2xl text-white shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <FontAwesomeIcon icon={faRobot} className="text-lg" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Smart Bot</h3>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-xs text-white/80">Online & Ready</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {messages.length > 0 && (
                  <button
                    onClick={clearChatHistory}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer text-sm"
                    title="Clear chat"
                  >
                    🗑️
                  </button>
                )}
                <button
                  onClick={() => setChatbotInterface(false)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:rotate-90 cursor-pointer"
                >
                  <span className="text-lg leading-none">×</span>
                </button>
              </div>
            </div>

            {/* Enhanced Message Container */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Welcome Message */}
              <div className={`transition-all duration-500 ${showWelcome ? 'opacity-100 visible p-6' : 'opacity-0 invisible h-0 p-0'}`}>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#00963f] to-[#00b547] rounded-full flex items-center justify-center mr-3">
                      <FontAwesomeIcon icon={faRobot} className="text-white text-lg" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Hello! I'm Smart Bot 🤖</h4>
                      <p className="text-sm text-gray-600">Welcome to Smartacademy</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    I'm here to help you with questions about our courses, programs, and services.
                    What would you like to know?
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      onClick={() => setInputValue("What courses do you offer?")}
                      className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      📚 Our Courses
                    </button>
                    <button
                      onClick={() => setInputValue("How do I register?")}
                      className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      ✍️ Registration
                    </button>
                    <button
                      onClick={() => setInputValue("Tell me about pricing")}
                      className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      💰 Pricing
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {message.sender === 'bot' || message.sender === 'loading' ? (
                      <div className="flex items-start space-x-2 max-w-[85%]">
                        <div className="w-8 h-8 bg-gradient-to-r from-[#00963f] to-[#00b547] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <FontAwesomeIcon icon={faRobot} className="text-white text-sm" />
                        </div>
                        <div className="bg-gray-100 border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                          {message.sender === 'loading' ? (
                            <div className="flex items-center space-x-1">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                              <span className="text-sm text-gray-500 ml-2">Smart Bot is thinking...</span>
                            </div>
                          ) : (
                            <div className="chat-markdown text-gray-800">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  // Make links clickable and styled
                                  a: ({ node, ...props }) => {
                                    // Clean up stray `%60` or backticks
                                    const cleanHref = props.href?.replace(/[`%60]+$/, '') || '#';
                                    return (
                                      <a
                                        {...props}
                                        href={cleanHref}
                                        className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      />
                                    );
                                  },
                                  // Style lists
                                  ul: ({ node, ...props }) => (
                                    <ul {...props} className="list-disc list-inside space-y-1 my-2" />
                                  ),
                                  ol: ({ node, ...props }) => (
                                    <ol {...props} className="list-decimal list-inside space-y-1 my-2" />
                                  ),
                                  li: ({ node, ...props }) => (
                                    <li {...props} className="ml-2" />
                                  ),
                                  // Style paragraphs
                                  p: ({ node, ...props }) => (
                                    <p {...props} className="mb-2 last:mb-0" />
                                  ),
                                  // Style strong/bold text
                                  strong: ({ node, ...props }) => (
                                    <strong {...props} className="font-semibold text-gray-900" />
                                  ),
                                  // Style code
                                  code: ({ node, ...props }) => (
                                    <code {...props} className="bg-gray-100 px-1 py-0.5 rounded text-xs" />
                                  )
                                }}
                              >
                                {message.text}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-[#00963f] to-[#00b547] text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-[85%] shadow-sm">
                        <div className="text-sm leading-relaxed">{message.text}</div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Enhanced Input Area */}
            <div className="border-t border-gray-200 bg-white px-4 py-3">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message here... 💬"
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#00963f]/20 focus:border-[#00963f] disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 text-sm leading-relaxed max-h-32 scrollbar-thin scrollbar-thumb-gray-300"
                    style={{
                      minHeight: '44px',
                      height: 'auto'
                    }}
                  />
                  {inputValue && (
                    <button
                      onClick={() => setInputValue('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-sm" />
                    </button>
                  )}
                </div>

                {!isLoading && !isTyping ? (
                  <button
                    onClick={sendMessage}
                    disabled={!inputValue.trim()}
                    className="h-11 w-11 bg-gradient-to-r from-[#00963f] to-[#00b547] text-white rounded-full flex items-center justify-center disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 group cursor-pointer"
                  >
                    <FontAwesomeIcon
                      icon={faPaperPlane}
                      className="text-sm group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
                    />
                  </button>
                ) : (
                  <button
                    onClick={stopGeneration}
                    className="h-11 w-11 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faStop} className="text-sm" />
                  </button>
                )}
              </div>

              {/* Input Helper Text */}
              <div className="flex items-center justify-between mt-2 px-1">
                <div className="text-xs text-gray-500">
                  Press Enter to send, Shift+Enter for new line
                </div>
                <div className="text-xs text-gray-400">
                  {inputValue.length}/1000
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  )
}