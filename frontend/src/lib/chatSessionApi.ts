import { fetchApi } from "@/lib/apiClient";
import { getAccessToken } from "@/lib/authSession";

export interface ChatSessionSummary {
  id: string;
  title: string;
  createdAt: string;
  lastActiveAt: string;
  messageCount?: number;
  lastMessagePreview?: string;
}

export interface ChatMessageRecord {
  id: string;
  role: "user" | "ai";
  content: string;
  imageUrl?: string;
  suggestions?: unknown[];
  createdAt: string;
}

export interface ChatSessionDetail {
  id: string;
  title: string;
  createdAt: string;
  lastActiveAt: string;
  messages: ChatMessageRecord[];
}

export async function getChatSessions(): Promise<ChatSessionSummary[]> {
  if (!getAccessToken()) return [];

  try {
    return await fetchApi("/api/gift-chat/sessions");
  } catch (error) {
    console.error("Failed to load chat sessions", error);
    return [];
  }
}

export async function getSessionMessages(sessionId: string): Promise<ChatSessionDetail> {
  return fetchApi(`/api/gift-chat/sessions/${encodeURIComponent(sessionId)}/messages`);
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  await fetchApi(`/api/gift-chat/sessions/${encodeURIComponent(sessionId)}`, {
    method: "DELETE",
  });
}

export async function renameChatSession(sessionId: string, title: string): Promise<void> {
  await fetchApi(`/api/gift-chat/sessions/${encodeURIComponent(sessionId)}/title`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });
}
