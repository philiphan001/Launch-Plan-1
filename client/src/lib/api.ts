interface ApiRequestOptions extends RequestInit {
  body?: string;
}

export async function apiRequest(url: string, options: ApiRequestOptions = {}) {
  // Get the auth token from localStorage if available
  const authToken = localStorage.getItem("authToken");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // Add the Authorization header if we have a token
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers,
    },
    // Include credentials to ensure cookies are sent
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}
