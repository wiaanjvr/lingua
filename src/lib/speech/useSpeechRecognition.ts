import { useState, useEffect, useRef } from "react";

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

interface UseSpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  confidence: number;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {},
): UseSpeechRecognitionReturn {
  const {
    language = "fr-FR",
    continuous = false,
    interimResults = false,
  } = options;

  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if the browser supports the Web Speech API
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setIsSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = language;
        recognitionRef.current.continuous = continuous;
        recognitionRef.current.interimResults = interimResults;

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript;
          const confidenceScore = event.results[current][0].confidence;

          setTranscript(transcriptText);
          setConfidence(confidenceScore);
        };

        recognitionRef.current.onerror = (event: any) => {
          setError(event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      } else {
        setIsSupported(false);
        setError("Speech recognition is not supported in this browser");
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, continuous, interimResults]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript("");
      setConfidence(0);
      setError(null);
      try {
        recognitionRef.current.start();
      } catch (err) {
        setError("Failed to start speech recognition");
        console.error(err);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const resetTranscript = () => {
    setTranscript("");
    setConfidence(0);
    setError(null);
  };

  return {
    transcript,
    isListening,
    confidence,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
