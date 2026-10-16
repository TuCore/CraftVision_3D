/** Preserve existing shop IDs while routing their previews to matching scenes. */
const legacyScenes = ["star-lantern", "lantern-street", "rose-love", "heart-key", "distant-islands", "vietnamese-women", "birthday-space", "our-music"];
export function legacyCardSlug(id: number): string { return legacyScenes[((id - 1) % legacyScenes.length + legacyScenes.length) % legacyScenes.length]; }
export function legacyCardPath(id: number): string { return id === 3 || id === 11 ? "/love-gift" : `/love-gift/${legacyCardSlug(id)}`; }
