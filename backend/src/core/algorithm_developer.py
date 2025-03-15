from typing import List, Dict, Any, Optional

class AlgorithmDeveloper:
    """Designs and implements algorithms based on research directions"""
    
    def __init__(self, ai_model):
        """Initialize the algorithm developer with an AI model client"""
        self.ai_model = ai_model
    
    async def design_algorithm(self, research_direction: Dict[str, Any], papers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Design an algorithm based on the research direction and papers"""
        direction_text = research_direction.get("direction", "")
        
        # summaries of papers
        papers_context = "\n".join([
            f"- {paper.get('title')}: {paper.get('abstract', 'N/A')[:200]}..."
            for paper in papers[:5]
        ])
        
        prompt = f"""
        Based on this research direction:
        
        {direction_text}
        
        And considering these relevant papers:
        
        {papers_context}
        
        Design a novel algorithm that addresses the research question. Include:
        1. A high-level description of the algorithm
        2. The key innovations or improvements over existing approaches
        3. Pseudocode for the core components
        4. Expected inputs and outputs
        5. Theoretical advantages and limitations
        
        Format your response as a structured algorithm design document.
        """
        
        design = await self.ai_model.generate_text(prompt, temperature=0.4)
        
        return {
            "design_document": design
        }
    
    async def implement_algorithm(self, algorithm_design: Dict[str, Any]) -> Dict[str, Any]:
        """Implement the designed algorithm in code"""
        design_doc = algorithm_design.get("design_document", "")
        
        prompt = f"""
        Based on this algorithm design:
        
        {design_doc}
        
        Please implement the algorithm in Python code. The implementation should:
        1. Be well-structured and follow best practices
        2. Include comprehensive comments explaining the code
        3. Handle edge cases appropriately
        4. Be efficient and scalable
        5. Include any necessary helper functions
        
        Format your response as Python code with appropriate documentation.
        """
        
        implementation = await self.ai_model.generate_text(prompt, temperature=0.2)
        
        return {
            "code": implementation,
            "language": "python"
        }
    
    async def evaluate_algorithm(self, implementation: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate the implemented algorithm"""
        code = implementation.get("code", "")
        
        prompt = f"""
        Evaluate this algorithm implementation:
        
        ```python
        {code}
        ```
        
        Please provide:
        1. A theoretical analysis of time and space complexity
        2. Potential performance bottlenecks
        3. Edge cases that might cause issues
        4. Suggestions for testing methodology
        5. Ideas for benchmarking against existing approaches
        
        Format your response as a structured evaluation report.
        """
        
        evaluation = await self.ai_model.generate_text(prompt, temperature=0.3)
        
        return {
            "evaluation_report": evaluation
        }
    
    async def refine_algorithm(self, implementation: Dict[str, Any], evaluation: Dict[str, Any]) -> Dict[str, Any]:
        """Refine the algorithm based on evaluation results"""
        code = implementation.get("code", "")
        report = evaluation.get("evaluation_report", "")
        
        prompt = f"""
        Based on this algorithm implementation:
        
        ```python
        {code}
        ```
        
        And this evaluation report:
        
        {report}
        
        Please refine the algorithm to address the identified issues. Provide:
        1. The improved code implementation
        2. A summary of changes made
        3. Expected improvements in performance or robustness
        
        Format your response with the improved Python code followed by the explanation.
        """
        
        refinement = await self.ai_model.generate_text(prompt, temperature=0.2)
        
        # Split the response to extract code and explanation
        # improvement HERE
        refined_code = refinement
        explanation = "See code comments for details on improvements."
        
        return {
            "refined_code": refined_code,
            "explanation": explanation,
            "language": "python"
        }
    