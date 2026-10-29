import type { FavoritesApi } from "./state";

async function request(path: string, token: string, method = "GET") {
  const response = await fetch(`/api/favorites${path}`, {
    method, cache: "no-store", headers: {
      Authorization: `Bearer ${token}`, Accept: "application/json", "ngrok-skip-browser-warning": "true",
    },
  });
  if (method === "DELETE" && response.status === 404) return;
  if (!response.ok) throw new Error("Favorites request failed.");
  if (response.status === 204) return;
  return response.json();
}

export const favoritesApi: FavoritesApi = {
  async list(token) {
    const items: { productId: string }[] = await request("", token);
    return items.map((item) => item.productId);
  },
  async add(productId, token) { await request(`/${encodeURIComponent(productId)}`, token, "POST"); },
  async remove(productId, token) { await request(`/${encodeURIComponent(productId)}`, token, "DELETE"); },
};
