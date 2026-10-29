import { create } from 'zustand';
import { getAccessToken, isJwtExpired } from '@/lib/authSession';
import { favoritesApi } from '@/features/favorites/api';
import { createFavoriteState } from '@/features/favorites/state';

// Account favorites come from the server, never from the legacy shared browser list.
export const useFavoriteStore = create(createFavoriteState(favoritesApi, () => {
  const token = getAccessToken();
  return token && !isJwtExpired(token) ? token : null;
}));
