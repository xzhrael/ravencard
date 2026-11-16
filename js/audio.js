import { showToast } from './pwa.js';

/**
 * Global audio engine state
 */
let jaVoice = null;
let activeAudioElement = null;
let activeUtterance = null;
let voicesLoaded = false;

// Preload available speech synthesis voices as early as possible
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  findJapaneseVoice();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      findJapaneseVoice();
    };
  }
}

/**
 * Searches and caches available Japanese TTS voices from the browser/OS.
 * @returns {SpeechSynthesisVoice|null}
 */
function findJapaneseVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  try {
    const voices = window.speechSynthesis.getVoices() || [];
    if (voices.length > 0) {
      voicesLoaded = true;
      // Prioritize exact match ja-JP, then any Japanese dialect/voice
      jaVoice = voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP') ||
                voices.find(v => v.lang && v.lang.toLowerCase().startsWith('ja')) ||
                null;
    }
  } catch (_) {
    jaVoice = null;
  }
  return jaVoice;
}

/**
 * Speaks Japanese text using the best available engine:
 * 1. Native Web Speech API if a Japanese voice is installed on the device.
 * 2. High-fidelity cloud TTS stream if native Japanese voice is absent or fails.
 * 
 * @param {string} text - Character, reading, or vocabulary word to speak.
 * @param {HTMLElement} [triggerBtn] - Optional button element to receive active animation.
 */
export function speakJapanese(text, triggerBtn = null) {
  if (!text) return;

  // Sanitize text: strip furigana brackets, romaji hints, slashes
  const cleanText = String(text).replace(/[[\]()（）/]/g, '').trim();
  if (!cleanText) return;

  // Haptic feedback for tactile response on mobile
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(12); } catch (_) {}
  }

  // Visual animation on audio trigger button
  if (triggerBtn) {
    triggerBtn.classList.add('audio-playing');
  }

  const cleanup = () => {
    if (triggerBtn) {
      triggerBtn.classList.remove('audio-playing');
    }
    activeUtterance = null;
  };

  // Stop any currently playing audio streams
  stopCurrentAudio();

  const voice = findJapaneseVoice();
  const hasSpeech = typeof window !== 'undefined' &&
                    'speechSynthesis' in window &&
                    typeof SpeechSynthesisUtterance !== 'undefined';

  // If native Japanese voice is explicitly detected and verified, use native Web Speech
  if (hasSpeech && voice) {
    speakWithWebSpeech(cleanText, voice, cleanup);
    return;
  }

  // If no native Japanese voice is available, immediately stream audio
  // Triggered synchronously to preserve user gesture activation on mobile
  speakWithStreamingAudio(cleanText, cleanup);
}

/**
 * Plays speech using browser native SpeechSynthesisUtterance.
 */
function speakWithWebSpeech(text, voice, onComplete) {
  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.voice = voice;
    utterance.rate = 0.88;

    let hasStarted = false;
    let fallbackInvoked = false;

    // Safety watchdog: fallback if mobile speech engine hangs or fails to start
    const watchdogTimer = setTimeout(() => {
      if (!hasStarted && !fallbackInvoked) {
        fallbackInvoked = true;
        speakWithStreamingAudio(text, onComplete);
      }
    }, 1500);

    utterance.onstart = () => {
      hasStarted = true;
      clearTimeout(watchdogTimer);
    };

    utterance.onend = () => {
      clearTimeout(watchdogTimer);
      onComplete();
    };

    utterance.onerror = (e) => {
      clearTimeout(watchdogTimer);
      if (!fallbackInvoked) {
        fallbackInvoked = true;
        speakWithStreamingAudio(text, onComplete);
      } else {
        onComplete();
      }
    };

    // Keep global reference to prevent Chrome garbage collection bug
    activeUtterance = utterance;
    window.__rc_utterance = utterance;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('[Audio] WebSpeech failed, falling back to audio stream:', err);
    speakWithStreamingAudio(text, onComplete);
  }
}

/**
 * Plays speech via natural Japanese neural TTS audio stream without referrer leakage.
 */
function speakWithStreamingAudio(text, onComplete) {
  try {
    const encoded = encodeURIComponent(text);
    // client=gtx and client=tw-ob provide clear Japanese pronunciation
    const primaryUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=gtx&tl=ja&q=${encoded}`;
    const secondaryUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ja&q=${encoded}`;

    const audio = new Audio();
    // Essential: prevents Referer header to bypass anti-hotlink 404 blocks
    audio.referrerPolicy = 'no-referrer';
    activeAudioElement = audio;

    let triedSecondary = false;

    audio.onended = () => {
      activeAudioElement = null;
      if (onComplete) onComplete();
    };

    audio.onerror = () => {
      if (!triedSecondary) {
        triedSecondary = true;
        audio.src = secondaryUrl;
        audio.play().catch(() => {
          handleStreamFailure(onComplete);
        });
      } else {
        handleStreamFailure(onComplete);
      }
    };

    audio.src = primaryUrl;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Handle browser autoplay policy rejection
        console.warn('[Audio] Stream play promise rejected:', err);
        handleStreamFailure(onComplete);
      });
    }
  } catch (err) {
    console.error('[Audio] Stream init failed:', err);
    handleStreamFailure(onComplete);
  }
}

function handleStreamFailure(onComplete) {
  activeAudioElement = null;
  if (onComplete) onComplete();
  showToast('Audio gagal dimuat. Periksa koneksi internet atau aktifkan suara Bahasa Jepang di Setelan HP.');
}

/**
 * Stops any ongoing audio playback and speech synthesis.
 */
export function stopCurrentAudio() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
  }

  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch (_) {}
    activeAudioElement = null;
  }
}
