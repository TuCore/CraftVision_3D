// src/lib/apiClient.ts

// Cấu hình URL cho API: 
// 1. Nếu chạy trên trình duyệt (client-side), để chuỗi rỗng "" để Next.js tự động proxy request qua rewrites.
// 2. Nếu chạy trên Server (SSR), dùng localhost:5192
const API_BASE_URL = typeof window !== 'undefined' ? "" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5192");

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

  // Bypass ngrok browser warning for API calls
  headers.set("ngrok-skip-browser-warning", "true");

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
