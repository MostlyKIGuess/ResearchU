import { LogEntry } from '../../types';

interface LogViewerProps {
  logs: LogEntry[];
  showLogs: boolean;
  setShowLogs: React.Dispatch<React.SetStateAction<boolean>>;
  logsContainerRef: React.RefObject<HTMLDivElement>;
}

export function LogViewer({ logs, showLogs, setShowLogs, logsContainerRef }: LogViewerProps) {
  // Parse logs if they're still in string format
  const parsedLogs = logs.map(log => {
    if (typeof log === 'string') {
      try {
        return JSON.parse(log);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        return { level: "INFO", message: log };
      }
    }
    return log;
  });

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium text-gray-300">Complete Logs</h4>
        <button 
          onClick={() => setShowLogs(!showLogs)}
          className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 py-1 rounded flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
            {showLogs ? (
              <path d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7z"/>
            ) : (
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            )}
          </svg>
          {showLogs ? "Hide Full Logs" : "Show Full Logs"}
        </button>
      </div>
      
      {showLogs && (
        <div 
          ref={logsContainerRef} 
          className="bg-gray-900 border border-gray-700 rounded p-3 mb-4 h-64 overflow-y-auto text-xs font-mono scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900"
        >
          {parsedLogs.length === 0 ? (
            <div className="text-gray-500 italic">Waiting for logs...</div>
          ) : (
            parsedLogs.map((log, index) => (
              <div 
                key={index} 
                className={`mb-1 ${
                  log.level === "INFO" ? "text-blue-300" : 
                  log.level === "ERROR" ? "text-red-400" : 
                  "text-gray-300"
                }`}
              >
                {log.timestamp && (
                  <span className="text-gray-500 mr-2">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                )}
                {log.message || JSON.stringify(log)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
