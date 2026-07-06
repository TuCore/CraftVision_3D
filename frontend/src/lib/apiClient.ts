// src/lib/apiClient.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7133";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  // Only set Content-Type to application/json if it's not FormData (used for file uploads)
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: "Lỗi kết nối tới máy chủ." };
    }
    throw new Error(errorData.message || "Lỗi không xác định.");
  }

  return response.json();
}
