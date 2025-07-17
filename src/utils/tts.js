// utils/tts.js

export function playChinese(text, rate = 1.0) {
  if (!text) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN"; // Use Chinese TTS voice
  utterance.rate = rate;    // Speed: 0.1 (slow) to 10 (fast), default 1.0

  speechSynthesis.cancel(); // Stop any current speech
  speechSynthesis.speak(utterance);
}
