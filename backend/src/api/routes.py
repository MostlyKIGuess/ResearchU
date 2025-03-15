from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from ..models.schemas import ResearchRequest, ResearchStatus
from ..services.research_service import ResearchService
import markdown
from weasyprint import HTML
import tempfile
import os

router = APIRouter(prefix="/api")
research_service = ResearchService()

@router.post("/research/start")
async def start_research(request: ResearchRequest, background_tasks: BackgroundTasks):
    job_id = research_service.create_job(request)
    background_tasks.add_task(research_service.process_research, job_id, request)
    return {"job_id": job_id, "message": "Research pipeline initiated"}

@router.get("/research/{job_id}/status", response_model=ResearchStatus)
async def get_research_status(job_id: str):
    if job_id not in research_service.research_jobs:
        raise HTTPException(status_code=404, detail="Research job not found")
    
    job = research_service.research_jobs[job_id]
    return ResearchStatus(
        job_id=job_id,
        status=job["status"],
        current_stage=job["current_stage"],
        progress=job["progress"],
        details=job.get("details")
    )

@router.get("/research/{job_id}/results")
async def get_research_results(job_id: str):
    if job_id not in research_service.research_jobs:
        raise HTTPException(status_code=404, detail="Research job not found")
    
    job = research_service.research_jobs[job_id]
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail="Research is not yet complete")
    
    # Access results safely or use details as fallback
    if "results" in job:
        return job["results"]
    elif "details" in job:
        return job["details"]
    else:
        raise HTTPException(
            status_code=500, 
            detail="Research completed but no results were generated."
        )

@router.get("/research/{job_id}/pdf", response_class=FileResponse)
async def get_research_pdf(job_id: str, background_tasks: BackgroundTasks):
    if job_id not in research_service.research_jobs:
        raise HTTPException(status_code=404, detail="Research job not found")
    
    job = research_service.research_jobs[job_id]
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail="Research is not yet complete")
    
    paper = job["results"]["paper"]
    
    # Create HTML from the markdown content with IEEE styling
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>{paper['title']}</title>
        <style>
            @page {{
                size: letter;
                margin: 2.54cm;
            }}
            body {{ 
                font-family: 'Times New Roman', Times, serif;
                line-height: 1.5;
                font-size: 10pt;
                column-count: 2;
                column-gap: 0.5cm;
                margin: 0;
                padding: 0;
            }}
            .header {{
                column-span: all;
                text-align: center;
                margin-bottom: 1cm;
                padding-bottom: 0.5cm;
                border-bottom: 1px solid black;
            }}
            h1 {{ 
                font-size: 18pt;
                font-weight: bold;
                text-align: center;
                margin-bottom: 0.3cm;
                column-span: all;
            }}
            .author {{
                font-size: 11pt;
                text-align: center;
                margin-bottom: 0.5cm;
                column-span: all;
            }}
            .abstract {{
                font-size: 9pt;
                font-style: italic;
                margin-bottom: 0.5cm;
                text-align: justify;
                column-span: all;
            }}
            h2 {{ 
                font-size: 12pt;
                font-weight: bold;
                margin-top: 0.5cm;
                margin-bottom: 0.3cm;
                text-transform: uppercase;
                break-after: avoid;
                column-span: all;
            }}
            h3 {{ 
                font-size: 11pt;
                font-weight: bold;
                margin-top: 0.5cm;
                margin-bottom: 0.3cm;
                break-after: avoid;
                column-span: all;
            }}
            p {{
                text-align: justify;
                margin-top: 0;
                margin-bottom: 0.3cm;
                hyphens: auto;
            }}
            pre {{ 
                font-family: 'Courier New', Courier, monospace;
                font-size: 8pt;
                background-color: #f5f5f5;
                padding: 0.4cm;
                margin: 0.5cm 0;
                border: 1px solid #ddd;
                white-space: pre-wrap;
                overflow-x: auto;
                page-break-inside: avoid;
                column-span: all;
            }}
            code {{ 
                font-family: 'Courier New', Courier, monospace;
                font-size: 8pt;
                background-color: #f5f5f5;
                padding: 0 3px;
            }}
            .references {{ 
                font-size: 9pt;
                margin-top: 1cm;
                border-top: 1px solid black;
                padding-top: 0.3cm;
                column-span: all;
            }}
            ol {{
                padding-left: 1.5em;
            }}
            ul {{
                padding-left: 1.5em;
            }}
            li {{
                margin-bottom: 0.2cm;
                text-align: justify;
            }}
            figure {{
                margin: 0.5cm 0;
                text-align: center;
                page-break-inside: avoid;
                column-span: all;
            }}
            figcaption {{
                font-size: 9pt;
                font-style: italic;
                text-align: center;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
                margin: 0.5cm 0;
                page-break-inside: avoid;
                column-span: all;
            }}
            th, td {{
                border: 1px solid black;
                padding: 0.2cm;
                font-size: 9pt;
                text-align: center;
            }}
            th {{
                background-color: #f0f0f0;
            }}
            img {{
                max-width: 100%;
                height: auto;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>{paper['title']}</h1>
        </div>
        {markdown.markdown(paper['content'], extensions=['extra', 'codehilite', 'nl2br', 'toc'])}
    </body>
    </html>
    """
    
    # Create a temporary file for the PDF
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        # Generate PDF from HTML
        HTML(string=html_content).write_pdf(tmp.name)
    
    # Add the cleanup task to background_tasks
    background_tasks.add_task(os.unlink, tmp.name)
    
    # Return the PDF as a file download
    filename = f"research-paper-{job_id}.pdf"
    
    return FileResponse(
        tmp.name,
        media_type="application/pdf",
        filename=filename
    )

@router.get("/research/{job_id}/logs")
async def get_research_logs(job_id: str, last_seen: int = 0):
    if job_id not in research_service.research_jobs:
        raise HTTPException(status_code=404, detail="Research job not found")
    
    job = research_service.research_jobs[job_id]
    
    # Get all logs or just new ones based on last_seen parameter
    all_logs = job.get("logs", [])
    all_structured_logs = job.get("structured_logs", [])
    
    # Get new logs based on last_seen index
    new_logs = all_logs[last_seen:] if last_seen < len(all_logs) else []
    
    # Get new structured logs (if available)
    new_structured = all_structured_logs[last_seen:] if last_seen < len(all_structured_logs) else []
    
    return {
        "logs": new_logs,
        "structured_logs": new_structured,
        "total_count": len(all_logs),
        "new_count": len(new_logs),
        "job_status": job["status"],
        "job_stage": job["current_stage"],
        "job_progress": job["progress"]
    }

@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "AI-Researcher API"}
