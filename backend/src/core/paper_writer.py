from typing import List, Dict, Any, Optional

class PaperWriter:
    """Generates research papers based on findings and implementations"""
    
    def __init__(self, ai_model):
        """Initialize the paper writer with an AI model client"""
        self.ai_model = ai_model
    
    async def generate_paper(
        self, 
        research_direction: Dict[str, Any],
        algorithm_design: Dict[str, Any],
        implementation: Dict[str, Any],
        evaluation: Dict[str, Any],
        reference_papers: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate a complete research paper"""
        
        direction = research_direction.get("direction", "")
        design_doc = algorithm_design.get("design_document", "")
        code = implementation.get("refined_code", implementation.get("code", ""))
        eval_report = evaluation.get("evaluation_report", "")
        
        references_text = "\n".join([
            f"[{i+1}] {paper.get('authors', 'Unknown')}. \"{paper.get('title', 'Untitled')}\". "
            f"{paper.get('year', '')}. {paper.get('source', 'Unknown Source')}. {paper.get('url', '')}"
            for i, paper in enumerate(reference_papers[:20])
        ])
        
        code_section = f"""
        ```python
        {code}
        ```
        """
        
        prompt = f"""
        Generate a complete academic research paper based on the following components:
        
        1. Research Direction:
        {direction[:1500]}...
        
        2. Algorithm Design:
        {design_doc[:1500]}...
        
        3. Implementation Details:
        {code_section}
        
        4. Evaluation Results:
        {eval_report[:1500]}...
        
        The paper should follow standard IEEE academic structure:
        - Title
        - Abstract
        - Introduction
        - Related Work
        - Methodology
        - Implementation
        - Evaluation
        - Results and Discussion
        - Conclusion
        - References
        
        For the references section, use the following format:
        
        ## References
        
        {references_text}
        
        IMPORTANT GUIDELINES:
        1. Format the paper in a clean, professional academic style with proper sections and subsections
        2. Do not hallucinate or invent any references - use only the references provided above
        3. Include the COMPLETE algorithm implementation in the Implementation section do not LEAVE ANYTHING INCOMPLETE or say as it was.
        4. DO NOT include placeholder text like "(This section would contain...)" - write complete content for each section, same for"(Replace with actual references) [3] ... [5] ... [6] ... " Actually do the references.
        5. For the implementation section, include the full algorithm code, not just snippets or promises of code
        6. DO NOT use phrases like "code would be inserted here" - ACTUALLY INSERT THE CODE
        7. ALL sections must contain actual content, not placeholders or summaries of what would be there

        """
        
        paper_content = await self.ai_model.generate_text(
            prompt, 
            temperature=0.4,
            max_tokens=9000
        )

        # Generate a title separately for better quality
        title_prompt = f"""
        Based on this abstract and introduction:
        
        {paper_content[:1000]}
        
        Generate a SINGLE concise, descriptive title for this research paper following IEEE conference paper style.
        DO NOT provide multiple options or alternatives.
        The title should be no more than 15 words and should clearly communicate the main contribution.
        """
        
        title = await self.ai_model.generate_text(
            title_prompt,
            temperature=0.3,
            max_tokens=50
        )
        
        # Extract just the first line to ensure we only get one title
        title = title.strip().split('\n')[0]
        if ':' in title and not title.startswith('http'):
            title = title.split(':', 1)[1].strip()
        
        return {
            "title": title.strip(),
            "content": paper_content,
            "references": len(reference_papers)
        }
        

  