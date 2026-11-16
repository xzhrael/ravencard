import { showToast } from './pwa.js';

let jaVoice = null;
let voicesLoaded = false;
let activeAudioElement = null;
let activeUtterance = null;

// Initialize voices as soon as module loads
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

function loadVoices() {
  if (!('speechSynthesis' in window)) return [];
  const voices = window.speechSynthesis.getVoices() || [];
  if (voices.length > 0) {
    voicesLoaded = true;
    jaVoice = voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP' || v.lang.startsWith('ja')) || null;
  }
  return voices;
}

/**
 * Robust, resilient Japanese TTS engine with Web Speech API and instant fallback
 * @param {string} text - The Japanese character, word, or sentence to pronounce
 * @param {HTMLElement} [triggerBtn] - Optional button element to provide visual playing feedback
 */
export function speakJapanese(text, triggerBtn = null) {
  if (!text) return;

  // Clean text: strip brackets, slashes, or romaji hints e.g. "[ あ ]" -> "あ"
  const cleanText = String(text).replace(/[[\]()（）/]/g, '').trim();
  if (!cleanText) return;

  // Haptic feedback for tactile feel on mobile
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(15); } catch (_) {}
  }

  // Visual feedback on the button
  if (triggerBtn) {
    triggerBtn.classList.add('audio-playing');
  }

  const cleanupFeedback = () => {
    if (triggerBtn) {
      triggerBtn.classList.remove('audio-playing');
    }
    activeUtterance = null;
  };

  // Try Web Speech API first
  const hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

  if (hasSpeech) {
    try {
      // Unfreeze queue on mobile Chromium if it was paused
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const voices = loadVoices();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.88;

      if (jaVoice) {
        utterance.voice = jaVoice;
      } else if (voices.length > 0) {
        const found = voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP' || v.lang.startsWith('ja'));
        if (found) {
          jaVoice = found;
          utterance.voice = found;
        }
      }

      let started = false;
      let fallbackTriggered = false;

      // Watchdog timer: If Android SpeechSynthesis hangs or doesn't start within 450ms,
      // fallback to audio stream
      const fallbackTimer = setTimeout(() => {
        if (!started && !fallbackTriggered) {
          fallbackTriggered = true;
          tryFallbackAudio(cleanText, cleanupFeedback);
        }
      }, 450);

      utterance.onstart = () => {
        started = true;
        clearTimeout(fallbackTimer);
      };

      utterance.onend = () => {
        clearTimeout(fallbackTimer);
        cleanupFeedback();
      };

      utterance.onerror = (err) => {
        clearTimeout(fallbackTimer);
        if (!fallbackTriggered) {
          fallbackTriggered = true;
          tryFallbackAudio(cleanText, cleanupFeedback);
        } else {
          cleanupFeedback();
        }
      };

      // Keep strong global reference to prevent Chrome V8 garbage collection bug
      activeUtterance = utterance;
      window.__rc_active_utterance = utterance;

      window.speechSynthesis.speak(utterance);
      return;
    } catch (e) {
      console.warn('[Audio] SpeechSynthesis error:', e);
    }
  }

  // If SpeechSynthesis not available or errored synchronously
  tryFallbackAudio(cleanText, cleanupFeedback);
}

function tryFallbackAudio(text, onComplete) {
  try {
    if (activeAudioElement) {
      activeAudioElement.pause();
      activeAudioElement = null;
    }

    const encoded = encodeURIComponent(text);
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ja&q=${encoded}`;
    const audio = new Audio(audioUrl);
    activeAudioElement = audio;

    audio.onended = () => {
      activeAudioElement = null;
      if (onComplete) onComplete();
    };

    audio.onerror = () => {
      activeAudioElement = null;
      if (onComplete) onComplete();
      showToast('Audio gagal diputar. Periksa koneksi internet atau aktifkan suara Bahasa Jepang di Setelan TTS HP.');
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        if (onComplete) onComplete();
        showToast('Ketuk layar untuk mengizinkan pemutaran audio peramban.');
      });
    }
  } catch (err) {
    if (onComplete) onComplete();
  }
}
