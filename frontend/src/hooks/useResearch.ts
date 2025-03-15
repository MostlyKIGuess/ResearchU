/* eslint-disable @typescript-eslint/no-unused-vars */
// DO NOT READ THIS CODE THIS CODE IS SO BAD IT DOENS"T WORK
import { useState, useEffect, useCallback, useRef } from "react";
import { ResearchResults } from "../types";

export function useResearch(jobId: string | null) {
  const [domain, setDomain] = useState<string>("");
  const [researchFocus, setResearchFocus] = useState<string>("");
  const [seedPapers, setSeedPapers] = useState<string>("");
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [results, setResults] = useState<ResearchResults | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  /**
   * Simple function to fetch results when ready
   */
  const checkJobStatus = useCallback(async (id: string) => {
    if (!id) return;
    
    try {
      // First check status
      const statusResponse = await fetch(`/api/research/${id}/status`);
      
      if (!statusResponse.ok) {
        throw new Error(`HTTP error! status: ${statusResponse.status}`);
      }
      
      const statusData = await statusResponse.json();
      
      // If job is completed, fetch results
      if (statusData.status === "completed") {
        setStatus("success");
        
        const resultsResponse = await fetch(`/api/research/${id}/results`);
        
        if (resultsResponse.ok) {
          const data = await resultsResponse.json();
          setResults(data);
        }
        
        // Stop checking once completed
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      } 
      // If job failed, show error
      else if (statusData.status === "failed" || statusData.status === "error") {
        setStatus("error");
        setErrorMsg(statusData.error || "Research failed");
        
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      } 
      // Otherwise, job is still running
      else {
        setStatus("loading");
        
        // Also fetch the latest logs
        try {
          const logsResponse = await fetch(`/api/research/${id}/logs`);
          if (logsResponse.ok) {
            const logsData = await logsResponse.json();
            if (logsData.logs && Array.isArray(logsData.logs)) {
              setLogs(logsData.logs);
            }
          }
        } catch (e) {
          // Ignore errors fetching logs
        }
      }
    } catch (error) {
      console.error("Error checking job status:", error);
      // Don't set error state for polling failures
    }
  }, []);

  /**
   * Set up simple interval to check status when jobId changes
   */
  useEffect(() => {
    // Clear existing interval
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    
    if (jobId) {
      setStatus("loading");
      console.log(`Setting up status checking for job ${jobId}`);
      
      // Initial check immediately
      checkJobStatus(jobId);
      
      // Check every 5 seconds - less frequent to reduce load
      checkIntervalRef.current = setInterval(() => {
        checkJobStatus(jobId);
      }, 5000);
      
      // Cleanup on unmount
      return () => {
        console.log(`Cleaning up status checking for job ${jobId}`);
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      };
    }
  }, [jobId, checkJobStatus]);

  /**
   * Start a new research job
   */
  const startResearch = async () => {
    try {
      setStatus("loading");
      
      // Parse seed papers from text input
      const parsedSeedPapers = seedPapers
        .split("\n")
        .filter(line => line.trim())
        .map(line => {
          const parts = line.split("|").map(part => part.trim());
          return {
            title: parts[0] || "",
            url: parts[1] || "",
            authors: parts[2] || "",
            year: parts[3] ? parseInt(parts[3], 10) : undefined
          };
        });
      
      // Request body
      const requestBody = {
        domain,
        research_focus: researchFocus || undefined,
        seed_papers: parsedSeedPapers,
        model_preference: "gemini-1.5-flash"
      };
      
      console.log("Starting research with:", requestBody);
      
      // Send request to the correct endpoint
      const response = await fetch("/api/research/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        // Try to get more detailed error
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          // If can't parse JSON, try text
          try {
            errorMessage = await response.text();
          } catch (e2) {
            // Use default message
          }
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("Research started successfully:", data);
      
      const newJobId = data.job_id;
      if (newJobId) {
        localStorage.setItem("currentResearchJobId", newJobId);
      }
      
      return newJobId;
    } catch (error) {
      console.error("Error starting research:", error);
      setStatus("error");
      setErrorMsg(error instanceof Error ? error.message : "Unknown error occurred");
      return null;
    }
  };

  return {
    domain, setDomain,
    researchFocus, setResearchFocus,
    seedPapers, setSeedPapers,
    
    status,
    results,
    logs,
    errorMsg,
    
    currentStage: "in_progress",
    progress: 0.5,
    
    startResearch
  };
}
