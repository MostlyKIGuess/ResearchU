import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from "@/utils/apibase";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    // Await params before using its properties
    const params = await context.params;
    const pathArray = Array.isArray(params.path) ? params.path : [params.path];
    const joinedPath = pathArray.join("/");
    const apiUrl = `${getApiBaseUrl()}/api/${joinedPath}`;

    if (joinedPath.includes('/logs')) {
      const match = joinedPath.match(/research\/([^/]+)\/logs/);
      if (match && match[1]) {
        const jobId = match[1];
        
        // Try to get logs from the backend directly
        try {
          const response = await fetch(`${getApiBaseUrl()}/api/research/${jobId}/logs`, {
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
          });
          
          if (response.ok) {
            const data = await response.json();
            return NextResponse.json(data);
          }
        } catch (error) {
          console.error("Error fetching logs from backend:", error);
        }
        
        // Fallback: Use status endpoint to generate log-like data
        const statusUrl = `${getApiBaseUrl()}/api/research/${jobId}/status`;
        const response = await fetch(statusUrl, {
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({
            logs: [
              `Job ID: ${jobId}`,
              `Status: ${data.status}`,
              `Current stage: ${data.current_stage}`,
              `Progress: ${Math.round(data.progress * 100)}%`
            ]
          });
        }
      }
      
      return NextResponse.json({ logs: [] });
    }
  
    // Forward query parameters
    const url = new URL(request.url);
    const queryString = url.search;
    const fullUrl = `${apiUrl}${queryString}`;

    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/pdf')) {
      const pdfData = await response.arrayBuffer();
      return new NextResponse(pdfData, {
        status: response.status,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': response.headers.get('content-disposition') || 'inline',
        },
      });
    }

    try {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch {
      if (response.ok) {
        const text = await response.text();
        return new NextResponse(text, {
          status: response.status,
          headers: { 'Content-Type': contentType },
        });
      }
      throw new Error('Failed to parse JSON');
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    // Await params before using its properties
    const params = await context.params;
    const pathArray = Array.isArray(params.path) ? params.path : [params.path];
    let apiPath = pathArray.join("/");
    
    // Special handling for /api/research POST requests - redirect to /api/research/start
    if (apiPath === "research") {
      apiPath = "research/start";
    }
    
    const apiUrl = `${getApiBaseUrl()}/api/${apiPath}`;

    const body = await request.json();
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}