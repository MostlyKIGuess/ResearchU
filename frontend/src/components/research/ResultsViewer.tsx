/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { ResearchResults } from "../../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface ResultsViewerProps {
  results: ResearchResults;
  jobId: string | null;
}

export function ResultsViewer({ results, jobId }: ResultsViewerProps) {
  return (
    <div>
      <div className="bg-gray-700 rounded-lg p-4 mb-6 text-center">
        <h4 className="text-2xl font-bold text-white mb-3">
          {results.paper?.title || 'Untitled Research'}
        </h4>

        {jobId && results.paper && (
          <a 
            href={`/api/research/${jobId}/pdf`} 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
            </svg>
            Download PDF
          </a>
        )}
      </div>

      
      {/* Paper Content with improved styling */}
      <div className="prose prose-invert max-w-none bg-gray-800 rounded-lg p-6 shadow-inner">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            code({inline, className, children, ...props}: {
              inline?: boolean;
              className?: string;
              children?: React.ReactNode;
            } & React.HTMLAttributes<HTMLElement>) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  language={match[1]}
                  style={oneDark as any}
                  className="rounded-md"
                  showLineNumbers
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className="bg-gray-900 px-1 py-0.5 rounded text-sm" {...props}>
                  {children}
                </code>
              );
            },
            h1: ({children}) => <h1 className="text-2xl font-bold mt-6 mb-4 text-blue-300 border-b border-blue-800 pb-2">{children}</h1>,
            h2: ({children}) => <h2 className="text-xl font-bold mt-6 mb-3 text-blue-300 border-b border-blue-800/50 pb-1">{children}</h2>,
            h3: ({children}) => <h3 className="text-lg font-bold mt-5 mb-2 text-blue-300">{children}</h3>,
            p: ({children}) => <p className="my-3 text-gray-300 leading-relaxed">{children}</p>,
            ul: ({children}) => <ul className="list-disc pl-6 my-4 space-y-2">{children}</ul>,
            ol: ({children}) => <ol className="list-decimal pl-6 my-4 space-y-2">{children}</ol>,
            li: ({children}) => <li className="my-1">{children}</li>,
            blockquote: ({children}) => <blockquote className="border-l-4 border-blue-600 pl-4 my-4 italic bg-gray-900/50 py-2 pr-2 rounded-r">{children}</blockquote>,
            table: ({children}) => <div className="overflow-x-auto my-4"><table className="min-w-full divide-y divide-gray-700 border border-gray-700 rounded">{children}</table></div>,
            th: ({children}) => <th className="bg-gray-900 px-3 py-2 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">{children}</th>,
            td: ({children}) => <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300 border-t border-gray-800">{children}</td>
          }}
        >
          {results.paper?.content || 'Wait for skibiddi to cook, wohooo level 10 paper coming soon! 7 Star!! ALL conference <3'}
        </ReactMarkdown>
      </div>
      
      <h4 className="text-xl font-semibold mt-8 mb-4 border-b border-gray-700 pb-2">
        Algorithm Implementation
      </h4>
      
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 my-2 overflow-auto">
        <SyntaxHighlighter
          language="python"
          style={oneDark}
          showLineNumbers
        >
          {results.implementation?.code || results.implementation?.refined_code || "# level 1 code"}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
