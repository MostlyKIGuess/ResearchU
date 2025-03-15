from typing import List, Dict, Any, Optional
import aiohttp
import re
from bs4 import BeautifulSoup

class LiteratureCollector:
    """Collects relevant research papers from various academic sources"""
    
    def __init__(self, ai_model):
        """Initialize the literature collector with an AI model client"""
        self.ai_model = ai_model
        self.session = None
    
    async def gather_papers(self, domain: str, seed_papers: List[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Gather relevant research papers based on domain and optional seed papers"""
        # api calling
        self.session = aiohttp.ClientSession()
        
        try:
            collected_papers = []
            
            # seed papers
            if seed_papers and len(seed_papers) > 0:
                collected_papers.extend(seed_papers)
                
            search_queries = await self._generate_search_queries(domain, seed_papers)
            
            # academia databasse, this is the only open source lol
            arxiv_papers = await self._search_arxiv(search_queries, max_results=20)
            collected_papers.extend(arxiv_papers)
            
            # maybe we can add libgem ? :devil:
            #  all these for future:
            # google_scholar_papers = await self._search_google_scholar(search_queries)
            # ieee_papers = await self._search_ieee(search_queries)
            # collected_papers.extend(google_scholar_papers)
            # collected_papers.extend(ieee_papers)
            
            unique_papers = await self._deduplicate_papers(collected_papers)
            
            
            enriched_papers = await self._enrich_papers(unique_papers)
            
            return enriched_papers
            
        finally:
            if self.session:
                await self.session.close()
    
    async def _generate_search_queries(self, domain: str, seed_papers: List[Dict[str, Any]] = None) -> List[str]:
        """Generate effective search queries based on domain and seed papers"""
        if not seed_papers:
            return [domain, f"{domain} recent advances", f"{domain} state of the art"]
        
        seed_titles = "\n".join([f"- {paper.get('title', '')}" for paper in seed_papers[:5]])
        
        prompt = f"""
        Based on the research domain "{domain}" and these seed papers:
        
        {seed_titles}
        
        Generate 5 specific search queries that would help find the most relevant and recent papers in this field.
        Each query should be sophisticated enough for academic search engines.
        Return only the list of search queries, one per line.
        """
        
        response = await self.ai_model.generate_text(prompt, temperature=0.3)
        
        queries = [line.strip() for line in response.strip().split('\n') if line.strip()]
        queries.append(domain)
        
        return queries
    
    async def _search_arxiv(self, queries: List[str], max_results: int = 10) -> List[Dict[str, Any]]:
        """Search arXiv for papers matching the queries"""
        all_papers = []
        
        for query in queries:
            try:
                # Encode query for URL
                encoded_query = query.replace(' ', '+')
                url = f"http://export.arxiv.org/api/query?search_query=all:{encoded_query}&start=0&max_results={max_results}"
                
                async with self.session.get(url) as response:
                    if response.status != 200:
                        continue
                    
                    data = await response.text()
                    soup = BeautifulSoup(data, 'xml')
                    
                    entries = soup.find_all('entry')
                    for entry in entries:
                        title_elem = entry.find('title')
                        authors_elem = entry.findAll('author')
                        abstract_elem = entry.find('summary')
                        published_elem = entry.find('published')
                        
                        # Extract data if elements exist
                        title = title_elem.text.strip() if title_elem else "No Title"
                        authors = ", ".join([author.find('name').text for author in authors_elem if author.find('name')])
                        abstract = abstract_elem.text.strip() if abstract_elem else ""
                        
                        # Extract year from published date
                        year = None
                        if published_elem:
                            year_match = re.search(r'(\d{4})', published_elem.text)
                            if year_match:
                                year = int(year_match.group(1))
                        
                        paper = {
                            "title": title,
                            "authors": authors,
                            "abstract": abstract,
                            "year": year,
                            "url": entry.find('id').text if entry.find('id') else "",
                            "source": "arXiv"
                        }
                        
                        all_papers.append(paper)
                        
            except Exception as e:
                print(f"Error searching arXiv: {str(e)}")
                continue
        
        return all_papers
    
    async def _deduplicate_papers(self, papers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate papers based on title similarity"""
        if not papers:
            return []
            
        unique_papers = []
        seen_titles = set()
        
        for paper in papers:
            title = paper.get("title", "").lower()
            # Simple deduplication based on exact title match
            # IMPROVEMENT here
            if title and title not in seen_titles:
                seen_titles.add(title)
                unique_papers.append(paper)
                
        return unique_papers
    
    async def _enrich_papers(self, papers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Enrich papers with additional metadata and analysis using AI"""
        enriched_papers = []
        
        for paper in papers:
            try:
                # Skip papers that don't have basic information
                if not paper.get('title') or not paper.get('abstract'):
                    continue
                
                prompt = f"""
                Based on this paper:
                Title: {paper['title']}
                Abstract: {paper['abstract']}
                
                Provide the following in JSON format:
                1. A list of 3-5 key topics covered
                2. The main research contribution
                3. Potential applications
                Keep each response very brief.
                """
                
                enrichment = await self.ai_model.generate_text(prompt, temperature=0.3)
                
                paper['enriched_metadata'] = enrichment
                
                # Add relevance score (placeholder for future implementation)
                paper['relevance_score'] = 1.0
                
                enriched_papers.append(paper)
                
            except Exception as e:
                print(f"Error enriching paper {paper.get('title')}: {str(e)}")
                enriched_papers.append(paper)  
                
        return enriched_papers
