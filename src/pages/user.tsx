import React, { useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatBot } from "../services/smartbot/chat";
import type { ChatResponse } from "../services/smartbot/chat";

const User: React.FC = () => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result: ChatResponse = await chatBot(message, chatHistory);
      setResponse(result.response || "No response received");
      
      // Update chat history
      setChatHistory(prev => [...prev, message, result.response]);
      
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">User Dashboard</h1>
            <p className="text-blue-100 mt-1">Smart Academy Learning Assistant</p>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Ask the Learning Assistant
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask me anything about your learning..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    disabled={loading}
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading || !message.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Getting Answer..." : "Ask Question"}
                  </button>
                  
                  {chatHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setChatHistory([]);
                        setResponse(null);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Clear Conversation
                    </button>
                  )}
                </div>
              </form>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {response && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Assistant's Answer:</h3>
                <div className="chat-markdown text-blue-800">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Make links clickable and styled
                      a: ({ node, ...props }) => (
                        <a 
                          {...props} 
                          className="text-blue-600 hover:text-blue-800 underline cursor-pointer font-medium" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        />
                      ),
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
                        <strong {...props} className="font-semibold text-blue-900" />
                      ),
                      // Style code
                      code: ({ node, ...props }) => (
                        <code {...props} className="bg-blue-100 px-1 py-0.5 rounded text-xs" />
                      )
                    }}
                  >
                    {response}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;