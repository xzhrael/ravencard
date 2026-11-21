import { initPWA, showToast } from './pwa.js';
import { getDeckData } from './data-service.js';
import { speakJapanese } from './audio.js';
import { initQuiz, getQuizListeningMode, setQuizListeningMode, updateModeBadgeUI } from './quiz.js?v=40';

let writingModulePromise = null;
function getWritingModule() {
  if (!writingModulePromise) {
    writingModulePromise = import('./writing.js?v=40');
  }
  return writingModulePromise;
}
import {
  getCardRating,
  setCardRating,
  getMasteryStats,
  resetDeckMastery,
  resetAllMastery,
  getOverallMasteryCount,
  exportMasteryDataJSON,
  importMasteryDataJSON,
  getSavedTheme,
  saveTheme,
  getSavedAccent,
  saveAccent,
  getSavedQuizQuestionCount,
  saveQuizQuestionCount
} from './storage.js';
import { getTransitivityInfo } from './transitivity-data.js';

const FILTER_CONFIG = {
  hiragana: [
    { id: 'all', label: 'Semua' },
    { id: 'seion', label: 'Seion (Dasar)' },
    { id: 'dakuon', label: 'Dakuon (ﾞ/ﾟ)' },
    { id: 'yoon', label: 'Yoon (Kombinasi)' }
  ],
  katakana: [
    { id: 'all', label: 'Semua' },
    { id: 'seion', label: 'Seion (Dasar)' },
    { id: 'dakuon', label: 'Dakuon (ﾞ/ﾟ)' },
    { id: 'yoon', label: 'Yoon (Kombinasi)' }
  ],
  kanji: [
    { id: 'all', label: 'Semua' },
    { id: 'n5', label: 'JLPT N5' },
    { id: 'n4', label: 'JLPT N4' },
    { id: 'n3', label: 'JLPT N3' }
  ],
  kotoba: [
    { id: 'all', label: 'Semua' },
    { id: 'n5', label: 'JLPT N5' },
    { id: 'n4', label: 'JLPT N4' },
    { id: 'n3', label: 'JLPT N3' }
  ],
  jft: [
    { id: 'all', label: 'Semua Rambu & Kosakata' },
    { id: 'rambu', label: 'Rambu & Keselamatan' },
    { id: 'seikatsu', label: 'Kehidupan & Belanja' },
    { id: 'shigoto', label: 'Tempat Kerja' }
  ]
};

const state = {
  activePage: 'cards',
  category: 'hiragana',
  level: 'all',
  rawDeck: [],
  activeDeck: [],
  currentIndex: 0,
  isFlipped: false,
  onlyUnmastered: false,
  dictSearchQuery: '',
  theme: getSavedTheme(),
  accent: getSavedAccent() === 'orange' ? 'blue' : getSavedAccent(),
  quizQuestionCount: getSavedQuizQuestionCount()
};

document.addEventListener('DOMContentLoaded', async () => {
  initPWA();
  initTheme();
  initAccent();
  initSettingsPage();
  setupEventListeners();
  switchPage(state.activePage);
  await loadDeck();
});

function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  applyTheme(state.theme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      saveTheme(state.theme);
      applyTheme(state.theme);
      showToast(state.theme === 'dark' ? 'Mode Gelap Aktif' : 'Mode Terang Aktif');
    });
  }
}

function initAccent() {
  applyAccent(state.accent);
}

function applyAccent(accent) {
  document.documentElement.setAttribute('data-accent', accent);
  const buttons = document.querySelectorAll('.accent-palette-btn');
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.accent === accent);
  });
}

function applyTheme(theme) {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const darkBtn = document.getElementById('theme-btn-dark');
  const lightBtn = document.getElementById('theme-btn-light');

  if (darkBtn && lightBtn) {
    darkBtn.classList.toggle('active', theme === 'dark');
    lightBtn.classList.toggle('active', theme === 'light');
  }

  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeColorMeta) themeColorMeta.setAttribute('content', '#fdfcff');
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;
    }
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (themeColorMeta) themeColorMeta.setAttribute('content', '#111318');
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;
    }
  }
}

export function switchPage(pageName) {
  state.activePage = pageName;

  const botnavItems = document.querySelectorAll('#floating-botnav .botnav-item');
  botnavItems.forEach(item => {
    const isActive = item.dataset.page === pageName;
    item.classList.toggle('active', isActive);
    if (isActive) {
      item.setAttribute('aria-current', 'page');
    } else {
      item.removeAttribute('aria-current');
    }
  });

  if (typeof window.updateLgTabbar === 'function') {
    window.updateLgTabbar();
  }

  const pageCards = document.getElementById('page-cards');
  const pageQuiz = document.getElementById('page-quiz');
  const pageList = document.getElementById('page-list');
  const pageWriting = document.getElementById('page-writing');
  const pageSettings = document.getElementById('page-settings');

  pageCards?.classList.toggle('active', pageName === 'cards');
  pageQuiz?.classList.toggle('active', pageName === 'quiz');
  pageList?.classList.toggle('active', pageName === 'list');
  pageWriting?.classList.toggle('active', pageName === 'writing');
  pageSettings?.classList.toggle('active', pageName === 'settings');

  // Allow category dropdown on cards, quiz, and list (kamus)
  const deckSelectorBar = document.getElementById('deck-selector-bar');
  if (deckSelectorBar) {
    const isDeckBarAllowed = pageName === 'cards' || pageName === 'quiz' || pageName === 'list';
    deckSelectorBar.classList.toggle('hidden', !isDeckBarAllowed);
  }

  const toggleUnmasteredWrap = document.getElementById('toggle-unmastered-wrap');
  const quizSettingsBtn = document.getElementById('quiz-settings-btn');
  if (toggleUnmasteredWrap) {
    toggleUnmasteredWrap.classList.toggle('hidden', pageName === 'quiz');
  }
  if (quizSettingsBtn) {
    quizSettingsBtn.classList.toggle('hidden', pageName !== 'quiz');
  }

  updateDeckCounterUI();

  if (pageName === 'cards') {
    renderCurrentCard();
  } else if (pageName === 'quiz') {
    initQuiz(state.rawDeck, state.quizQuestionCount);
  } else if (pageName === 'list') {
    renderDictionaryList();
  } else if (pageName === 'writing') {
    getWritingModule().then(mod => mod.initWriting());
  } else if (pageName === 'settings') {
    renderSettingsPage();
  }
}

async function yieldToMain() {
  if (typeof window.scheduler !== 'undefined' && typeof window.scheduler.yield === 'function') {
    return await window.scheduler.yield();
  }
  return new Promise(resolve => setTimeout(resolve, 0));
}

function updateDeckCounterUI() {
  const countIndicator = document.getElementById('deck-counter');
  if (!countIndicator) return;

  if (state.activePage === 'quiz') {
    countIndicator.classList.add('hidden');
    return;
  }

  if (state.activePage === 'cards' || state.activePage === 'list') {
    countIndicator.classList.remove('hidden');
    const stats = getMasteryStats(state.rawDeck);
    countIndicator.textContent = `${stats.mastered} / ${stats.total}`;
    countIndicator.title = `${stats.mastered} dari ${stats.total} huruf/kotoba sudah dihafal`;
  } else {
    countIndicator.classList.add('hidden');
  }
}

async function loadDeck() {
  state.rawDeck = await getDeckData(state.category, state.level);
  applyFilters();
  state.currentIndex = 0;
  state.isFlipped = false;

  if (state.activePage === 'quiz') {
    initQuiz(state.rawDeck, state.quizQuestionCount);
  } else if (state.activePage === 'list') {
    renderDictionaryList();
  } else if (state.activePage === 'writing') {
    getWritingModule().then(mod => mod.initWriting());
  } else {
    renderCurrentCard();
  }

  await yieldToMain();

  updateProgressUI();
  updateDeckLabel();
}

function applyFilters() {
  if (state.onlyUnmastered) {
    state.activeDeck = state.rawDeck.filter(card => getCardRating(card.id) !== 'mastered');
    if (state.activeDeck.length === 0 && state.rawDeck.length > 0) {
      showToast('Semua kartu pada kategori ini sudah dikuasai.');
      state.activeDeck = [...state.rawDeck];
      const toggle = document.getElementById('unmastered-only-toggle');
      if (toggle) {
        if (toggle.tagName === 'BUTTON') {
          toggle.setAttribute('aria-checked', 'false');
        } else {
          toggle.checked = false;
        }
      }
      state.onlyUnmastered = false;
    }
  } else {
    state.activeDeck = [...state.rawDeck];
  }
}

function renderCurrentCard() {
  const cardElement = document.getElementById('flashcard-card');
  const countIndicator = document.getElementById('deck-counter');

  if (cardElement) {
    cardElement.classList.remove('is-flipped');
    state.isFlipped = false;
  }

  if (!state.activeDeck.length) {
    updateDeckCounterUI();
    return;
  }

  const card = state.activeDeck[state.currentIndex];

  const frontBadge = document.getElementById('card-badge-front');
  const frontChar = document.getElementById('card-char-front');
  const frontHint = document.getElementById('card-hint-front');

  if (frontBadge) frontBadge.textContent = card.badge || '';
  if (frontChar) {
    frontChar.textContent = card.character;
    if (card.character.length > 5) {
      frontChar.style.fontSize = 'clamp(2.6rem, 9vw, 3.8rem)';
    } else if (card.character.length > 2) {
      frontChar.style.fontSize = 'clamp(3.6rem, 13vw, 5.0rem)';
    } else {
      frontChar.style.fontSize = '';
    }
  }

  if (frontHint) {
    if ((card.category === 'kotoba' || card.category === 'jft') && card.reading && card.reading !== card.character) {
      frontHint.textContent = `[ ${card.reading} ]`;
      frontHint.style.display = '';
    } else {
      frontHint.textContent = '';
      frontHint.style.display = 'none';
    }
  }

  const backBadge = document.getElementById('card-badge-back');
  const backChar = document.getElementById('card-char-back');
  const backRomaji = document.getElementById('card-romaji-back');
  const backMeaningId = document.getElementById('card-meaning-id');
  const backMeaningEn = document.getElementById('card-meaning-en');

  if (backBadge) backBadge.textContent = card.badge || '';
  if (backChar) {
    backChar.textContent = card.character;
    backChar.style.fontSize = card.character.length > 6 ? 'clamp(2.0rem, 6.5vw, 2.5rem)' : '';
  }
  if (backRomaji) backRomaji.textContent = card.romaji || card.reading || '';
  if (backMeaningId) backMeaningId.textContent = card.meaning_id || '';
  if (backMeaningEn) backMeaningEn.textContent = card.meaning_en || '';

  const transitivityBox = document.getElementById('card-transitivity-box');
  const transInfo = getTransitivityInfo(card.character);
  if (transitivityBox) {
    if (transInfo) {
      transitivityBox.style.display = 'inline-flex';
      transitivityBox.innerHTML = `
        <span class="trans-tag ${transInfo.isTransitive ? 'transitive' : 'intransitive'}">${transInfo.type}</span>
        <span class="trans-sep">↔</span>
        <span class="trans-pair">Pasangan: <strong>${transInfo.pairWord}</strong> (${transInfo.pairType.split(' ')[0]})</span>
      `;
    } else {
      transitivityBox.style.display = 'none';
      transitivityBox.innerHTML = '';
    }
  }

  const yomiBox = document.getElementById('kanji-yomi-box');
  const onyomiEl = document.getElementById('kanji-onyomi');
  const onyomiRomajiEl = document.getElementById('kanji-onyomi-romaji');
  const kunyomiEl = document.getElementById('kanji-kunyomi');
  const kunyomiRomajiEl = document.getElementById('kanji-kunyomi-romaji');

  if (card.category === 'kanji') {
    if (yomiBox) yomiBox.style.display = 'grid';
    if (onyomiEl) onyomiEl.textContent = card.onyomi || '-';
    if (onyomiRomajiEl) onyomiRomajiEl.textContent = card.onyomi_romaji ? `(${card.onyomi_romaji})` : '-';
    if (kunyomiEl) kunyomiEl.textContent = card.kunyomi || '-';
    if (kunyomiRomajiEl) kunyomiRomajiEl.textContent = card.kunyomi_romaji ? `(${card.kunyomi_romaji})` : '-';
  } else if (yomiBox) {
    yomiBox.style.display = 'none';
  }

  const exampleBox = document.getElementById('card-example-box');
  const exampleJa = document.getElementById('example-ja');
  const exampleReading = document.getElementById('example-reading');
  const exampleMeaning = document.getElementById('example-meaning');

  if (card.example && card.example.ja) {
    if (exampleBox) exampleBox.style.display = 'block';
    if (exampleJa) exampleJa.textContent = card.example.ja;
    if (exampleReading) {
      if (card.example.reading && card.example.romaji) {
        exampleReading.textContent = `${card.example.reading} (${card.example.romaji})`;
      } else if (card.example.reading) {
        exampleReading.textContent = card.example.reading;
      } else {
        exampleReading.textContent = '';
      }
    }
    if (exampleMeaning) exampleMeaning.textContent = card.example.meaning || '';
  } else if (exampleBox) {
    exampleBox.style.display = 'none';
  }

  updateDeckCounterUI();

  updateRatingButtonsUI(card.id);
}

function updateRatingButtonsUI(cardId) {
  const currentRating = getCardRating(cardId);
  const againBtn = document.getElementById('rate-again-btn');
  const hardBtn = document.getElementById('rate-hard-btn');
  const easyBtn = document.getElementById('rate-easy-btn');

  [againBtn, hardBtn, easyBtn].forEach(b => b?.classList.remove('active'));

  if (currentRating === 'learning') againBtn?.classList.add('active');
  else if (currentRating === 'doubt') hardBtn?.classList.add('active');
  else if (currentRating === 'mastered') easyBtn?.classList.add('active');
}

function updateProgressUI() {
  const stats = getMasteryStats(state.rawDeck);
  const fill = document.getElementById('progress-bar-fill');
  const percentText = document.getElementById('mastery-percent-text');
  const detailText = document.getElementById('mastery-detail-text');

  if (fill) {
    const ratio = Math.max(0, Math.min(1, stats.percent / 100));
    fill.style.transform = `scaleX(${ratio})`;
  }
  if (percentText) percentText.textContent = `${stats.percent}% Dikuasai`;
  if (detailText) detailText.textContent = `${stats.mastered}/${stats.total}`;

  updateDeckCounterUI();
}

function toggleCardFlip() {
  const cardElement = document.getElementById('flashcard-card');
  if (!cardElement) return;

  state.isFlipped = !state.isFlipped;
  if (state.isFlipped) {
    cardElement.classList.add('is-flipped');
  } else {
    cardElement.classList.remove('is-flipped');
  }
}

function nextCard() {
  if (!state.activeDeck.length) return;
  state.currentIndex = (state.currentIndex + 1) % state.activeDeck.length;
  renderCurrentCard();
}

function prevCard() {
  if (!state.activeDeck.length) return;
  state.currentIndex = (state.currentIndex - 1 + state.activeDeck.length) % state.activeDeck.length;
  renderCurrentCard();
}

function playCurrentAudio(btnEl = null) {
  if (!state.activeDeck.length) return;
  const card = state.activeDeck[state.currentIndex];
  // For Kanji cards, prefer phonetic reading (kana) because standalone ideographs
  // are frequently skipped or mispronounced by mobile TTS engines
  const text = (card.category === 'kanji' && card.reading)
    ? card.reading
    : (card.reading || card.character);
  const targetBtn = btnEl || document.getElementById('card-audio-btn') || document.getElementById('card-audio-back-btn');
  speakJapanese(text, targetBtn);
}

function rateCard(rating) {
  if (!state.activeDeck.length) return;
  const card = state.activeDeck[state.currentIndex];
  setCardRating(card.id, rating);
  updateRatingButtonsUI(card.id);
  updateProgressUI();

  setTimeout(() => {
    nextCard();
  }, 220);
}

function shuffleDeck() {
  if (state.activeDeck.length <= 1) return;

  for (let i = state.activeDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [state.activeDeck[i], state.activeDeck[j]] = [state.activeDeck[j], state.activeDeck[i]];
  }

  state.currentIndex = 0;
  renderCurrentCard();
  showToast('Urutan kartu diacak.');
}

function resetDeck() {
  if (!state.rawDeck.length) return;
  resetDeckMastery(state.rawDeck);
  updateProgressUI();
  updateRatingButtonsUI(state.activeDeck[state.currentIndex]?.id);
  showToast('Status hafalan direset.');
}

function updateDeckLabel() {
  const labelEl = document.getElementById('deck-active-label');
  if (!labelEl) return;

  const catNames = {
    hiragana: 'Hiragana',
    katakana: 'Katakana',
    kanji: 'Kanji',
    kotoba: 'Kotoba',
    jft: 'JFT-Basic'
  };

  const catName = catNames[state.category] || state.category;
  const levels = FILTER_CONFIG[state.category] || [];
  const currentLevelObj = levels.find(l => l.id === state.level);
  const levelLabel = currentLevelObj ? currentLevelObj.label : 'Semua';

  labelEl.textContent = `${catName} • ${levelLabel}`;
}

function renderSheetLevelChips() {
  const container = document.getElementById('sheet-level-chips');
  if (!container) return;

  const filters = FILTER_CONFIG[state.category] || [];
  container.innerHTML = '';

  filters.forEach(item => {
    const chip = document.createElement('button');
    chip.className = `sheet-level-chip ${item.id === state.level ? 'active' : ''}`;
    chip.dataset.level = item.id;
    chip.textContent = item.label;

    chip.addEventListener('click', async () => {
      container.querySelectorAll('.sheet-level-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.level = item.id;
      updateDeckLabel();
      await loadDeck();
      closeDeckModal();
    });

    container.appendChild(chip);
  });
}

function openDeckModal() {
  const catGrid = document.getElementById('sheet-category-grid');
  if (catGrid) {
    catGrid.querySelectorAll('.sheet-category-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === state.category);
    });
  }

  renderSheetLevelChips();
  if (window.deckSheetController) {
    window.deckSheetController.open();
  } else {
    const modal = document.getElementById('deck-modal');
    const scrim = document.getElementById('deck-scrim');
    if (modal) modal.classList.add('is-open', 'active');
    if (scrim) scrim.classList.add('is-open', 'active');
  }
}

function closeDeckModal() {
  if (window.deckSheetController) {
    window.deckSheetController.close();
  } else {
    const modal = document.getElementById('deck-modal');
    const scrim = document.getElementById('deck-scrim');
    if (modal) modal.classList.remove('is-open', 'active');
    if (scrim) scrim.classList.remove('is-open', 'active');
  }
}

function openQuizSettingsSheet() {
  const isListening = getQuizListeningMode();
  const modeTextBtn = document.getElementById('quiz-sheet-mode-text');
  const modeAudioBtn = document.getElementById('quiz-sheet-mode-audio');
  if (modeTextBtn) modeTextBtn.classList.toggle('active', !isListening);
  if (modeAudioBtn) modeAudioBtn.classList.toggle('active', isListening);

  syncQuizCountUI();

  if (window.quizSettingsSheetController) {
    window.quizSettingsSheetController.open();
  } else {
    const sheet = document.getElementById('quiz-settings-sheet');
    const scrim = document.getElementById('quiz-settings-scrim');
    if (sheet) sheet.classList.add('is-open');
    if (scrim) scrim.classList.add('is-open');
  }
}

function closeQuizSettingsSheet() {
  if (window.quizSettingsSheetController) {
    window.quizSettingsSheetController.close();
  } else {
    const sheet = document.getElementById('quiz-settings-sheet');
    const scrim = document.getElementById('quiz-settings-scrim');
    if (sheet) sheet.classList.remove('is-open');
    if (scrim) scrim.classList.remove('is-open');
  }
}

let dictVisibleCount = 60;
let currentFilteredList = [];

function renderDictionaryList(filterQuery = state.dictSearchQuery, resetPagination = true) {
  const container = document.getElementById('dict-list-container');
  if (!container) return;

  if (resetPagination) {
    dictVisibleCount = 60;
  }

  const q = (filterQuery || '').trim().toLowerCase();
  currentFilteredList = state.rawDeck.filter(card => {
    if (state.onlyUnmastered) {
      const rating = getCardRating(card.id);
      if (rating === 'mastered') return false;
    }
    if (!q) return true;
    const charMatch = (card.character || '').toLowerCase().includes(q);
    const readingMatch = (card.reading || '').toLowerCase().includes(q);
    const romajiMatch = (card.romaji || '').toLowerCase().includes(q);
    const idMatch = (card.meaning_id || '').toLowerCase().includes(q);
    const enMatch = (card.meaning_en || '').toLowerCase().includes(q);
    const onyomiMatch = (card.onyomi || '').toLowerCase().includes(q);
    const kunyomiMatch = (card.kunyomi || '').toLowerCase().includes(q);
    return charMatch || readingMatch || romajiMatch || idMatch || enMatch || onyomiMatch || kunyomiMatch;
  });

  if (currentFilteredList.length === 0) {
    const emptyMsg = state.onlyUnmastered && !q
      ? 'Semua materi pada kategori ini sudah dikuasai (Hafal).'
      : `Tidak ada entri yang cocok dengan kata kunci "${escapeHtml(q)}".`;
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 16px; color: var(--text-muted); font-size: 0.85rem;">
        ${emptyMsg}
      </div>
    `;
    return;
  }

  const visibleSlice = currentFilteredList.slice(0, dictVisibleCount);
  const fragment = document.createDocumentFragment();

  visibleSlice.forEach(card => {
    fragment.appendChild(createDictRow(card));
  });

  container.innerHTML = '';
  container.appendChild(fragment);

  // Progressive loading indicator for high volume datasets
  if (visibleSlice.length < currentFilteredList.length) {
    const loadMoreWrap = document.createElement('div');
    loadMoreWrap.style.cssText = 'text-align: center; padding: 16px 0 24px;';
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.className = 'pill-sub';
    loadMoreBtn.style.cssText = 'margin: 0 auto; display: inline-block; cursor: pointer; padding: 8px 18px; font-size: 0.8rem;';
    loadMoreBtn.textContent = `Muat Lebih Banyak (${visibleSlice.length} dari ${currentFilteredList.length})`;
    loadMoreBtn.addEventListener('click', () => {
      dictVisibleCount += 60;
      renderDictionaryList(state.dictSearchQuery, false);
    });
    loadMoreWrap.appendChild(loadMoreBtn);
    container.appendChild(loadMoreWrap);
  }
}

function createDictRow(card) {
  const rating = getCardRating(card.id);
  let statusLabel = 'Belum';
  let statusClass = 'learning';
  if (rating === 'mastered') {
    statusLabel = 'Hafal';
    statusClass = 'mastered';
  } else if (rating === 'doubt') {
    statusLabel = 'Ragu';
    statusClass = 'doubt';
  }

  const row = document.createElement('div');
  row.className = 'dict-item-row';

  const charCol = document.createElement('div');
  charCol.className = 'dict-char-col';
  charCol.innerHTML = `
    <div class="dict-char">${escapeHtml(card.character)}</div>
    <div class="dict-romaji">${escapeHtml(card.romaji || card.reading || '')}</div>
  `;

  const infoCol = document.createElement('div');
  infoCol.className = 'dict-info-col';

  let subinfoText = '';
  if (card.onyomi || card.kunyomi) {
    const onStr = card.onyomi_romaji ? `${card.onyomi} (${card.onyomi_romaji})` : (card.onyomi || '-');
    const kunStr = card.kunyomi_romaji ? `${card.kunyomi} (${card.kunyomi_romaji})` : (card.kunyomi || '-');
    subinfoText = `On: ${onStr} | Kun: ${kunStr}`;
  } else if (card.reading) {
    subinfoText = `Kategori: ${card.badge || state.category}`;
  }

  infoCol.innerHTML = `
    <div class="dict-meaning">${escapeHtml(card.meaning_id || card.meaning_en || '-')}</div>
    ${subinfoText ? `<div class="dict-subinfo">${escapeHtml(subinfoText)}</div>` : ''}
    <div style="margin-top: 4px;">
      <span class="dict-status-tag ${statusClass}">${statusLabel}</span>
    </div>
  `;

  const audioBtn = document.createElement('button');
  audioBtn.className = 'dict-audio-btn';
  audioBtn.title = 'Dengarkan suara';
  audioBtn.setAttribute('aria-label', `Dengarkan pelafalan ${card.character}`);
  audioBtn.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>
  `;
  audioBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const textToSpeak = (card.category === 'kanji' && card.reading) ? card.reading : (card.reading || card.character);
    speakJapanese(textToSpeak, audioBtn);
  });

  row.appendChild(charCol);
  row.appendChild(infoCol);
  row.appendChild(audioBtn);

  return row;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function setupEventListeners() {
  const cardElement = document.getElementById('flashcard-card');
  const prevBtn = document.getElementById('prev-card-btn');
  const nextBtn = document.getElementById('next-card-btn');
  const audioBtn = document.getElementById('card-audio-btn');
  const audioBackBtn = document.getElementById('card-audio-back-btn');
  const shuffleBtn = document.getElementById('shuffle-deck-btn');
  const resetBtn = document.getElementById('reset-deck-btn');
  const unmasteredToggle = document.getElementById('unmastered-only-toggle');

  const againBtn = document.getElementById('rate-again-btn');
  const hardBtn = document.getElementById('rate-hard-btn');
  const easyBtn = document.getElementById('rate-easy-btn');

  const botnav = document.getElementById('floating-botnav');
  const quizRetryBtn = document.getElementById('quiz-retry-btn');
  const dictSearchInput = document.getElementById('dict-search-input');

  if (botnav) {
    initTabbar(botnav, { blur: 6, aberration: 0 });
  }

  // Defer non-critical decorative glass attachments to idle time to minimize TBT
  const deferDecorations = () => {
    document.querySelectorAll('.lg:not(.lg-tabbar):not(.lg-lens):not(.lg-sheet):not(.lg-knob):not(.lg-thumb)').forEach(el => LG.attach(el));
    document.querySelectorAll('.lg-switch').forEach(initSwitch);
    document.querySelectorAll('.lg-slider').forEach(s => initSlider(s));
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(deferDecorations, { timeout: 800 });
  } else {
    setTimeout(deferDecorations, 80);
  }

  const deckSheet = document.getElementById('deck-modal');
  const deckScrim = document.getElementById('deck-scrim');
  if (deckSheet && deckScrim) {
    window.deckSheetController = initSheet(deckSheet, deckScrim);
  }

  const installSheet = document.getElementById('install-modal');
  const installScrim = document.getElementById('install-scrim');
  if (installSheet && installScrim) {
    window.installSheetController = initSheet(installSheet, installScrim);
  }

  const quizSettingsSheet = document.getElementById('quiz-settings-sheet');
  const quizSettingsScrim = document.getElementById('quiz-settings-scrim');
  if (quizSettingsSheet && quizSettingsScrim) {
    window.quizSettingsSheetController = initSheet(quizSettingsSheet, quizSettingsScrim);
  }

  const writingSheet = document.getElementById('writing-char-sheet');
  const writingScrim = document.getElementById('writing-char-scrim');
  if (writingSheet && writingScrim) {
    window.writingCharSheetController = initSheet(writingSheet, writingScrim);
  }

  const quizSettingsBtn = document.getElementById('quiz-settings-btn');
  if (quizSettingsBtn) {
    quizSettingsBtn.addEventListener('click', openQuizSettingsSheet);
  }

  const modeTextBtn = document.getElementById('quiz-sheet-mode-text');
  const modeAudioBtn = document.getElementById('quiz-sheet-mode-audio');
  if (modeTextBtn && modeAudioBtn) {
    modeTextBtn.addEventListener('click', () => {
      setQuizListeningMode(false);
      modeTextBtn.classList.add('active');
      modeAudioBtn.classList.remove('active');
      updateModeBadgeUI();
    });
    modeAudioBtn.addEventListener('click', () => {
      setQuizListeningMode(true);
      modeAudioBtn.classList.add('active');
      modeTextBtn.classList.remove('active');
      updateModeBadgeUI();
    });
  }

  const quizCountChips = document.getElementById('quiz-sheet-count-chips');
  if (quizCountChips) {
    quizCountChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.quiz-sheet-count-chip');
      if (!chip) return;
      const count = parseInt(chip.dataset.count, 10);
      if (isNaN(count)) return;
      state.quizQuestionCount = saveQuizQuestionCount(count);
      syncQuizCountUI();
      if (state.activePage === 'quiz') {
        initQuiz(state.rawDeck, state.quizQuestionCount);
      }
      showToast(`Jumlah soal diatur ke ${state.quizQuestionCount} soal`);
    });
  }

  if (quizRetryBtn) {
    quizRetryBtn.addEventListener('click', () => initQuiz(state.rawDeck, state.quizQuestionCount));
  }

  if (dictSearchInput) {
    dictSearchInput.addEventListener('input', (e) => {
      state.dictSearchQuery = e.target.value;
      renderDictionaryList(state.dictSearchQuery);
    });
  }

  if (cardElement) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isSwiped = false;

    cardElement.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
      touchStartTime = Date.now();
      isSwiped = false;
    }, { passive: true });

    cardElement.addEventListener('touchend', (e) => {
      const diffX = e.changedTouches[0].screenX - touchStartX;
      const diffY = e.changedTouches[0].screenY - touchStartY;
      const elapsed = Date.now() - touchStartTime;

      if (elapsed < 600 && Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
        isSwiped = true;
        if (diffX < 0) {
          nextCard();
        } else {
          prevCard();
        }
      }
    }, { passive: true });

    cardElement.addEventListener('click', (e) => {
      if (e.target.closest('.card-audio-btn')) return;
      if (isSwiped) {
        isSwiped = false;
        return;
      }
      toggleCardFlip();
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', prevCard);
  if (nextBtn) nextBtn.addEventListener('click', nextCard);

  if (audioBtn) {
    audioBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playCurrentAudio(audioBtn);
    });
  }

  if (audioBackBtn) {
    audioBackBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playCurrentAudio(audioBackBtn);
    });
  }

  if (againBtn) againBtn.addEventListener('click', () => rateCard('learning'));
  if (hardBtn) hardBtn.addEventListener('click', () => rateCard('doubt'));
  if (easyBtn) easyBtn.addEventListener('click', () => rateCard('mastered'));

  if (shuffleBtn) shuffleBtn.addEventListener('click', shuffleDeck);
  if (resetBtn) resetBtn.addEventListener('click', resetDeck);

  if (unmasteredToggle) {
    const handleToggle = () => {
      let nextState = false;
      if (unmasteredToggle.tagName === 'BUTTON') {
        const isCurrentlyChecked = unmasteredToggle.getAttribute('aria-checked') === 'true';
        nextState = !isCurrentlyChecked;
        unmasteredToggle.setAttribute('aria-checked', String(nextState));
      } else {
        nextState = !unmasteredToggle.checked;
        unmasteredToggle.checked = nextState;
      }
      state.onlyUnmastered = nextState;
      applyFilters();
      state.currentIndex = 0;
      renderCurrentCard();
      if (state.activePage === 'list') {
        renderDictionaryList(state.dictSearchQuery, true);
      }
    };

    unmasteredToggle.addEventListener('click', handleToggle);
    unmasteredToggle.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleToggle();
      }
    });

    const wrapLabel = document.getElementById('toggle-unmastered-wrap')?.querySelector('.toggle-unmastered-label');
    if (wrapLabel) {
      wrapLabel.addEventListener('click', handleToggle);
    }
  }

  const deckSelectorBtn = document.getElementById('deck-selector-btn');
  const closeDeckModalBtn = document.getElementById('close-deck-modal-btn');
  const deckModal = document.getElementById('deck-modal');
  const sheetCategoryGrid = document.getElementById('sheet-category-grid');

  if (deckSelectorBtn) {
    deckSelectorBtn.addEventListener('click', openDeckModal);
  }

  if (closeDeckModalBtn) {
    closeDeckModalBtn.addEventListener('click', closeDeckModal);
  }

  if (deckModal) {
    deckModal.addEventListener('click', (e) => {
      if (e.target === deckModal) closeDeckModal();
    });
  }

  if (sheetCategoryGrid) {
    sheetCategoryGrid.addEventListener('click', async (e) => {
      const btn = e.target.closest('.sheet-category-btn');
      if (!btn) return;

      sheetCategoryGrid.querySelectorAll('.sheet-category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      state.category = btn.dataset.category;
      state.level = 'all';

      renderSheetLevelChips();
      updateDeckLabel();
      await loadDeck();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
    if (state.activePage !== 'cards') return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        toggleCardFlip();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextCard();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        prevCard();
        break;
      case 'Digit1':
      case 'Numpad1':
        rateCard('learning');
        break;
      case 'Digit2':
      case 'Numpad2':
        rateCard('doubt');
        break;
      case 'Digit3':
      case 'Numpad3':
        rateCard('mastered');
        break;
      case 'KeyS':
        shuffleDeck();
        break;
      case 'KeyA':
        playCurrentAudio();
        break;
    }
  });

  // Infinite scroll auto-loader for dictionary list
  window.addEventListener('scroll', () => {
    if (state.activePage !== 'list') return;
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 400) {
      if (dictVisibleCount < currentFilteredList.length) {
        dictVisibleCount += 60;
        renderDictionaryList(state.dictSearchQuery, false);
      }
    }
  }, { passive: true });

  initQuizHeaderControls();
  updateDeckLabel();
}

function initQuizHeaderControls() {
  const countSelect = document.getElementById('quiz-count-select');
  if (countSelect) {
    countSelect.value = state.quizQuestionCount.toString();
    countSelect.addEventListener('change', (e) => {
      const val = parseInt(e.target.value, 10);
      state.quizQuestionCount = saveQuizQuestionCount(val);
      syncQuizCountUI();
      if (state.activePage === 'quiz') {
        initQuiz(state.rawDeck, state.quizQuestionCount);
        showToast(`Jumlah soal diatur ke ${state.quizQuestionCount} soal`);
      }
    });
  }
}

function syncQuizCountUI() {
  const current = state.quizQuestionCount;
  const countSelect = document.getElementById('quiz-count-select');
  if (countSelect) {
    countSelect.value = current.toString();
  }
  const countBtns = document.querySelectorAll('.quiz-sheet-count-chip');
  countBtns.forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.count, 10) === current);
  });
}

function initSettingsPage() {
  const darkBtn = document.getElementById('theme-btn-dark');
  const lightBtn = document.getElementById('theme-btn-light');
  const accentGrid = document.getElementById('accent-palette-grid');
  const exportBtn = document.getElementById('settings-export-btn');
  const importBtn = document.getElementById('settings-import-btn');
  const importInput = document.getElementById('settings-import-file-input');
  const resetBtn = document.getElementById('settings-reset-btn');

  if (darkBtn) {
    darkBtn.addEventListener('click', () => {
      if (state.theme === 'dark') return;
      state.theme = 'dark';
      saveTheme('dark');
      applyTheme('dark');
      showToast('Mode Gelap Aktif');
    });
  }

  if (lightBtn) {
    lightBtn.addEventListener('click', () => {
      if (state.theme === 'light') return;
      state.theme = 'light';
      saveTheme('light');
      applyTheme('light');
      showToast('Mode Terang Aktif');
    });
  }

  if (accentGrid) {
    accentGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.accent-palette-btn');
      if (!btn || !btn.dataset.accent) return;

      const chosen = btn.dataset.accent;
      state.accent = chosen;
      saveAccent(chosen);
      applyAccent(chosen);

      const colorNames = {
        blue: 'Biru Pastel',
        pink: 'Pink Sakura',
        green: 'Hijau Matcha',
        red: 'Merah Koral',
        purple: 'Lavender Ungu',
        grayscale: 'Grayscale'
      };
      showToast(`Tema Warna: ${colorNames[chosen] || chosen}`);
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      try {
        const jsonContent = exportMasteryDataJSON();
        const dateStr = new Date().toISOString().slice(0, 10);
        const fileName = `ravencard-cadangan-${dateStr}.json`;
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Data cadangan berhasil diekspor.');
      } catch (err) {
        showToast('Gagal mengekspor data: ' + err.message);
      }
    });
  }

  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => {
      importInput.value = '';
      importInput.click();
    });

    importInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (readEvent) => {
        const content = readEvent.target?.result;
        if (typeof content !== 'string') return;

        const result = importMasteryDataJSON(content);
        if (result.success) {
          state.theme = getSavedTheme();
          applyTheme(state.theme);
          state.accent = getSavedAccent();
          applyAccent(state.accent);
          state.quizQuestionCount = getSavedQuizQuestionCount();
          syncQuizCountUI();
          updateProgressUI();
          updateSettingsBackupStatus();
          showToast(`Berhasil memulihkan ${result.count} data kartu.`);
        } else {
          showToast(result.error || 'Gagal memulihkan berkas.');
        }
      };
      reader.onerror = () => {
        showToast('Gagal membaca berkas cadangan.');
      };
      reader.readAsText(file);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const confirmed = window.confirm('Hapus seluruh riwayat belajar di perangkat ini? Tindakan ini tidak dapat dibatalkan.');
      if (confirmed) {
        resetAllMastery();
        updateProgressUI();
        updateSettingsBackupStatus();
        showToast('Semua riwayat belajar telah dihapus.');
      }
    });
  }

  updateSettingsBackupStatus();
  syncQuizCountUI();
}

function updateSettingsBackupStatus() {
  const detailEl = document.getElementById('settings-storage-count');
  if (!detailEl) return;
  const stats = getOverallMasteryCount();
  detailEl.textContent = `${stats.total} kartu (${stats.mastered} paham, ${stats.doubt} ragu, ${stats.learning} lagi)`;
}

function renderSettingsPage() {
  updateSettingsBackupStatus();
  applyAccent(state.accent);
  applyTheme(state.theme);
  syncQuizCountUI();
}

// Liquid glass refraction and normal map engine based on Snell's Law
const LG = (() => {
  const isChromium = !!navigator.userAgentData?.brands?.some(b => /Chromium/.test(b.brand));
  const N = 1.5;                                        // indeks bias kaca
  const RATIO = 0.9;                                    // tebal kaca / lebar tepi
  const MAX_DEV = Math.tan(Math.PI / 2 - Math.asin(1 / N));
  let uid = 0;

  const mapCache = new Map();

  // Peta displacement: tepi cembung (squircle), sudut bias dihitung dengan hukum Snell.
  function buildMap(w, h, radius, bezel) {
    const key = `${w}|${h}|${radius}|${bezel}`;
    if (mapCache.has(key)) {
      return mapCache.get(key);
    }
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d'), img = ctx.createImageData(w, h), px = img.data;
    const hw = w / 2, hh = h / 2, r = Math.min(radius, hw, hh);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const dx = x + .5 - hw, dy = y + .5 - hh;
      const qx = Math.abs(dx) - (hw - r), qy = Math.abs(dy) - (hh - r);
      const ox = Math.max(qx, 0), oy = Math.max(qy, 0), out = Math.hypot(ox, oy);
      const depth = r - out - Math.min(Math.max(qx, qy), 0);   // jarak ke tepi, di dalam bentuk
      let g = 0, nx = 0, ny = 0;
      if (depth > 0 && depth < bezel) {
        const u = 1 - Math.max(depth, .5) / bezel;
        const a = Math.atan(RATIO * u ** 3 / (1 - u ** 4) ** .75);
        g = Math.tan(a - Math.asin(Math.sin(a) / N)) / MAX_DEV;
        if (out > 0) { nx = Math.sign(dx) * ox / out; ny = Math.sign(dy) * oy / out; }
        else if (qx > qy) nx = Math.sign(dx) || 1; else ny = Math.sign(dy) || 1;
      }
      const i = (y * w + x) * 4;
      px[i] = 128 - nx * g * 127; px[i + 1] = 128 - ny * g * 127; px[i + 2] = 128; px[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const dataUrl = c.toDataURL();
    mapCache.set(key, dataUrl);
    return dataUrl;
  }

  function attach(el, opts = {}) {
    const o = { bezel: 40, strength: 1.3, blur: 0.5, aberration: 6, saturate: 1.7, fallbackBlur: 2, forceFallback: false, ...opts };
    const id = 'lg-f' + (++uid);
    const hasAberration = o.aberration > 0;
    if (hasAberration) {
      document.body.insertAdjacentHTML('beforeend',
        `<svg width="0" height="0" aria-hidden="true" style="position:absolute;pointer-events:none">
          <filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
            <feImage preserveAspectRatio="none" result="map"/>
            <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" result="dR"/>
            <feColorMatrix in="dR" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="R"/>
            <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" result="dG"/>
            <feColorMatrix in="dG" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="G"/>
            <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" result="dB"/>
            <feColorMatrix in="dB" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="B"/>
            <feBlend in="R" in2="G" mode="screen" result="RG"/>
            <feBlend in="RG" in2="B" mode="screen"/>
          </filter></svg>`);
    } else {
      document.body.insertAdjacentHTML('beforeend',
        `<svg width="0" height="0" aria-hidden="true" style="position:absolute;pointer-events:none">
          <filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
            <feImage preserveAspectRatio="none" result="map"/>
            <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" result="d"/>
          </filter></svg>`);
    }
    const svg = document.body.lastElementChild;
    const filterEl = svg.firstElementChild;
    const img = filterEl.querySelector('feImage');
    const dispMaps = filterEl.querySelectorAll('feDisplacementMap');
    const active = () => isChromium && !o.forceFallback;
    let last = '';

    function apply() {
      const w = el.offsetWidth, h = el.offsetHeight;
      if (!w || !h) return;
      const rs = getComputedStyle(el).borderTopLeftRadius;
      const r = rs.endsWith('%') ? Math.min(w, h) * parseFloat(rs) / 100 : (parseFloat(rs) || h / 2);
      const ratio = parseFloat(el.dataset.lgRatio) || .45;
      const B = Math.max(2, Math.min(o.bezel, ratio * Math.min(w, h), Math.min(w, h) / 2 - 1));
      const key = [w, h, r, B].join('|');
      if (key !== last) {
        last = key;
        img.setAttribute('href', buildMap(w, h, r, B));
        img.setAttribute('width', w); img.setAttribute('height', h);
      }
      const S = 2 * o.strength * B;
      if (hasAberration && dispMaps.length === 3) {
        const ab = o.aberration / 100;
        dispMaps[0].setAttribute('scale', S * (1 + ab));
        dispMaps[1].setAttribute('scale', S);
        dispMaps[2].setAttribute('scale', S * (1 - ab));
      } else if (dispMaps.length > 0) {
        dispMaps[0].setAttribute('scale', S);
      }
      const blurVal = el.dataset.lgBlur !== undefined ? parseFloat(el.dataset.lgBlur) : o.blur;
      const satVal = el.dataset.lgSaturate !== undefined ? parseFloat(el.dataset.lgSaturate) : o.saturate;
      const fallBlur = el.dataset.lgFallbackBlur !== undefined ? parseFloat(el.dataset.lgFallbackBlur) : o.fallbackBlur;
      el.style.backdropFilter = el.style.webkitBackdropFilter = active()
        ? `url(#${id}) blur(${blurVal}px) saturate(${satVal})`
        : `blur(${fallBlur}px) saturate(${satVal})`;
    }

    const ro = new ResizeObserver(apply); ro.observe(el); apply();
    return {
      update(p) { Object.assign(o, p); apply(); },
      destroy() { ro.disconnect(); svg.remove(); el.style.backdropFilter = el.style.webkitBackdropFilter = ''; },
      get active() { return active(); }
    };
  }
  return { attach, isChromium };
})();

function initTabbar(dock, opts = {}) {
  const bar = dock.querySelector('.lg-tabbar'), lens = dock.querySelector('.lg-lens'), pill = bar.querySelector('.lg-pill');
  if (!bar || !lens || !pill) return null;
  const tabs = [...bar.querySelectorAll('.lg-tab')], PAD = 4;
  const glass = LG.attach(lens, { strength: 1.0, blur: 0, aberration: 0, ...(opts.lens || {}) });
  const barBlur = opts.blur !== undefined ? opts.blur : (parseFloat(bar.dataset.lgBlur) || 6);
  LG.attach(bar, { bezel: 36, strength: 0.6, blur: barBlur, aberration: 0, saturate: 1.7, fallbackBlur: barBlur, ...opts });
  const cur = () => bar.querySelector('[aria-current="page"]');
  const place = () => {
    const t = cur();
    if (!t) return;
    pill.style.width = t.offsetWidth + 'px';
    pill.style.setProperty('--x', t.offsetLeft + 'px');
  };
  window.updateLgTabbar = place;

  const select = i => {
    if (!tabs[i]) return;
    tabs.forEach(t => t.removeAttribute('aria-current'));
    tabs[i].setAttribute('aria-current', 'page');
    place();
    const targetPage = tabs[i].dataset.page;
    if (targetPage && targetPage !== state.activePage) {
      switchPage(targetPage);
    }
  };
  const indexAt = x => Math.max(0, Math.min(tabs.length - 1, Math.floor((x - PAD) / (tabs[0].offsetWidth || 1))));
  tabs.forEach((t, i) => t.addEventListener('click', e => { if (e.detail === 0) select(i); }));

  let d = null;
  const moveLens = clientX => {
    const lw = lens.offsetWidth;
    const x = Math.max(PAD, Math.min(bar.offsetWidth - PAD - lw, clientX - d.left - lw / 2));
    d.x = x;
    lens.style.setProperty('--lx', x + 'px');
    const over = indexAt(x + lw / 2);
    tabs.forEach((t, i) => t.classList.toggle('is-over', i === over));
  };
  const lift = () => {
    if (!d || d.lifted) return;
    d.lifted = true;
    const t = cur();
    if (!t) return;
    lens.style.width = t.offsetWidth + 'px';
    lens.style.transition = 'none';
    lens.style.setProperty('--lx', t.offsetLeft + 'px');
    void lens.offsetWidth;
    lens.style.transition = '';
    dock.classList.add('is-lifted');
    moveLens(d.clientX);
  };

  bar.addEventListener('pointerdown', e => {
    if (e.button) return;
    d = { id: e.pointerId, left: bar.getBoundingClientRect().left, startX: e.clientX, clientX: e.clientX, lifted: false };
    d.timer = setTimeout(lift, 110);
    try { bar.setPointerCapture(e.pointerId); } catch (_) {}
    dock.classList.add('is-pressed');
  });
  bar.addEventListener('pointermove', e => {
    if (!d || e.pointerId !== d.id) return;
    d.clientX = e.clientX;
    if (!d.lifted) {
      if (Math.abs(e.clientX - d.startX) < 6) return;
      clearTimeout(d.timer); lift();
    }
    dock.classList.add('is-dragging');
    moveLens(e.clientX);
  });
  const end = e => {
    if (!d || e.pointerId !== d.id) return;
    clearTimeout(d.timer);
    const was = d; d = null;
    dock.classList.remove('is-pressed', 'is-dragging');
    try { bar.releasePointerCapture(e.pointerId); } catch (_) {}
    const i = was.lifted ? indexAt(was.x + lens.offsetWidth / 2) : indexAt(e.clientX - was.left);
    select(i);
    if (was.lifted) {
      lens.style.setProperty('--lx', tabs[i].offsetLeft + 'px');
      tabs.forEach((t, j) => t.classList.toggle('is-over', j === i));
      setTimeout(() => { dock.classList.remove('is-lifted'); tabs.forEach(t => t.classList.remove('is-over')); }, 280);
    }
  };
  ['pointerup', 'pointercancel'].forEach(n => bar.addEventListener(n, end));
  bar.addEventListener('contextmenu', e => e.preventDefault());

  pill.style.transition = 'none'; place();
  requestAnimationFrame(() => requestAnimationFrame(() => { pill.style.transition = ''; }));
  new ResizeObserver(place).observe(bar);
  return glass;
}

function initSwitch(sw) {
  if (!sw) return;
  const knob = sw.querySelector('.lg-knob'), KW = 46;
  if (knob) LG.attach(knob, { bezel: 12, strength: 1.2, blur: 0, aberration: 8 });
  const set = v => {
    sw.setAttribute('aria-checked', String(v));
    sw.dispatchEvent(new CustomEvent('lgchange', { detail: v }));
  };
  let d = null;
  sw.addEventListener('pointerdown', e => {
    const r = sw.getBoundingClientRect();
    d = { id: e.pointerId, x0: e.clientX, left: r.left, w: r.width, moved: false };
    try { sw.setPointerCapture(e.pointerId); } catch (_) {}
    sw.classList.add('is-down');
  });
  sw.addEventListener('pointermove', e => {
    if (!d || e.pointerId !== d.id) return;
    if (!d.moved && Math.abs(e.clientX - d.x0) < 4) return;
    d.moved = true;
    sw.classList.add('is-drag');
    d.x = Math.max(2, Math.min(d.w - 2 - KW, e.clientX - d.left - KW / 2));
    if (knob) knob.style.setProperty('--kx', d.x + 'px');
  });
  const end = e => {
    if (!d || e.pointerId !== d.id) return;
    const was = d;
    d = null;
    sw.classList.remove('is-down', 'is-drag');
    try { sw.releasePointerCapture(e.pointerId); } catch (_) {}
    const v = was.moved ? was.x > (was.w - KW) / 2 : sw.getAttribute('aria-checked') !== 'true';
    if (knob) knob.style.removeProperty('--kx');
    set(v);
  };
  ['pointerup', 'pointercancel'].forEach(n => sw.addEventListener(n, end));
  sw.addEventListener('click', e => {
    if (e.detail === 0) set(sw.getAttribute('aria-checked') !== 'true');
  });
}

function initSlider(s, onChange, opts = {}) {
  if (!s) return;
  const thumb = s.querySelector('.lg-thumb');
  const out = s.closest('.writing-config-group')?.querySelector('#writing-rep-display') || s.closest('.lg-srow')?.querySelector('output');
  const min = +s.dataset.min || 10, max = +s.dataset.max || 30, step = +s.dataset.step || 1;
  let v = Math.min(max, Math.max(min, +(s.dataset.value ?? 20))), down = false;
  const T = 38;
  const sliderOpts = typeof onChange === 'object' ? onChange : (opts || {});
  const sliderBlur = sliderOpts.blur !== undefined ? sliderOpts.blur : (parseFloat(s.dataset.lgBlur) || 0);
  if (thumb) {
    LG.attach(thumb, { strength: 1.1, blur: sliderBlur, aberration: 0, ...sliderOpts });
  }
  const render = () => {
    const p = (v - min) / (max - min);
    s.style.setProperty('--p', p);
    s.setAttribute('aria-valuenow', v);
    s.dataset.value = v;
    if (out) out.textContent = v + (s.dataset.unit || '');
    if (typeof onChange === 'function') {
      onChange(v);
    }
    s.dispatchEvent(new CustomEvent('lgchange', { detail: v }));
  };
  const fromX = x => {
    const r = s.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (x - r.left - T / 2) / (r.width - T)));
    v = Math.round((min + p * (max - min)) / step) * step;
    render();
  };
  s.addEventListener('pointerdown', e => {
    down = true;
    try { s.setPointerCapture(e.pointerId); } catch (_) {}
    s.classList.add('is-down');
    fromX(e.clientX);
  });
  s.addEventListener('pointermove', e => {
    if (down) fromX(e.clientX);
  });
  ['pointerup', 'pointercancel'].forEach(n => s.addEventListener(n, () => {
    down = false;
    s.classList.remove('is-down');
    try { s.releasePointerCapture(e?.pointerId); } catch (_) {}
  }));
  s.addEventListener('keydown', e => {
    const k = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step }[e.key];
    if (k) {
      v = Math.max(min, Math.min(max, v + k));
      render();
      e.preventDefault();
    } else if (e.key === 'Home') {
      v = min;
      render();
    } else if (e.key === 'End') {
      v = max;
      render();
    }
  });
  render();
}

function initSheet(sheet, scrim) {
  if (!sheet || !scrim) return null;
  let attached = false;
  const ensureAttached = () => {
    if (!attached) {
      attached = true;
      LG.attach(sheet, { bezel: 16, strength: 0.8, blur: 10, aberration: 0 });
    }
  };

  const head = sheet.querySelector('.lg-sheet-head');
  const open = () => {
    ensureAttached();
    sheet.classList.add('is-open', 'active');
    scrim.classList.add('is-open', 'active');
    sheet.querySelector('h3')?.focus({ preventScroll: true });
  };
  const close = () => {
    sheet.classList.remove('is-open', 'active');
    scrim.classList.remove('is-open', 'active');
    sheet.style.removeProperty('--dy');
  };
  scrim.addEventListener('click', close);
  sheet.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', close));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && (sheet.classList.contains('is-open') || sheet.classList.contains('active'))) close();
  });
  let g = null;
  if (head) {
    head.addEventListener('pointerdown', e => {
      if (e.target.closest('button')) return;
      g = { id: e.pointerId, y0: e.clientY, t: performance.now(), dy: 0 };
      try { head.setPointerCapture(e.pointerId); } catch (_) {}
      sheet.classList.add('is-drag');
    });
    head.addEventListener('pointermove', e => {
      if (!g || e.pointerId !== g.id) return;
      g.dy = Math.max(0, e.clientY - g.y0);
      sheet.style.setProperty('--dy', g.dy + 'px');
    });
    const up = e => {
      if (!g || e.pointerId !== g.id) return;
      const was = g;
      g = null;
      sheet.classList.remove('is-drag');
      try { head.releasePointerCapture(e.pointerId); } catch (_) {}
      if (was.dy > 90 || was.dy / (performance.now() - was.t) > 0.6) close();
      else sheet.style.removeProperty('--dy');
    };
    ['pointerup', 'pointercancel'].forEach(n => head.addEventListener(n, up));
  }

  // Handle external class toggling (e.g. from pwa.js)
  const obs = new MutationObserver(() => {
    const hasActive = sheet.classList.contains('active');
    const hasIsOpen = sheet.classList.contains('is-open');
    if (hasActive && !hasIsOpen) {
      open();
    } else if (!hasActive && hasIsOpen) {
      close();
    }
  });
  obs.observe(sheet, { attributes: true, attributeFilter: ['class'] });

  return { open, close };
}

window.LG = LG;
window.initSheet = initSheet;
window.initSlider = initSlider;
