import { speakJapanese } from './audio.js';

let quizDeck = [];
let currentIndex = 0;
let correctCount = 0;
let isAnswerLocked = false;

export function initQuiz(deck) {
  if (!deck || deck.length < 4) {
    return false;
  }

  // Shuffle and select up to 10 random questions
  const pool = [...deck];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const questionCount = Math.min(10, pool.length);
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

  renderQuizStage();
  return true;
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

  const badge = document.getElementById('quiz-badge');
  const counter = document.getElementById('quiz-question-counter');
  const targetChar = document.getElementById('quiz-target-char');
  const audioBtn = document.getElementById('quiz-audio-btn');
  const optionsContainer = document.getElementById('quiz-options-container');

  if (badge) badge.textContent = target.badge || 'Kuis Bahasa Jepang';
  if (counter) counter.textContent = `Soal ${currentIndex + 1} / ${quizDeck.length}`;

  if (targetChar) {
    targetChar.textContent = target.character;
    if (target.character.length > 5) {
      targetChar.style.fontSize = 'clamp(2rem, 7vw, 3rem)';
    } else {
      targetChar.style.fontSize = '';
    }
  }

  if (audioBtn) {
    audioBtn.onclick = () => {
      const text = (target.category === 'kanji' && target.reading) ? target.reading : (target.reading || target.character);
      speakJapanese(text, audioBtn);
    };
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
  }, 1000);
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
    if (desc) desc.textContent = 'Penguasaan materi Anda pada deck ini telah mencapai 100%.';
  } else if (percent >= 70) {
    if (icon) icon.textContent = 'Bagus Sekali';
    if (desc) desc.textContent = 'Pemahaman Anda sudah solid. Lanjutkan ke materi berikutnya.';
  } else {
    if (icon) icon.textContent = 'Perlu Latihan';
    if (desc) desc.textContent = 'Ulangi beberapa kartu yang belum hafal untuk memperkuat ingatan.';
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
