import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Minimize2,
  Maximize2,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { sendChatMessage, getChatSuggestions } from "../api/chatbot";
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: Date.now(),
          text: "Hello! ðŸ‘‹ Welcome to QuickNest! I'm here to help you find the perfect service professional. What can I assist you with today?",
          sender: "bot",
          timestamp: new Date(),
          suggestions: [
            "View Services",
            "How it Works",
            "Book Service",
            "Pricing Info",
          ],
        },
      ]);
    }
  }, []);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);
  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      loadSuggestions();
    }
  }, [isOpen]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const loadSuggestions = async () => {
    try {
      const data = await getChatSuggestions();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Failed to load suggestions:", error);
    }
  };
  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || isLoading) return;
    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setShowSuggestions(false);
    try {
      const response = await sendChatMessage(messageText);
      const botMessage = {
        id: Date.now() + 1,
        text: response.response,
        sender: "bot",
        timestamp: new Date(),
        suggestions: response.suggestions || [],
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble processing your request right now. Please try again in a moment.",
        sender: "bot",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };
  const handleReset = () => {
    setMessages([
      {
        id: Date.now(),
        text: "Hello! ðŸ‘‹ Welcome to QuickNest! I'm here to help you find the perfect service professional. What can I assist you with today?",
        sender: "bot",
        timestamp: new Date(),
        suggestions: [
          "View Services",
          "How it Works",
          "Book Service",
          "Pricing Info",
        ],
      },
    ]);
    setShowSuggestions(true);
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  const formatMessage = (text) => {
    return text.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </span>
    ));
  };
  return (
    <>
      {}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300 border-0"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: 180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -180, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <MessageCircle className="w-6 h-6" />
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
      {}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-40"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              className={`shadow-2xl border-0 bg-white/95 backdrop-blur-sm ${
                isMinimized ? "w-80" : "w-96"
              } ${isMinimized ? "h-16" : "h-96"} transition-all duration-300`}
            >
              {}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    <Bot className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-sm">
                      QuickNest Assistant
                    </h3>
                    <p className="text-xs text-emerald-100">
                      Always here to help!
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 p-1 h-8 w-8"
                    onClick={handleReset}
                    title="Reset Chat"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 p-1 h-8 w-8"
                    onClick={() => setIsMinimized(!isMinimized)}
                    title={isMinimized ? "Maximize" : "Minimize"}
                  >
                    {isMinimized ? (
                      <Maximize2 className="w-4 h-4" />
                    ) : (
                      <Minimize2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              {!isMinimized && (
                <CardContent className="p-0 flex flex-col h-80">
                  {}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`flex ${
                            message.sender === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`flex items-start space-x-2 max-w-[80%] ${
                              message.sender === "user"
                                ? "flex-row-reverse space-x-reverse"
                                : ""
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                message.sender === "user"
                                  ? "bg-gradient-to-r from-emerald-600 to-teal-600"
                                  : "bg-gray-100"
                              }`}
                            >
                              {message.sender === "user" ? (
                                <User className="w-4 h-4 text-white" />
                              ) : (
                                <Bot className="w-4 h-4 text-emerald-600" />
                              )}
                            </div>
                            <div>
                              <div
                                className={`px-4 py-2 rounded-2xl ${
                                  message.sender === "user"
                                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                                    : message.isError
                                    ? "bg-red-50 text-red-800 border border-red-200"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                <p className="text-sm leading-relaxed">
                                  {formatMessage(message.text)}
                                </p>
                              </div>
                              {message.suggestions &&
                                message.suggestions.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {message.suggestions.map(
                                      (suggestion, index) => (
                                        <Badge
                                          key={index}
                                          className="cursor-pointer bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors duration-200 text-xs"
                                          onClick={() =>
                                            handleSuggestionClick(suggestion)
                                          }
                                        >
                                          {suggestion}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                )}
                              <p className="text-xs text-gray-400 mt-1">
                                {message.timestamp.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="flex items-start space-x-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
                            <Bot className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    {}
                    {showSuggestions &&
                      suggestions.length > 0 &&
                      messages.length === 1 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2"
                        >
                          <p className="text-sm text-gray-500 text-center">
                            Quick questions:
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {suggestions
                              .slice(0, 4)
                              .map((suggestion, index) => (
                                <Badge
                                  key={index}
                                  className="cursor-pointer bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors duration-200"
                                  onClick={() =>
                                    handleSuggestionClick(suggestion)
                                  }
                                >
                                  {suggestion}
                                </Badge>
                              ))}
                          </div>
                        </motion.div>
                      )}
                    <div ref={messagesEndRef} />
                  </div>
                  {}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSendMessage()}
                        disabled={!inputMessage.trim() || isLoading}
                        className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-4"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default Chatbot;
