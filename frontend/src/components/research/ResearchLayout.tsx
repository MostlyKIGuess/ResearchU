import React from 'react';
import { ResearchResults } from '../../types';
import { ResultsViewer } from './ResultsViewer';

interface ResearchLayoutProps {
  jobId: string | null;
  currentStage: string;
  progress: number;
  status: "idle" | "loading" | "success" | "error";
  results: ResearchResults;
  logs: string[];
  errorMessage?: string;
}

export function ResearchLayout({
  jobId,
  status,
  results,
  logs,
  errorMessage,
}: ResearchLayoutProps) {
  return (
    <div className="container mx-auto py-8 px-6">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Research</h2>
      </div>

      {status === "loading" && (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-800/30 rounded-xl backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h3 className="text-xl font-medium text-blue-200 mb-3">Your research is getting COOOKED...</h3>
          <p className="text-gray-300 text-center max-w-md">
            We&apos;re analyzing papers, compiling research, and generating results. 
            This may take several minutes.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="bg-red-900/40 border border-red-700 text-red-200 px-6 py-4 rounded-lg mb-6 flex items-center space-x-3">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errorMessage || 'An error occurred during research'}</span>
        </div>
      )}
      
      {status === "success" && (
        <div className="bg-green-900/40 border border-green-700 text-green-200 px-6 py-4 rounded-lg mb-6 flex items-center space-x-3">
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Research cooked!! View the real Sigma below.</span>
        </div>
      )}
      
      {results && (
        <div className="mt-6">
          <ResultsViewer results={results} jobId={jobId} />
        </div>
      )}
      
      {status !== "idle" && (
        <div className="mt-10">
          <details className="bg-gray-800/50 rounded-xl border border-gray-700">
            <summary className="cursor-pointer py-4 px-6 text-gray-200 font-medium flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>View Processing Logs( this shit doens&apos;t work btw)</span>
            </summary>
            <div className="px-6 pb-4 max-h-80 overflow-y-auto">
              {logs.length > 0 ? logs.map((log, idx) => (
                <pre key={idx} className="text-sm text-gray-300 my-2 font-mono">{log}</pre>
              )) : (
                <p className="text-gray-400 italic py-2">No logs available</p>
              )}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
