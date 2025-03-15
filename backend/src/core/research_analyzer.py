from typing import List, Dict, Any, Optional

class ResearchAnalyzer:
    """Analyzes research papers to identify gaps and generate research directions"""
    
    def __init__(self, ai_model):
        """Initialize the research analyzer with an AI model client"""
        self.ai_model = ai_model
    
    async def identify_gaps(self, papers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Identify research gaps from the collected papers"""
        papers_context = "\n\n".join([
            f"Paper {i+1}:\nTitle: {paper.get('title')}\nAuthors: {paper.get('authors', 'Unknown')}\n"
            f"Year: {paper.get('year', 'Unknown')}\nAbstract: {paper.get('abstract', 'N/A')}\n"
            for i, paper in enumerate(papers[:15])  # Limit to 15 papers (for gemini we can go 30 actaully)
        ])
        
        prompt = f"""
        Analyze these papers and identify key research gaps in this field:
        
        {papers_context}
        
        Please identify:
        1. Major unsolved problems
        2. Methodological limitations in existing work
        3. Areas where current approaches fail or underperform
        4. Promising research directions that have been under-explored
        
        Format your response as a structured analysis with clear sections.
        """
        
        analysis = await self.ai_model.generate_text(prompt, temperature=0.2)
        
        return {
            "analysis": analysis,
            "papers_analyzed": len(papers)
        }
    
    async def generate_research_direction(self, research_gaps: Dict[str, Any], focus: Optional[str] = None) -> Dict[str, Any]:
        """Generate a concrete research direction based on identified gaps"""
        gaps_analysis = research_gaps.get("analysis", "")
        
        prompt = f"""
        Based on the following analysis of research gaps:
        
        {gaps_analysis}
        
        {"And focusing specifically on: " + focus if focus else ""}
        
        Please generate a concrete research direction including:
        1. A specific research question
        2. The importance and potential impact of this research
        3. A high-level approach to address this question
        4. Anticipated challenges and how they might be overcome
        
        Format your response as a structured proposal that could guide novel research.
        """
        
        direction = await self.ai_model.generate_text(prompt, temperature=0.3)
        
        return {
            "direction": direction,
            "focus": focus if focus else "general"
        }
