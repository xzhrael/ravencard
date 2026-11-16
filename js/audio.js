let jaVoice = null;

function loadJapaneseVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  jaVoice = voices.find(v => v.lang === 'ja-JP' || v.lang.startsWith('ja')) || null;
}

if ('speechSynthesis' in window) {
  loadJapaneseVoice();
  window.speechSynthesis.onvoiceschanged = loadJapaneseVoice;
}

export function speakJapanese(text) {
  if (!('speechSynthesis' in window) || !text) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.85;

  if (jaVoice) {
    utterance.voice = jaVoice;
  }

  window.speechSynthesis.speak(utterance);
}
