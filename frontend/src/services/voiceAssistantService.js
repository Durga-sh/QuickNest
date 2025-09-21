class VoiceAssistantService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.synthesis = null;
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onStartCallback = null;
    this.onEndCallback = null;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      this.synthesis = window.speechSynthesis;
    }
    this.initializeSpeechRecognition();
  }
  initializeSpeechRecognition() {
    if (typeof window === "undefined") {
      console.warn("Window object not available - running on server?");
      return;
    }
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      console.warn("Speech Recognition not supported in this browser");
      return;
    }
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition constructor not available");
      return;
    }
    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";
      this.recognition.maxAlternatives = 1;
      this.recognition.onstart = () => {
        this.isListening = true;
        console.log("Voice recognition started");
        if (this.onStartCallback) this.onStartCallback();
      };
      this.recognition.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        if (this.onResultCallback) {
          this.onResultCallback(finalTranscript, interimTranscript);
        }
      };
      this.recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        this.isListening = false;
        if (this.onErrorCallback) this.onErrorCallback(event.error);
      };
      this.recognition.onend = () => {
        this.isListening = false;
        console.log("Voice recognition ended");
        if (this.onEndCallback) this.onEndCallback();
      };
      console.log("âœ… Speech recognition initialized successfully");
    } catch (error) {
      console.error("âŒ Failed to initialize speech recognition:", error);
    }
  }
  isSupported() {
    if (typeof window === "undefined") {
      return false;
    }
    const hasSpeechRecognition = !!(
      window.SpeechRecognition || window.webkitSpeechRecognition
    );
    const hasSpeechSynthesis = !!window.speechSynthesis;
    return hasSpeechRecognition && hasSpeechSynthesis;
  }
  startListening() {
    if (!this.recognition) {
      console.error("Speech recognition not available");
      return false;
    }
    if (this.isListening) {
      console.warn("Already listening");
      return false;
    }
    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      return false;
    }
  }
  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }
    this.isListening = false;
  }
  speak(text, options = {}) {
    if (!this.synthesis) {
      console.error("Speech synthesis not available");
      return;
    }
    if (!text || typeof text !== "string") {
      console.error("Invalid text for speech synthesis");
      return;
    }
    try {
      this.synthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || "en-US";
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      if (options.onEnd) {
        utterance.onend = options.onEnd;
      }
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);
        if (event.error === "interrupted") {
          console.warn("Speech was interrupted, this is normal");
        }
      };
      if (this.synthesis.speaking) {
        this.synthesis.cancel();
      }
      this.synthesis.speak(utterance);
    } catch (error) {
      console.error("Error in speech synthesis:", error);
    }
  }
  setCallbacks({ onResult, onError, onStart, onEnd }) {
    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.onStartCallback = onStart;
    this.onEndCallback = onEnd;
  }
  getListeningState() {
    return this.isListening;
  }
  cleanup() {
    this.stopListening();
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}
const voiceAssistantService = new VoiceAssistantService();
if (typeof window !== "undefined") {
  window.voiceAssistantService = voiceAssistantService;
}
export default voiceAssistantService;
