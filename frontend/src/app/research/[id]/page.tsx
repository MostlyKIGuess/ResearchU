'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useResearch } from '../../../hooks/useResearch';
import { ResearchLayout } from '../../../components/research/ResearchLayout';
import { ResearchResults } from '@/types';

export default function ResearchPage() {
  const { id } = useParams();
  
  const {
    status,
    currentStage,
    progress,
    results,
    logs,
    errorMsg,
    // isConnected, this was for web socket FML i am stupid
  } = useResearch(id as string);

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-200 pb-10">
      <ResearchLayout
        jobId={id as string}
        currentStage={currentStage}
        progress={progress}
        status={status}
        results={results || {} as ResearchResults}
        logs={logs}
        errorMessage={errorMsg}
        // isConnected={isConnected}
      />
    </div>
  );
}
