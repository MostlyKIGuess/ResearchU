import { useState } from 'react';
import { LogEntry } from '../../types';
import { RESEARCH_STAGES, STAGE_MAPPING } from '../../utils/constants';

interface StageOutputProps {
  logs: LogEntry[];
  activeStage: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: any;
}

export function StageOutput({ logs, activeStage, results }: StageOutputProps) {
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({
    [activeStage]: true
  });
  
  // Group logs by stage based on keywords in messages
  const stageKeywords: Record<string, string[]> = {
    'literature_collection': ['collecting', 'literature', 'papers'],
    'gap_analysis': ['analyzing', 'gaps', 'research direction'],
    'algorithm_design': ['designing', 'algorithm'],
    'implementation': ['implementing', 'implementation'],
    'evaluation': ['evaluating', 'evaluation'],
    'refinement': ['refining', 'refinement'],
    'paper_writing': ['generating paper', 'writing paper'],
  };
  
  // Filter logs by stage
  const getStageLogsFiltered = (stage: string) => {
    if (!stageKeywords[stage]) return [];
    
    return logs.filter(log => 
      stageKeywords[stage].some(keyword => 
        log.message.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  };
  
  const toggleStage = (stage: string) => {
    setExpandedStages(prev => ({
      ...prev,
      [stage]: !prev[stage]
    }));
  };

  return (
    <div className="space-y-4 mb-6">
      <h3 className="text-xl font-semibold text-blue-400">Research Progress Outputs</h3>
      
      {Object.entries(STAGE_MAPPING).map(([stageKey, index]) => {
        const stageIndex = index as number;
        const stageName = RESEARCH_STAGES[stageIndex];
        const stageLogs = getStageLogsFiltered(stageKey);
        const isActive = stageKey === activeStage;
        const isCompleted = stageIndex < STAGE_MAPPING[activeStage as keyof typeof STAGE_MAPPING];
        const isExpanded = expandedStages[stageKey] || false;
        
        return (
          <div 
            key={stageKey}
            className={`border rounded-lg ${
              isActive ? 'border-blue-500 bg-blue-900/20' : 
              isCompleted ? 'border-green-500/50 bg-green-900/10' : 
              'border-gray-700 opacity-50'
            } transition-all`}
          >
            <div 
              className="p-4 flex justify-between items-center cursor-pointer"
              onClick={() => toggleStage(stageKey)}
            >
              <div className="flex items-center space-x-3">
                <div className={`h-3 w-3 rounded-full ${
                  isActive ? 'bg-blue-500 animate-pulse' : 
                  isCompleted ? 'bg-green-500' : 
                  'bg-gray-500'
                }`}></div>
                <h4 className="font-medium text-lg">
                  {stageName}
                </h4>
              </div>
              <div className="flex items-center space-x-2">
                {stageLogs.length > 0 && (
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded">
                    {stageLogs.length} logs
                  </span>
                )}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  fill="currentColor" 
                  viewBox="0 0 16 16"
                  className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                >
                  <path d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
                </svg>
              </div>
            </div>
            
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-700">
                {stageLogs.length > 0 ? (
                  <div className="mt-2 bg-gray-900 p-3 rounded text-sm font-mono max-h-60 overflow-y-auto">
                    {stageLogs.map((log, idx) => (
                      <div 
                        key={idx}
                        className={`mb-1 ${
                          log.level === "INFO" ? "text-blue-300" : 
                          log.level === "ERROR" ? "text-red-400" : 
                          "text-gray-300"
                        }`}
                      >
                        {log.message}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm mt-2">
                    {isCompleted ? "Stage completed" : isActive ? "Stage in progress..." : "Stage not started yet"}
                  </p>
                )}
                
                {/* Show stage-specific outputs */}
                {(isCompleted || isActive) && getStageOutput(stageKey, results)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Function to display stage-specific outputs
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getStageOutput(stage: string, results: any) {
  if (!results) return null;
  
  switch(stage) {
    case 'literature_collection':
      return results.paper?.references ? (
        <div className="mt-3 bg-gray-800 p-3 rounded">
          <p className="text-sm text-gray-300">
            <span className="font-medium text-blue-300">Papers collected:</span> {
              Array.isArray(results.paper.references) 
                ? results.paper.references.length 
                : typeof results.paper.references === 'string' 
                  ? results.paper.references
                  : 'N/A'
            }
          </p>
        </div>
      ) : null;
      
    case 'algorithm_design':
      return results.implementation ? (
        <div className="mt-3 bg-gray-800 p-3 rounded">
          <p className="text-sm text-blue-300 font-medium mb-1">Algorithm Design</p>
          <p className="text-sm text-gray-300">
            The algorithm was designed based on the research gap analysis.
          </p>
        </div>
      ) : null;
      
    case 'implementation':
      return results.implementation?.code ? (
        <div className="mt-3 bg-gray-800 p-3 rounded overflow-hidden">
          <p className="text-sm text-blue-300 font-medium mb-1">Implementation Code (Preview)</p>
          <pre className="text-xs overflow-x-auto max-h-32 bg-gray-900 p-2 rounded">
            {results.implementation.code.split('\n').slice(0, 5).join('\n')}
            {results.implementation.code.split('\n').length > 5 ? '\n...' : ''}
          </pre>
        </div>
      ) : null;
      
    case 'refinement':
      return results.implementation?.refined_code ? (
        <div className="mt-3 bg-gray-800 p-3 rounded overflow-hidden">
          <p className="text-sm text-blue-300 font-medium mb-1">Refined Code (Preview)</p>
          <pre className="text-xs overflow-x-auto max-h-32 bg-gray-900 p-2 rounded">
            {results.implementation.refined_code.split('\n').slice(0, 5).join('\n')}
            {results.implementation.refined_code.split('\n').length > 5 ? '\n...' : ''}
          </pre>
        </div>
      ) : null;
      
    case 'paper_writing':
      return results.paper?.title ? (
        <div className="mt-3 bg-gray-800 p-3 rounded">
          <p className="text-sm text-blue-300 font-medium mb-1">Generated Paper</p>
          <p className="text-sm font-medium text-white">{results.paper.title}</p>
        </div>
      ) : null;
      
    default:
      return null;
  }
}
