import { GoogleGenerativeAI } from "@google/generative-ai";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";
interface Message {
  text: string;
  sender: string;
  id: string;
}
function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const apiKey = import.meta.env.VITE_API;
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };

  async function sendPrompt(prompt: string) {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });
    const result = await chatSession.sendMessage(prompt);
    const res = result.response.text();
    setMessages((prev) => [...prev, { text: res, sender: "AI", id: uuidv4() }]);
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, input: string) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { text: input, sender: "me", id: uuidv4() },
    ]);
    setInput("");
    sendPrompt(input);
  };
  const convoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (convoRef.current) {
      convoRef.current.scrollTop = convoRef.current.scrollHeight;
    }
  }, [messages, isVisible]);
  return (
    <div className="bg-black min-h-screen relative text-white ">
      {isVisible && (
        <div className="w-full max-w-[400px] min-h-[300px] h-[60vh] sm:h-[400px] fixed sm:absolute bottom-0 sm:bottom-8 left-1/2 sm:left-auto -translate-x-1/2 sm:translate-x-0 right-0 sm:right-15 overflow-hidden bg-green-200 rounded-t-[16px] sm:rounded-[16px] flex flex-col shadow-lg z-50">
          {/* Title Bar */}
          <div className="bg-red-600 p-3 flex items-center justify-between text-base sm:text-lg">
            <p className="capitalize">chatbot</p>
            <p
              onClick={() => setIsVisible(false)}
              className="text-[24px] cursor-pointer"
            >
              &times;
            </p>
          </div>
          {/* Convo Area */}
          <div ref={convoRef} className="flex-1 overflow-y-auto min-h-[200px] p-2 sm:p-4 bg-green-100 text-black flex flex-col gap-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[85%] sm:max-w-[70%] px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
                  msg.sender === "me"
                    ? "bg-green-500 text-white self-end rounded-br-none"
                    : "bg-white text-black self-start rounded-bl-none"
                }`}
              >
                {msg.sender === "me" ? (
                  <p className="break-words">{msg.text}</p>
                ) : (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                )}
              </div>
            ))}
          </div>
          {/* Input Form */}
          <form
            onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e, input)}
            className="flex items-center gap-2 p-2 sm:p-3 border-t border-gray-300 bg-white"
          >
            <input
              title="enter your message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              type="text"
              className="flex-1 px-3 sm:px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 text-black bg-gray-100 placeholder-gray-500 text-sm sm:text-base"
              placeholder="Type your message..."
            />
            <button
              type="submit"
              className="px-3 sm:px-4 py-2 rounded-full bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
            >
              Send
            </button>
          </form>
        </div>
      )}
      {!isVisible && (
        <div className="absolute bottom-5 right-8 ">
          <p
            onClick={() => setIsVisible(true)}
            className=" text-[30px] cursor-pointer  "
          >
            💬
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
