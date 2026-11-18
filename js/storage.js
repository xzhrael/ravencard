const STORAGE_KEY_MASTERY = 'ravencard_mastery';
const STORAGE_KEY_THEME = 'ravencard_theme';
const STORAGE_KEY_ACCENT = 'ravencard_accent';
const STORAGE_KEY_QUIZ_COUNT = 'ravencard_quiz_count';

// In-memory cache to prevent repetitive synchronous localStorage.getItem & JSON.parse overhead
let memoryStore = null;

function getMasteryStore() {
  if (memoryStore !== null) {
    return memoryStore;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MASTERY);
    memoryStore = raw ? JSON.parse(raw) : {};
  } catch {
    memoryStore = {};
  }
  return memoryStore;
}

function saveMasteryStore(store) {
  memoryStore = store;
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

export function resetAllMastery() {
  memoryStore = {};
  try {
    localStorage.removeItem(STORAGE_KEY_MASTERY);
  } catch (err) {
    console.warn('[Storage] Failed to clear mastery store:', err);
  }
}

export function getOverallMasteryCount() {
  const store = getMasteryStore();
  let mastered = 0;
  let doubt = 0;
  let learning = 0;
  for (const rating of Object.values(store)) {
    if (rating === 'mastered') mastered++;
    else if (rating === 'doubt') doubt++;
    else if (rating === 'learning') learning++;
  }
  return { total: Object.keys(store).length, mastered, doubt, learning };
}

export function exportMasteryDataJSON() {
  const store = getMasteryStore();
  const theme = getSavedTheme();
  const accent = getSavedAccent();
  const quizCount = getSavedQuizQuestionCount();
  const payload = {
    app: 'RavenCard',
    version: 1,
    exportedAt: new Date().toISOString(),
    theme,
    accent,
    quizQuestionCount: quizCount,
    mastery: store,
    stats: getOverallMasteryCount()
  };
  return JSON.stringify(payload, null, 2);
}

export function importMasteryDataJSON(jsonString, { mode = 'merge' } = {}) {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object' || !data.mastery || typeof data.mastery !== 'object') {
      return { success: false, error: 'Format berkas JSON cadangan tidak valid.' };
    }
    const current = mode === 'replace' ? {} : { ...getMasteryStore() };
    const importedMastery = data.mastery;
    let validCount = 0;
    const allowed = ['mastered', 'doubt', 'learning'];

    for (const [key, val] of Object.entries(importedMastery)) {
      if (typeof key === 'string' && allowed.includes(val)) {
        current[key] = val;
        validCount++;
      }
    }

    saveMasteryStore(current);
    if (data.theme && ['dark', 'light'].includes(data.theme)) {
      saveTheme(data.theme);
    }
    if (data.accent && typeof data.accent === 'string') {
      saveAccent(data.accent);
    }
    if (typeof data.quizQuestionCount === 'number') {
      saveQuizQuestionCount(data.quizQuestionCount);
    }
    return { success: true, count: validCount };
  } catch (err) {
    return { success: false, error: 'Gagal mengurai JSON: ' + (err.message || 'Format salah') };
  }
}

export function getSavedTheme() {
  return localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
}

export function saveTheme(theme) {
  localStorage.setItem(STORAGE_KEY_THEME, theme);
}

export function getSavedAccent() {
  return localStorage.getItem(STORAGE_KEY_ACCENT) || 'blue';
}

export function saveAccent(accent) {
  localStorage.setItem(STORAGE_KEY_ACCENT, accent);
}

export function getSavedQuizQuestionCount() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUIZ_COUNT);
    const parsed = parseInt(raw, 10);
    return (parsed >= 10 && parsed <= 100) ? parsed : 10;
  } catch {
    return 10;
  }
}

export function saveQuizQuestionCount(count) {
  const parsed = parseInt(count, 10);
  const clamped = Math.max(10, Math.min(100, isNaN(parsed) ? 10 : parsed));
  try {
    localStorage.setItem(STORAGE_KEY_QUIZ_COUNT, clamped.toString());
  } catch (err) {
    console.warn('[Storage] Failed to save quiz question count:', err);
  }
  return clamped;
}
