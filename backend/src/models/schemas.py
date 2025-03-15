from pydantic import BaseModel
from typing import List, Optional

class PaperRef(BaseModel):
    title: str
    url: Optional[str] = None
    authors: Optional[str] = None
    year: Optional[int] = None

class ResearchRequest(BaseModel):
    domain: str
    seed_papers: List[PaperRef] = []
    research_focus: Optional[str] = None
    model_preference: str = "gemini-1.5-flash"

class ResearchStatus(BaseModel):
    job_id: str
    status: str
    current_stage: str
    progress: float
    details: Optional[dict] = None
