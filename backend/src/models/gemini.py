import os
import google.generativeai as genai
from typing import List, Dict, Any, Optional
import asyncio
from dotenv import load_dotenv

load_dotenv()

class GeminiClient:
    """Client for interacting with Google Gemini API"""
    
    def __init__(self, model="gemini-1.5-pro"):
        """Initialize the Gemini client"""
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
            
        genai.configure(api_key=api_key)
        self.model = model
        self.model_instance = genai.GenerativeModel(self.model)
    
    async def generate_text(self, prompt: str, system_prompt: str = None, temperature: float = 0.7, max_tokens: int = 4096):
        """Generate text from the model"""
        try:
            generation_config = {
                "temperature": temperature,
                "top_p": 1,
                "top_k": 32,
                "max_output_tokens": max_tokens,
            }
            
            safety_settings = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            ]
            
            chat = self.model_instance.start_chat(history=[])
            
            if system_prompt:
                chat.send_message(system_prompt, generation_config=generation_config, safety_settings=safety_settings)
                
            response = chat.send_message(prompt, generation_config=generation_config, safety_settings=safety_settings)
            return response.text
            
        except Exception as e:
            # Log the error in a production environment
            print(f"Error generating text: {str(e)}")
            return f"Error generating response: {str(e)}"
    
    async def analyze_literature(self, papers: List[Dict[str, Any]], query: str):
        """Analyze a collection of research papers based on a specific query"""
        papers_context = "\n\n".join([
            f"Paper {i+1}:\nTitle: {paper.get('title')}\nAuthors: {paper.get('authors', 'Unknown')}\n"
            f"Year: {paper.get('year', 'Unknown')}\nAbstract: {paper.get('abstract', 'N/A')}\n"
            for i, paper in enumerate(papers[:10])  # Limit to 10 papers to avoid context length issues
        ])
        
        system_prompt = (
            "You are an expert AI research assistant specialized in analyzing scientific literature. "
            "Provide detailed, insightful analysis based on the research papers provided."
        )
        
        prompt = f"""
        I need an analysis of the following research papers regarding this question: {query}
        
        {papers_context}
        
        Please provide:
        1. A synthesis of the key findings and methodologies
        2. Identification of research gaps and limitations
        3. Potential directions for future research
        """
        
        return await self.generate_text(prompt, system_prompt=system_prompt, temperature=0.2)
