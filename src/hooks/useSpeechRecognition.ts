import { useState, useCallback, useRef, useEffect } from "react";

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
  error: string | null;
}

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export function useSpeechRecognition(language: string = "en-US"): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  
  const isSupported = typeof window !== "undefined" && 
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const languageCodeMap: Record<string, string> = {
    en: "en-US",
    fr: "fr-FR",
    es: "es-ES",
    de: "de-DE",
    it: "it-IT",
    pt: "pt-PT",
    ar: "ar-SA",
    zh: "zh-CN",
    ja: "ja-JP",
    ko: "ko-KR",
  };

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionAPI();
    
    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = languageCodeMap[language] || language;

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      // Restart if still supposed to be listening
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.log("Recognition restart failed:", e);
        }
      }
    };

    return () => {
      recognition.stop();
    };
  }, [isSupported, language]);

  // Update language when it changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = languageCodeMap[language] || language;
    }
  }, [language]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError("Speech recognition is not supported in this browser");
      return;
    }

    setError(null);
    setTranscript("");
    setInterimTranscript("");
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.error("Failed to start recognition:", e);
      setError("Failed to start speech recognition");
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
  };
}
