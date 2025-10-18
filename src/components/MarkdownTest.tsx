import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownTest: React.FC = () => {
  const sampleMarkdown = `Hello there! I'm Mueni, your Community Health Worker AI assistant from MedAssist. I can certainly help you understand what the information says about Database 26ai.

Oracle AI Database 26ai is a significant new long-term support release designed to simplify and speed up the adoption of AI, particularly by building **"Agentic AI"** directly into the database itself. This means you can create, deploy, and manage your own AI agents right within the database using a user-friendly, no-code visual platform with pre-built agents.

Here are some key things to know about it:

*   **Easy Transition:** If you're currently using 23ai, you can switch to 26ai by applying the October 2025 release update without needing a full database upgrade or re-certification for your applications.
*   **Cost-Effective AI:** Advanced AI features, such as AI Vector Search, are included at no additional charge.
*   **Comprehensive AI and Analytics:** It offers an "Oracle Autonomous AI Lakehouse" that supports various cloud environments (OCI, AWS, Azure, Google Cloud) and is interoperable with other platforms like Databricks and Snowflake, providing high performance and pay-per-use scaling.

For more information, visit: https://www.oracle.com/database/ai/

**Powerful AI Technologies:**
*   **Unified Hybrid Vector Search:** It combines AI Vector Search with other types of searches (relational, text, JSON, etc.) to help you find and integrate diverse data with Large Language Models (LLMs).
*   **Agentic AI Support:** It supports LLM-powered AI Agents through MCP Server, enhancing their reasoning and accuracy.

You can also check their documentation at docs.oracle.com for detailed implementation guides.`;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Markdown Rendering Test</h1>
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 chat-markdown">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            // Make links clickable and styled
            a: ({ node, ...props }) => (
              <a 
                {...props} 
                className="text-blue-600 hover:text-blue-800 underline cursor-pointer" 
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
              <strong {...props} className="font-semibold text-gray-900" />
            ),
            // Style code
            code: ({ node, ...props }) => (
              <code {...props} className="bg-gray-100 px-1 py-0.5 rounded text-xs" />
            )
          }}
        >
          {sampleMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownTest;