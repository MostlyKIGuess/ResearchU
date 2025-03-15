import React from 'react';
import { StatusBadge } from '../ui/StatusBadge';
import { ResearchStatus } from '../../types';

interface ResearchFormProps {
  domain: string;
  setDomain: React.Dispatch<React.SetStateAction<string>>;
  researchFocus: string;
  setResearchFocus: React.Dispatch<React.SetStateAction<string>>;
  seedPapers: string;
  setSeedPapers: React.Dispatch<React.SetStateAction<string>>;
  status: ResearchStatus;
  errorMsg: string;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export function ResearchForm({
  domain,
  setDomain,
  researchFocus,
  setResearchFocus,
  seedPapers,
  setSeedPapers,
  status,
  errorMsg,
  onSubmit
}: ResearchFormProps) {
  return (
    <form onSubmit={onSubmit} className="bg-zinc-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-2">Research Parameters</h3>
      <hr className="border-zinc-700 mb-6" />

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="domain">
          Research Domain
        </label>
        <input
          type="text"
          id="domain"
          placeholder="e.g. Natural Language Processing, Computer Vision"
          className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          required
          disabled={status === "loading"}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="focus">
          Research Focus / Question
        </label>
        <input
          type="text"
          id="focus"
          placeholder="e.g. How can we improve few-shot learning in LLMs?"
          className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white"
          value={researchFocus}
          onChange={(e) => setResearchFocus(e.target.value)}
          disabled={status === "loading"}
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1" htmlFor="papers">
          Seed Papers (Optional)
        </label>
        <p className="text-xs text-zinc-400 mb-2">
          Format: Title | URL | Authors | Year (one per line)
        </p>
        <textarea
          id="papers"
          placeholder="Paper Title | https://arxiv.org/abs/xxx | Author Names | 2023"
          className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white h-32"
          value={seedPapers}
          onChange={(e) => setSeedPapers(e.target.value)}
          disabled={status === "loading"}
        ></textarea>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Model</label>
        <p className='text-xs zinc-400 '> pls be nice and use flash, I don&apos;t have a bank to run API calls for you</p>
        <div className="flex items-center">
          <select
            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white"
            disabled={status === "loading"}
          >
            <option value="gemini-1.5-flash">Gemini 1.5 Flash (faster)</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
          </select>
        </div>
      </div>

      {status === "error" && (
        <div className="mb-4">
          <StatusBadge type="error" message={errorMsg || "An error occurred"} />
        </div>
      )}

      <button
        type="submit"
        className={`w-full p-3 rounded font-medium ${
          status === "loading"
            ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
        disabled={status === "loading"}
      >
        {status === "loading" ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          "Start Research"
        )}
      </button>
    </form>
  );
}
