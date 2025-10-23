export async function apiFetch(url: string, options: RequestInit = {}) {
  const defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
  };
  options.headers = { ...defaultHeaders, ...(options.headers || {}) };
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Request failed: ${response.statusText}`);
  return response.json();
}
