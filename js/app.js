import { initPWA, showToast } from './pwa.js';
import { getDeckData } from './data-service.js';
import { speakJapanese } from './audio.js';
import { initQuiz } from './quiz.js';
import { initWriting } from './writing.js';
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
  saveAccent
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
  accent: getSavedAccent()
};

document.addEventListener('DOMContentLoaded', async () => {
  initPWA();
  initTheme();
  initAccent();
  initSettingsPage();
  setupEventListeners();
  initWriting();
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
    item.classList.toggle('active', item.dataset.page === pageName);
  });

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

  updateDeckCounterUI();

  if (pageName === 'cards') {
    renderCurrentCard();
  } else if (pageName === 'quiz') {
    initQuiz(state.rawDeck);
  } else if (pageName === 'list') {
    renderDictionaryList();
  } else if (pageName === 'settings') {
    renderSettingsPage();
  }
}

function updateDeckCounterUI() {
  const countIndicator = document.getElementById('deck-counter');
  if (!countIndicator) return;

  // Badge huruf/total huruf di page kuis dihilangkan sesuai permintaan user
  if (state.activePage === 'quiz') {
    countIndicator.classList.add('hidden');
    return;
  }

  // Tampilkan di page belajar dan kamus
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
    initQuiz(state.rawDeck);
  } else if (state.activePage === 'list') {
    renderDictionaryList();
  } else {
    renderCurrentCard();
  }

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
      if (toggle) toggle.checked = false;
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
      frontChar.style.fontSize = 'clamp(1.8rem, 6vw, 2.8rem)';
    } else if (card.character.length > 2) {
      frontChar.style.fontSize = 'clamp(2.4rem, 8vw, 3.6rem)';
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
  if (backChar) backChar.textContent = card.character;
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

  if (fill) fill.style.width = `${stats.percent}%`;
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
  const modal = document.getElementById('deck-modal');
  if (!modal) return;

  // Sync active category button in sheet
  const catGrid = document.getElementById('sheet-category-grid');
  if (catGrid) {
    catGrid.querySelectorAll('.sheet-category-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === state.category);
    });
  }

  renderSheetLevelChips();
  modal.classList.add('active');
}

function closeDeckModal() {
  const modal = document.getElementById('deck-modal');
  if (modal) modal.classList.remove('active');
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
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 16px; color: var(--text-muted); font-size: 0.85rem;">
        Tidak ada entri yang cocok dengan kata kunci "${escapeHtml(q)}".
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
    botnav.addEventListener('click', (e) => {
      const item = e.target.closest('.botnav-item');
      if (!item || !item.dataset.page) return;
      switchPage(item.dataset.page);
    });
  }

  if (quizRetryBtn) {
    quizRetryBtn.addEventListener('click', () => initQuiz(state.rawDeck));
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
    unmasteredToggle.addEventListener('change', (e) => {
      state.onlyUnmastered = e.target.checked;
      applyFilters();
      state.currentIndex = 0;
      renderCurrentCard();
    });
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

  setupBackupModal();
  updateDeckLabel();
}

function setupBackupModal() {
  const backupModalBtn = document.getElementById('backup-modal-btn');
  const closeBackupModalBtn = document.getElementById('close-backup-modal-btn');
  const backupModal = document.getElementById('backup-modal');
  const backupStatusDetail = document.getElementById('backup-status-detail');
  const exportBtn = document.getElementById('export-progress-btn');
  const importBtn = document.getElementById('import-progress-btn');
  const importInput = document.getElementById('import-backup-file-input');
  const resetAllBtn = document.getElementById('reset-all-progress-btn');

  function updateBackupStatusUI() {
    if (!backupStatusDetail) return;
    const stats = getOverallMasteryCount();
    backupStatusDetail.textContent = `${stats.total} kartu dinilai (${stats.mastered} paham, ${stats.doubt} ragu, ${stats.learning} lagi)`;
  }

  function openBackupModal() {
    if (!backupModal) return;
    updateBackupStatusUI();
    backupModal.classList.add('active');
  }

  function closeBackupModal() {
    if (!backupModal) return;
    backupModal.classList.remove('active');
  }

  if (backupModalBtn) {
    backupModalBtn.addEventListener('click', openBackupModal);
  }

  if (closeBackupModalBtn) {
    closeBackupModalBtn.addEventListener('click', closeBackupModal);
  }

  if (backupModal) {
    backupModal.addEventListener('click', (e) => {
      if (e.target === backupModal) closeBackupModal();
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
        showToast('Berkas cadangan berhasil diunduh!');
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
          updateProgressUI();
          const currentCard = state.activeDeck[state.currentIndex];
          if (currentCard) {
            updateRatingButtonsUI(currentCard.id);
          }
          updateBackupStatusUI();
          showToast(`Berhasil memulihkan ${result.count} data kartu!`);
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

  if (resetAllBtn) {
    resetAllBtn.addEventListener('click', () => {
      const confirmed = window.confirm('Apakah kamu yakin ingin mereset seluruh penilaian kartu? Tindakan ini tidak dapat dibatalkan.');
      if (confirmed) {
        resetAllMastery();
        updateProgressUI();
        const currentCard = state.activeDeck[state.currentIndex];
        if (currentCard) {
          updateRatingButtonsUI(currentCard.id);
        }
        updateBackupStatusUI();
        showToast('Semua riwayat penilaian telah direset.');
      }
    });
  }
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
        orange: 'Oranye Peach',
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
        showToast('Berkas cadangan berhasil diekspor!');
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
          updateProgressUI();
          updateSettingsBackupStatus();
          showToast(`Berhasil memulihkan ${result.count} data kartu!`);
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
      const confirmed = window.confirm('Apakah kamu yakin ingin mereset seluruh penilaian kartu? Tindakan ini tidak dapat dibatalkan.');
      if (confirmed) {
        resetAllMastery();
        updateProgressUI();
        updateSettingsBackupStatus();
        showToast('Semua riwayat penilaian telah direset.');
      }
    });
  }

  updateSettingsBackupStatus();
}

function updateSettingsBackupStatus() {
  const detailEl = document.getElementById('settings-storage-count');
  if (!detailEl) return;
  const stats = getOverallMasteryCount();
  detailEl.textContent = `${stats.total} kartu dinilai (${stats.mastered} paham, ${stats.doubt} ragu, ${stats.learning} lagi)`;
}

function renderSettingsPage() {
  updateSettingsBackupStatus();
  applyAccent(state.accent);
  applyTheme(state.theme);
}
