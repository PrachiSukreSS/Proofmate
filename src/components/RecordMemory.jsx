import { useState } from "react";
import axios from "axios";

const RecordMemory = () => {
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition 😔");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // 👈 Keeps listening until stopped manually
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.start();

    setIsListening(true);
    setRecognitionInstance(recognition);

    recognition.onresult = (event) => {
      let fullTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        fullTranscript += event.results[i][0].transcript + " ";
      }
      setTranscript((prev) => prev + fullTranscript.trim() + " ");
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event);
      alert("Voice input error!");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const stopListening = () => {
    if (recognitionInstance) {
      recognitionInstance.stop();
      setIsListening(false);
    }
  };

  const summarizeText = async () => {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that summarizes user voice input into short memory notes.",
            },
            {
              role: "user",
              content: transcript,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`, // ✅ Correct syntax
            "Content-Type": "application/json",
          },
        }
      );

      const aiSummary = response.data.choices[0].message.content;
      setSummary(aiSummary);
    } catch (error) {
      console.error("OpenAI API error:", error.response?.data || error.message);
      alert("Failed to get summary.");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">🎙️ Record Memory</h2>

      {!isListening ? (
        <button
          onClick={startListening}
          className="bg-purple-500 px-4 py-2 text-white rounded"
        >
          Start Recording
        </button>
      ) : (
        <button
          onClick={stopListening}
          className="bg-red-500 px-4 py-2 text-white rounded"
        >
          Stop Recording
        </button>
      )}

      {transcript && (
        <div>
          <h3 className="mt-4 font-semibold">Your Voice Input:</h3>
          <p className="bg-gray-100 p-2 rounded">{transcript}</p>
          <button
            onClick={summarizeText}
            className="bg-green-600 mt-2 px-4 py-2 text-white rounded"
          >
            Summarize
          </button>
        </div>
      )}

      {summary && (
        <div className="mt-4 p-3 border rounded bg-gray-100">
          <h3 className="font-semibold">🧠 AI Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
};

export default RecordMemory;
