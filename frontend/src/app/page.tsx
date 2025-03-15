'use client';

import { useResearch } from '../hooks/useResearch';
import { ResearchForm } from '../components/forms/ResearchForm';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const {
    domain,
    setDomain,
    researchFocus,
    setResearchFocus,
    seedPapers,
    setSeedPapers,
    status,
    errorMsg,
    startResearch,
  } = useResearch(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newJobId = await startResearch();

    if (newJobId) {
      router.push(`/research/${newJobId}`);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-200 p-4 md:p-8 flex flex-col">
      <div className="max-w-3xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-2">Research Generator</h1>
        <p className="mb-6 text-zinc-400">
          Generate AI-powered research papers on any topic
        </p>
        
        <ResearchForm 
          domain={domain}
          setDomain={setDomain}
          researchFocus={researchFocus}
          setResearchFocus={setResearchFocus}
          seedPapers={seedPapers}
          setSeedPapers={setSeedPapers}
          status={status}
          errorMsg={errorMsg}
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}
