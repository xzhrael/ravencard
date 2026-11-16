const STORAGE_KEY_MASTERY = 'ravencard_mastery';
const STORAGE_KEY_THEME = 'ravencard_theme';

function getMasteryStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MASTERY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveMasteryStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY_MASTERY, JSON.stringify(store));
  } catch (err) {
    console.warn('[Storage] Quota exceeded or storage unavailable:', err);
  }
}

export function getCardRating(cardId) {
  if (!cardId) return null;
  const store = getMasteryStore();
  return store[cardId] || null;
}

export function setCardRating(cardId, rating) {
  if (!cardId) return;
  const store = getMasteryStore();
  store[cardId] = rating;
  saveMasteryStore(store);
}

export function getMasteryStats(cards = []) {
  if (!cards.length) {
    return { total: 0, mastered: 0, doubt: 0, learning: 0, percent: 0 };
  }

  const store = getMasteryStore();
  let mastered = 0;
  let doubt = 0;
  let learning = 0;

  cards.forEach(card => {
    const status = store[card.id];
    if (status === 'mastered') mastered++;
    else if (status === 'doubt') doubt++;
    else if (status === 'learning') learning++;
  });

  const percent = Math.round((mastered / cards.length) * 100);
  return { total: cards.length, mastered, doubt, learning, percent };
}

export function resetDeckMastery(cards = []) {
  if (!cards.length) return;
  const store = getMasteryStore();
  cards.forEach(card => {
    delete store[card.id];
  });
  saveMasteryStore(store);
}

export function getSavedTheme() {
  return localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
}

export function saveTheme(theme) {
  localStorage.setItem(STORAGE_KEY_THEME, theme);
}
