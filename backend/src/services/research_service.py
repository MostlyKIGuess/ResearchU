import logging
import uuid
from typing import Dict, Any
from ..models.schemas import ResearchRequest
from ..core.literature_collector import LiteratureCollector
from ..core.research_analyzer import ResearchAnalyzer
from ..core.algorithm_developer import AlgorithmDeveloper
from ..core.paper_writer import PaperWriter
from ..models.gemini import GeminiClient
import time

class ResearchService:
    def __init__(self):
        self.research_jobs: Dict[str, Dict[str, Any]] = {}
        
    def create_job(self, request: ResearchRequest) -> str:
        job_id = str(uuid.uuid4())
        self.research_jobs[job_id] = {
            "status": "initializing",
            "current_stage": "literature_collection",
            "progress": 0.0,
            "request": request.dict()
        }
        return job_id
        
    def update_job_status(self, job_id: str, status: str, current_stage: str, 
                         progress: float, details: dict = None):
        if job_id in self.research_jobs:
            job = self.research_jobs[job_id]
            job["status"] = status
            job["current_stage"] = current_stage
            job["progress"] = progress
            
            if details:
                if status == "completed":
                    job["results"] = details
                    job["details"] = details
                elif "details" not in job:
                    job["details"] = details
                else:
                    job["details"].update(details)
                    
            logging.info(f"Job {job_id} status updated: {status}, stage: {current_stage}, progress: {progress}")
        else:
            logging.error(f"Attempted to update non-existent job {job_id}")
    
    async def process_research(self, job_id: str, request: ResearchRequest):
        try:
            gemini = GeminiClient(model=request.model_preference)
            collector = LiteratureCollector(gemini)
            analyzer = ResearchAnalyzer(gemini)
            developer = AlgorithmDeveloper(gemini)
            writer = PaperWriter(gemini)
            
            # Convert PaperRef objects to dictionaries
            seed_papers_dicts = [paper.dict() for paper in request.seed_papers]
            
            # Phase 1: Literature Collection and Analysis
            logging.info("PHASE 1: LITERATURE COLLECTION AND ANALYSIS")
            self.update_job_status(job_id, "active", "literature_collection", 0.1)
            logging.info("Collecting literature and relevant papers...")
            phase_start = time.time()
            
            # Use the dictionary version instead of PaperRef objects
            papers = await collector.gather_papers(request.domain, seed_papers_dicts)
            logging.info(f"Collected {len(papers)} papers in {time.time() - phase_start:.2f} seconds")
            
            self.update_job_status(job_id, "active", "gap_analysis", 0.25)
            logging.info("Analyzing research gaps...")
            phase_start = time.time()
            research_gaps = await analyzer.identify_gaps(papers)
            logging.info(f"Identified {len(research_gaps)} research gaps")
            logging.info("Generating research direction...")
            research_direction = await analyzer.generate_research_direction(research_gaps, request.research_focus)
            logging.info(f"Research direction generated in {time.time() - phase_start:.2f} seconds")
            
            # Phase 2: Algorithm Development
            logging.info("PHASE 2: ALGORITHM DEVELOPMENT")
            self.update_job_status(job_id, "active", "algorithm_design", 0.4)
            logging.info("Designing algorithm...")
            phase_start = time.time()
            algorithm_design = await developer.design_algorithm(research_direction, papers)
            logging.info(f"Algorithm design complete in {time.time() - phase_start:.2f} seconds")
            
            self.update_job_status(job_id, "active", "implementation", 0.5)
            logging.info("Implementing algorithm...")
            phase_start = time.time()
            implementation = await developer.implement_algorithm(algorithm_design)
            logging.info(f"Implementation complete in {time.time() - phase_start:.2f} seconds")
            
            self.update_job_status(job_id, "active", "evaluation", 0.6)
            logging.info("Evaluating algorithm...")
            phase_start = time.time()
            evaluation_results = await developer.evaluate_algorithm(implementation)
            logging.info(f"Evaluation complete in {time.time() - phase_start:.2f} seconds")
            
            self.update_job_status(job_id, "active", "refinement", 0.7)
            logging.info("Refining implementation...")
            phase_start = time.time()
            refined_implementation = await developer.refine_algorithm(implementation, evaluation_results)
            logging.info(f"Refinement complete in {time.time() - phase_start:.2f} seconds")
            
            # Phase 3: Paper Writing
            logging.info("PHASE 3: PAPER WRITING")
            self.update_job_status(job_id, "active", "paper_writing", 0.8)
            logging.info("Generating research paper...")
            phase_start = time.time()
            paper = await writer.generate_paper(
                research_direction, 
                algorithm_design,
                refined_implementation,
                evaluation_results,
                papers
            )
            logging.info(f"Paper generated in {time.time() - phase_start:.2f} seconds")
            logging.info(f"Paper title: {paper['title']}")
            
            # Store results
            logging.info("Research pipeline completed successfully!")
            self.update_job_status(
                job_id, 
                "completed", 
                "completed", 
                1.0,
                details={
                    "paper": paper,
                    "implementation": refined_implementation,
                    "evaluation": evaluation_results,
                    "research_direction": research_direction,
                    "algorithm_design": algorithm_design
                }
            )
        except Exception as e:
            logging.error(f"Error in research pipeline: {str(e)}", exc_info=True)
            self.update_job_status(job_id, "error", "error", 0.0, {"error": str(e)})

            
