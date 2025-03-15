# ResearchU: AI-Powered Research Assistant

ResearchU is an AI-powered platform that automates scientific research workflows, from literature review to paper writing. It leverages large language models to collect relevant papers, identify research gaps, design and implement algorithms, and generate complete research papers. 

### Note: 
- This is for fun, and it might give you some ideas coz it scares research papers but do not use AI in your actual research lmao.

![ResearchU Banner](frontend/public/researchu.jpg)

## Features

- **Automated Literature Collection**: Gathers papers from arXiv (expandable to other sources)
- **Gap Analysis**: Identifies research gaps in the literature
- **Algorithm Design & Implementation**: Creates novel algorithms to address research questions
- **Paper Generation**: Produces complete, well-structured research papers with references
- **PDF Export**: Download the generated papers as formatted PDF documents

## Architecture

ResearchU follows a modern client-server architecture:

- **Frontend**: Next.js React application with TypeScript
- **Backend**: FastAPI Python server with asynchronous processing
- **AI Engine**: Uses Google's Gemini models for intelligent processing

## Getting Started

### Prerequisites

- Node.js 16+
- Python 3.9+
- Google Gemini API key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. Start the backend server:
   ```bash
   python server.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
3. Add an env:
   ```bash
   cp .env.example .env
   ```
- It can just have localhost:8000, which is default but if you wanna deploy feel free to.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Access the application at `http://localhost:3000`

## Usage

1. Enter a research domain (e.g., "Graph Neural Networks")
2. Optionally specify a research focus
3. Add seed papers if available (Title | URL | Authors | Year)
4. Submit and wait for the research process to complete
5. View and download the generated paper

## Research Pipeline

The system follows a structured research pipeline:

1. **Literature Collection**: Gathers relevant papers based on the domain
2. **Gap Analysis**: Identifies research gaps and opportunities
3. **Algorithm Design**: Creates conceptual designs to address the research question
4. **Implementation**: Translates designs into working code
5. **Evaluation**: Assesses the implementation's effectiveness
6. **Refinement**: Improves the implementation based on evaluation
7. **Paper Writing**: Generates a complete academic paper with all sections

## License

This project is licensed under the MIT License - see the LICENSE file for details.

