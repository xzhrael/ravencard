import { getDeckData } from './data-service.js';
import { speakJapanese } from './audio.js';
import { showToast } from './pwa.js';
import { getStrokeOrder } from './stroke-data.js';

const writingState = {
  category: 'hiragana',
  level: 'all',
  totalReps: 20,
  currentRep: 1,
  charIndex: 0,
  deck: [],
  isDrawing: false,
  hasStrokes: false,
  strokeHistory: [],
  currentStroke: [],
  isPeeking: false,
  peekTimeout: null
};

let canvas = null;
let ctx = null;
let dpr = 1;
let canvasLogicalSize = 300;

export async function initWriting() {
  canvas = document.getElementById('writing-canvas');
  if (canvas) {
    ctx = canvas.getContext('2d');
    setupCanvasDpi();
    setupCanvasEvents();
  }

  setupConfigEvents();
  setupStageEvents();
  await loadWritingDeck();
}

function setupCanvasDpi() {
  if (!canvas) return;
  dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const newSize = Math.round(rect.width) || 300;

  // Rescale existing stroke points when device orientation changes (e.g. tablet rotation)
  if (canvasLogicalSize && canvasLogicalSize !== newSize && writingState.strokeHistory.length > 0) {
    const scaleFactor = newSize / canvasLogicalSize;
    writingState.strokeHistory.forEach(stroke => {
      stroke.forEach(pt => {
        pt.x *= scaleFactor;
        pt.y *= scaleFactor;
      });
    });
  }
  canvasLogicalSize = newSize;

  canvas.width = Math.round(newSize * dpr);
  canvas.height = Math.round(newSize * dpr);
  canvas.style.width = `${newSize}px`;
  canvas.style.height = `${newSize}px`;

  if (ctx) {
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }
}

function setupCanvasEvents() {
  if (!canvas) return;

  const getCanvasCoords = (e) => {
    const rect = canvas.getBoundingClientRect();
    const pressure = typeof e.pressure === 'number' && e.pressure > 0 ? e.pressure : 0.5;
    const isPen = e.pointerType === 'pen';
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      p: pressure,
      isPen: isPen
    };
  };

  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    writingState.isDrawing = true;

    const coords = getCanvasCoords(e);
    writingState.currentStroke = [coords];

    drawDot(coords.x, coords.y, coords.p, coords.isPen);
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!writingState.isDrawing) return;
    e.preventDefault();

    const coords = getCanvasCoords(e);
    writingState.currentStroke.push(coords);

    const pts = writingState.currentStroke;
    if (pts.length > 1) {
      const prev = pts[pts.length - 2];
      drawLine(prev, coords);
    }
  });

  const stopDrawing = (e) => {
    if (!writingState.isDrawing) return;
    writingState.isDrawing = false;

    if (e && e.pointerId) {
      try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
    }

    if (writingState.currentStroke.length > 0) {
      writingState.strokeHistory.push([...writingState.currentStroke]);
      writingState.currentStroke = [];
      writingState.hasStrokes = true;
      updateCanvasToolButtons();
    }
  };

  canvas.addEventListener('pointerup', stopDrawing);
  canvas.addEventListener('pointercancel', stopDrawing);
}

function getInkColor() {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  return isDark ? '#f3f4f8' : '#181c24';
}

function getStrokeWidth(pressure, isPen) {
  if (isPen && pressure > 0) {
    // Dynamic calligraphy brush weight for Huawei M-Pencil and Apple Pencil (3.5px to 11.5px)
    return Math.max(3, Math.min(12, 3.5 + pressure * 8.5));
  }
  return 7;
}

function drawDot(x, y, pressure, isPen) {
  if (!ctx) return;
  const radius = isPen && pressure > 0 ? Math.max(1.8, (3.5 + pressure * 8.5) / 2) : 3.5;
  ctx.fillStyle = getInkColor();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawLine(p1, p2) {
  if (!ctx) return;
  ctx.strokeStyle = getInkColor();
  ctx.lineWidth = getStrokeWidth(p2.p, p2.isPen);
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

function redrawCanvas() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvasLogicalSize, canvasLogicalSize);

  ctx.strokeStyle = getInkColor();
  ctx.fillStyle = getInkColor();

  writingState.strokeHistory.forEach(stroke => {
    if (!stroke.length) return;
    if (stroke.length === 1) {
      const p = stroke[0];
      drawDot(p.x, p.y, p.p, p.isPen);
      return;
    }
    for (let i = 1; i < stroke.length; i++) {
      drawLine(stroke[i - 1], stroke[i]);
    }
  });
}

export function clearWritingCanvas() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvasLogicalSize, canvasLogicalSize);
  writingState.strokeHistory = [];
  writingState.currentStroke = [];
  writingState.hasStrokes = false;
  updateCanvasToolButtons();
}

function undoLastStroke() {
  if (!writingState.strokeHistory.length) return;
  writingState.strokeHistory.pop();
  writingState.hasStrokes = writingState.strokeHistory.length > 0;
  redrawCanvas();
  updateCanvasToolButtons();
}

function updateCanvasToolButtons() {
  const undoBtn = document.getElementById('canvas-undo-btn');
  const clearBtn = document.getElementById('canvas-clear-btn');
  if (undoBtn) undoBtn.disabled = !writingState.hasStrokes;
  if (clearBtn) clearBtn.disabled = !writingState.hasStrokes;
}

function calculateGhostOpacity(currentRep, totalReps) {
  const fadeCutoff = Math.ceil(totalReps * 0.5);
  if (currentRep >= fadeCutoff) {
    return 0;
  }
  const progress = (currentRep - 1) / Math.max(1, fadeCutoff - 1);
  const maxOpacity = 0.55;
  return Math.max(0, maxOpacity * (1 - progress));
}

function updateGhostGuideUI() {
  const ghostEl = document.getElementById('canvas-ghost-glyph');
  const markersEl = document.getElementById('canvas-stroke-markers');
  const barFillEl = document.getElementById('writing-rep-bar-fill');
  const repCounterEl = document.getElementById('writing-rep-counter');

  const opacity = calculateGhostOpacity(writingState.currentRep, writingState.totalReps);

  if (ghostEl) {
    ghostEl.style.opacity = writingState.isPeeking ? '0.55' : opacity.toString();
  }

  // Stroke order markers fade gradually with the guide
  if (markersEl) {
    const markerOpacity = writingState.isPeeking ? 1 : (opacity > 0 ? Math.min(1, 0.25 + opacity * 0.75) : 0);
    markersEl.style.opacity = markerOpacity.toString();
  }

  const percent = Math.min(100, Math.round((writingState.currentRep / writingState.totalReps) * 100));
  if (barFillEl) {
    barFillEl.style.width = `${percent}%`;
  }

  if (repCounterEl) {
    repCounterEl.textContent = `Repetisi ${writingState.currentRep} / ${writingState.totalReps}`;
  }
}

function renderStrokeGuides(card) {
  const markersContainer = document.getElementById('canvas-stroke-markers');
  if (!markersContainer) return;

  markersContainer.innerHTML = '';

  const strokes = getStrokeOrder(card.character, card.strokes || 1);
  if (!strokes || strokes.length === 0) return;

  strokes.forEach(stroke => {
    const badge = document.createElement('span');
    badge.className = 'stroke-marker-badge';
    badge.style.left = `${stroke.x}%`;
    badge.style.top = `${stroke.y}%`;
    badge.innerHTML = `<span class="stroke-marker-num">${stroke.n}</span><span class="stroke-dir-arrow">${stroke.dir || ''}</span>`;
    badge.title = stroke.tip || `Goresan ke-${stroke.n}`;
    markersContainer.appendChild(badge);
  });
}

function renderWritingCard() {
  const card = writingState.deck[writingState.charIndex];
  if (!card) return;

  const ghostEl = document.getElementById('canvas-ghost-glyph');
  const badgeEl = document.getElementById('writing-char-badge');
  const romajiEl = document.getElementById('writing-char-romaji');
  const deckPosEl = document.getElementById('writing-deck-pos');

  if (ghostEl) ghostEl.textContent = card.character;
  if (badgeEl) badgeEl.textContent = card.badge || card.category;
  if (romajiEl) romajiEl.textContent = card.romaji || card.reading || '';
  if (deckPosEl) deckPosEl.textContent = `${writingState.charIndex + 1} / ${writingState.deck.length}`;

  renderStrokeGuides(card);
  updateGhostGuideUI();
  clearWritingCanvas();
}

function nextRepetition() {
  const card = writingState.deck[writingState.charIndex];
  if (!card) return;

  if (!writingState.hasStrokes) {
    showToast('Tuliskan huruf pada kanvas terlebih dahulu.');
    return;
  }

  if (writingState.currentRep < writingState.totalReps) {
    writingState.currentRep++;
    clearWritingCanvas();
    updateGhostGuideUI();
  } else {
    showToast(`Bagus! Kamu telah menyelesaikan ${writingState.totalReps}x penulisan.`);
    if (writingState.charIndex < writingState.deck.length - 1) {
      nextCharacter();
    } else {
      showToast('Seluruh materi pada deck ini telah selesai ditulis!');
      exitToConfig();
    }
  }
}

function nextCharacter() {
  if (writingState.charIndex < writingState.deck.length - 1) {
    writingState.charIndex++;
    writingState.currentRep = 1;
    renderWritingCard();
  }
}

function prevCharacter() {
  if (writingState.charIndex > 0) {
    writingState.charIndex--;
    writingState.currentRep = 1;
    renderWritingCard();
  }
}

function peekGuide() {
  if (writingState.isPeeking) return;
  writingState.isPeeking = true;
  updateGhostGuideUI();

  if (writingState.peekTimeout) clearTimeout(writingState.peekTimeout);
  writingState.peekTimeout = setTimeout(() => {
    writingState.isPeeking = false;
    updateGhostGuideUI();
  }, 1200);
}

function exitToConfig() {
  const setupCard = document.getElementById('writing-setup-card');
  const stageCard = document.getElementById('writing-stage-card');
  if (setupCard) setupCard.classList.remove('hidden');
  if (stageCard) stageCard.classList.add('hidden');
}

function startWritingSession() {
  const charSelect = document.getElementById('writing-char-select');
  if (charSelect && charSelect.value !== '') {
    writingState.charIndex = parseInt(charSelect.value, 10) || 0;
  }

  const repInput = document.getElementById('rep-number-input');
  if (repInput) {
    const val = parseInt(repInput.value, 10);
    writingState.totalReps = Math.max(10, isNaN(val) ? 20 : val);
  }

  writingState.currentRep = 1;

  const setupCard = document.getElementById('writing-setup-card');
  const stageCard = document.getElementById('writing-stage-card');
  if (setupCard) setupCard.classList.add('hidden');
  if (stageCard) stageCard.classList.remove('hidden');

  setupCanvasDpi();
  renderWritingCard();
}

async function loadWritingDeck() {
  writingState.deck = await getDeckData(writingState.category, writingState.level);
  writingState.charIndex = 0;
  populateCharDropdown();
}

function populateCharDropdown() {
  const select = document.getElementById('writing-char-select');
  if (!select) return;
  select.innerHTML = '';

  writingState.deck.forEach((card, idx) => {
    const opt = document.createElement('option');
    opt.value = idx.toString();
    const romajiPart = card.romaji ? ` (${card.romaji})` : '';
    opt.textContent = `${idx + 1}. ${card.character}${romajiPart}`;
    select.appendChild(opt);
  });
}

function setupConfigEvents() {
  const catButtons = document.querySelectorAll('#writing-category-selector .writing-cat-btn');
  const levelGroup = document.getElementById('writing-level-group');
  const levelButtons = document.querySelectorAll('#writing-level-selector .writing-chip-btn');
  const presetButtons = document.querySelectorAll('.rep-preset-btn');
  const repInput = document.getElementById('rep-number-input');
  const repDisplay = document.getElementById('writing-rep-display');
  const decBtn = document.getElementById('rep-dec-btn');
  const incBtn = document.getElementById('rep-inc-btn');
  const startBtn = document.getElementById('writing-start-btn');

  catButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      writingState.category = btn.dataset.cat;

      if (levelGroup) {
        levelGroup.style.display = writingState.category === 'kanji' ? 'block' : 'none';
      }
      writingState.level = writingState.category === 'kanji' ? 'n5' : 'all';
      if (levelButtons.length) {
        levelButtons.forEach(b => b.classList.toggle('active', b.dataset.lvl === writingState.level));
      }

      await loadWritingDeck();
    });
  });

  levelButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      levelButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      writingState.level = btn.dataset.lvl;
      await loadWritingDeck();
    });
  });

  const updateRepValue = (val) => {
    const clamped = Math.max(10, Math.min(100, val));
    writingState.totalReps = clamped;
    if (repInput) repInput.value = clamped.toString();
    if (repDisplay) repDisplay.textContent = `${clamped}x`;

    presetButtons.forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.rep, 10) === clamped);
    });
  };

  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      updateRepValue(parseInt(btn.dataset.rep, 10));
    });
  });

  if (decBtn) {
    decBtn.addEventListener('click', () => {
      updateRepValue(writingState.totalReps - 5);
    });
  }

  if (incBtn) {
    incBtn.addEventListener('click', () => {
      updateRepValue(writingState.totalReps + 5);
    });
  }

  if (repInput) {
    repInput.addEventListener('change', () => {
      updateRepValue(parseInt(repInput.value, 10) || 10);
    });
  }

  if (startBtn) {
    startBtn.addEventListener('click', startWritingSession);
  }
}

function setupStageEvents() {
  const exitBtn = document.getElementById('writing-exit-btn');
  const audioBtn = document.getElementById('writing-audio-btn');
  const clearBtn = document.getElementById('canvas-clear-btn');
  const undoBtn = document.getElementById('canvas-undo-btn');
  const peekBtn = document.getElementById('canvas-peek-btn');
  const nextRepBtn = document.getElementById('canvas-next-rep-btn');
  const prevCharBtn = document.getElementById('writing-prev-char-btn');
  const nextCharBtn = document.getElementById('writing-next-char-btn');

  if (exitBtn) exitBtn.addEventListener('click', exitToConfig);

  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const card = writingState.deck[writingState.charIndex];
      if (!card) return;
      const textToSpeak = (card.category === 'kanji' && card.reading) ? card.reading : card.character;
      speakJapanese(textToSpeak, audioBtn);
    });
  }

  if (clearBtn) clearBtn.addEventListener('click', clearWritingCanvas);
  if (undoBtn) undoBtn.addEventListener('click', undoLastStroke);
  if (peekBtn) peekBtn.addEventListener('click', peekGuide);
  if (nextRepBtn) nextRepBtn.addEventListener('click', nextRepetition);

  if (prevCharBtn) prevCharBtn.addEventListener('click', prevCharacter);
  if (nextCharBtn) nextCharBtn.addEventListener('click', nextCharacter);

  window.addEventListener('resize', () => {
    if (document.getElementById('page-writing')?.classList.contains('active')) {
      setupCanvasDpi();
      redrawCanvas();
    }
  });
}
