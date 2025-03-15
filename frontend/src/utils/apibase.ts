/**
 * API utilities for connecting to the backend
 */

export const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

export const getApiUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl();
  const trimmedPath = path.startsWith('/') ? path.substring(1) : path;
  return `${baseUrl}/${trimmedPath}`;
};
