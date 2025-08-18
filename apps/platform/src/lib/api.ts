/**
 * Utility functions for making authenticated API calls to the backend
 */

const BACKEND_BASE_URL = process.env.BACKEND_URL || 'http://localhost:8000';

/**
 * Makes an authenticated API call to the backend
 * @param endpoint - The API endpoint (e.g., '/api/projects')
 * @param options - Fetch options
 * @param token - Optional auth token
 */
export async function apiCall(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<Response> {
  const url = `${BACKEND_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Fetches projects for the current user
 * Uses cookies for authentication
 */
export async function fetchProjects() {
  const response = await fetch('/api/projects', {
    method: 'GET',
    credentials: 'include', // Include cookies for authentication
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`);
  }
  
  return response.json();
}