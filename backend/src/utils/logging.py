import logging
import datetime
from typing import Dict

class JobLoggingHandler(logging.Handler):
    def __init__(self, job_id: str, research_jobs: Dict):
        super().__init__()
        self.job_id = job_id
        self.research_jobs = research_jobs
        self.logs = []
        
    def emit(self, record):
        try:
            log_entry = self.format(record)
            if self.job_id in self.research_jobs:
                if "logs" not in self.research_jobs[self.job_id]:
                    self.research_jobs[self.job_id]["logs"] = []
                
                self.research_jobs[self.job_id]["logs"].append(log_entry)
                
                self.research_jobs[self.job_id]["structured_logs"] = self.research_jobs[self.job_id].get("structured_logs", [])
                self.research_jobs[self.job_id]["structured_logs"].append({
                    "timestamp": datetime.datetime.now().isoformat(),
                    "level": record.levelname,
                    "message": record.getMessage(),
                    "log_id": len(self.research_jobs[self.job_id]["logs"])
                })
                
                if len(self.research_jobs[self.job_id]["logs"]) > 500:
                    self.research_jobs[self.job_id]["logs"] = self.research_jobs[self.job_id]["logs"][-500:]
                
                print(f"JOB LOG [{self.job_id}]: {log_entry}")
                self.flush()
        except Exception as e:
            print(f"Error logging to job {self.job_id}: {str(e)}")

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s [%(levelname)s] %(message)s',
        handlers=[logging.StreamHandler()]
    )
