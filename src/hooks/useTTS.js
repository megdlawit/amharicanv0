// Text-to-speech hook — uses browser SpeechSynthesis as fallback
// Replace with Google Cloud TTS by setting audio_url on exercises in Supabase

export function useTTS() {
  const speak = (text, lang = 'am-ET') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utt = new SpeechSynthesisUtterance(text)
      utt.lang = lang
      utt.rate = 0.85
      window.speechSynthesis.speak(utt)
    }
  }

  const playAudio = async (audioUrl, fallbackText = '') => {
    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl)
        await audio.play()
        return
      } catch {
        // fall through to TTS
      }
    }
    if (fallbackText) speak(fallbackText)
  }

  return { speak, playAudio }
}
