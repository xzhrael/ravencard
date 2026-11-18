import { speakJapanese } from './audio.js';
import { getSavedQuizQuestionCount } from './storage.js';

let quizDeck = [];
let currentIndex = 0;
let correctCount = 0;
let isAnswerLocked = false;
let isListeningMode = false;
let isModeToggleInitialized = false;

export function initQuiz(deck, targetCount = null) {
  if (!deck || deck.length < 4) {
    return false;
  }

  // Determine desired question count (constrained between 10 and 100)
  const configured = (typeof targetCount === 'number' && !isNaN(targetCount))
    ? targetCount
    : getSavedQuizQuestionCount();
  const clampedTarget = Math.max(10, Math.min(100, configured));

  // Shuffle and select up to requested question count (clamped to deck capacity)
  const pool = [...deck];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const questionCount = Math.min(clampedTarget, pool.length);
  quizDeck = pool.slice(0, questionCount).map(target => {
    // Pick 3 distractors from the rest of the pool
    const otherCandidates = pool.filter(item => item.id !== target.id);
    const distractors = pickRandomItems(otherCandidates, 3);
    const options = shuffleArray([target, ...distractors]);
    return { target, options };
  });

  currentIndex = 0;
  correctCount = 0;
  isAnswerLocked = false;

  setupQuizModeToggle();
  renderQuizStage();
  return true;
}

export function getCurrentQuizDeck() {
  return quizDeck;
}

function setupQuizModeToggle() {
  if (isModeToggleInitialized) return;
  isModeToggleInitialized = true;

  const modeBtn = document.getElementById('quiz-mode-toggle');
  const visualizer = document.getElementById('quiz-audio-visualizer');

  if (modeBtn) {
    modeBtn.addEventListener('click', () => {
      isListeningMode = !isListeningMode;
      updateModeButtonUI();
      renderCurrentQuestion();
    });
  }

  if (visualizer) {
    visualizer.addEventListener('click', () => {
      playCurrentQuestionAudio();
    });
    visualizer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playCurrentQuestionAudio();
      }
    });
  }
}

function updateModeButtonUI() {
  const modeBtn = document.getElementById('quiz-mode-toggle');
  const modeLabel = document.getElementById('quiz-mode-label');
  if (!modeBtn) return;

  if (isListeningMode) {
    modeBtn.classList.add('active');
    modeBtn.setAttribute('aria-pressed', 'true');
    if (modeLabel) modeLabel.textContent = 'Menyimak (Choukai)';
  } else {
    modeBtn.classList.remove('active');
    modeBtn.setAttribute('aria-pressed', 'false');
    if (modeLabel) modeLabel.textContent = 'Mode Teks';
  }
}

function playCurrentQuestionAudio() {
  if (currentIndex >= quizDeck.length) return;
  const currentQ = quizDeck[currentIndex];
  const target = currentQ.target;
  const targetText = (target.category === 'kanji' && target.reading) ? target.reading : (target.reading || target.character);
  const visualizer = document.getElementById('quiz-audio-visualizer');

  if (visualizer) {
    visualizer.classList.add('playing');
    setTimeout(() => {
      visualizer.classList.remove('playing');
    }, 1200);
  }

  speakJapanese(targetText);
}

function renderQuizStage() {
  const resultCard = document.getElementById('quiz-result-card');
  const quizCard = document.querySelector('.quiz-card');
  if (resultCard) resultCard.classList.add('hidden');
  if (quizCard) quizCard.classList.remove('hidden');

  renderCurrentQuestion();
}

function renderCurrentQuestion() {
  if (currentIndex >= quizDeck.length) {
    showQuizResults();
    return;
  }

  isAnswerLocked = false;
  const currentQ = quizDeck[currentIndex];
  const target = currentQ.target;

  const counter = document.getElementById('quiz-question-counter');
  const targetChar = document.getElementById('quiz-target-char');
  const visualizer = document.getElementById('quiz-audio-visualizer');
  const promptEl = document.getElementById('quiz-prompt');
  const optionsContainer = document.getElementById('quiz-options-container');

  if (counter) counter.textContent = `Soal ${currentIndex + 1} / ${quizDeck.length}`;

  updateModeButtonUI();

  if (isListeningMode) {
    if (targetChar) {
      targetChar.classList.add('hidden');
      targetChar.textContent = target.character;
    }
    if (visualizer) {
      visualizer.classList.remove('hidden');
    }
    if (promptEl) {
      promptEl.textContent = 'Dengarkan audio, pilih jawaban yang tepat:';
    }
    // Auto-play audio on question load in listening mode
    playCurrentQuestionAudio();
  } else {
    if (targetChar) {
      targetChar.classList.remove('hidden');
      targetChar.textContent = target.character;
      if (target.character.length > 5) {
        targetChar.style.fontSize = 'clamp(2rem, 7vw, 3rem)';
      } else {
        targetChar.style.fontSize = '';
      }
    }
    if (visualizer) {
      visualizer.classList.add('hidden');
    }
    if (promptEl) {
      promptEl.textContent = 'Pilih arti atau cara baca yang benar:';
    }
  }

  if (optionsContainer) {
    optionsContainer.innerHTML = '';
    currentQ.options.forEach((option) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';

      // Determine clean label: Romaji for Kana, Indonesian meaning for Kanji/Kotoba
      let label = option.meaning_id || option.romaji || option.character;
      if (option.category === 'hiragana' || option.category === 'katakana') {
        label = `${option.romaji} (${option.character})`;
      } else if (option.romaji) {
        label = `${option.meaning_id} [${option.romaji}]`;
      }

      btn.textContent = label;
      btn.addEventListener('click', () => handleOptionSelection(btn, option, target));
      optionsContainer.appendChild(btn);
    });
  }
}

function handleOptionSelection(selectedBtn, selectedOption, target) {
  if (isAnswerLocked) return;
  isAnswerLocked = true;

  const isCorrect = selectedOption.id === target.id;
  const optionsContainer = document.getElementById('quiz-options-container');
  const allButtons = optionsContainer?.querySelectorAll('.quiz-option-btn') || [];
  const targetChar = document.getElementById('quiz-target-char');
  const visualizer = document.getElementById('quiz-audio-visualizer');

  // In listening mode, reveal target character upon answering for visual reinforcement
  if (isListeningMode && targetChar) {
    targetChar.classList.remove('hidden');
    if (visualizer) visualizer.classList.add('hidden');
  }

  const targetText = (target.category === 'kanji' && target.reading) ? target.reading : (target.reading || target.character);
  speakJapanese(targetText);

  if (isCorrect) {
    correctCount++;
    selectedBtn.classList.add('correct');
  } else {
    selectedBtn.classList.add('wrong');
    // Reveal correct choice
    allButtons.forEach(btn => {
      const matchTarget = (target.category === 'hiragana' || target.category === 'katakana')
        ? btn.textContent.includes(target.character)
        : btn.textContent.includes(target.meaning_id);
      if (matchTarget) {
        btn.classList.add('correct');
      }
    });
  }

  setTimeout(() => {
    currentIndex++;
    renderCurrentQuestion();
  }, 1200);
}

function showQuizResults() {
  const resultCard = document.getElementById('quiz-result-card');
  const quizCard = document.querySelector('.quiz-card');
  const scoreText = document.getElementById('quiz-result-score');
  const icon = document.getElementById('quiz-result-icon');
  const desc = document.getElementById('quiz-result-desc');

  if (quizCard) quizCard.classList.add('hidden');
  if (resultCard) resultCard.classList.remove('hidden');

  const total = quizDeck.length;
  const percent = Math.round((correctCount / total) * 100);

  if (scoreText) scoreText.textContent = `Skor: ${correctCount} / ${total} (${percent}%)`;

  if (percent === 100) {
    if (icon) icon.textContent = 'Sempurna';
    if (desc) desc.textContent = 'Semua soal dijawab dengan benar.';
  } else if (percent >= 70) {
    if (icon) icon.textContent = 'Bagus';
    if (desc) desc.textContent = 'Pemahaman sudah baik. Lanjutkan ke materi berikutnya.';
  } else {
    if (icon) icon.textContent = 'Perlu Latihan';
    if (desc) desc.textContent = 'Ulangi kartu yang belum hafal untuk memperkuat ingatan.';
  }
}

function pickRandomItems(array, count) {
  const pool = [...array];
  const picked = [];
  while (pool.length > 0 && picked.length < count) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
