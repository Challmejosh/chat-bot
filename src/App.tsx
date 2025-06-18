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
    <div className="bg-black min-h-dvh relative text-white ">
      {isVisible && (
        <div className="rounded-[16px] flex flex-col items-start justify-between w-[80%] md:w-[400px] max-h-[400px] h-[400px] shadow-lg z-50 absolute bottom-15 right-5 ">
          {/* Title Bar */}
          <div className="bg-red-600 p-3 rounded-t-[16px] w-full flex items-center justify-between text-base sm:text-lg">
            <p className="capitalize">chatbot</p>
            <p
              onClick={() => setIsVisible(false)}
              className="text-[24px] cursor-pointer"
            >
              &times;
            </p>
          </div>
          {/* Convo Area */}
          <div ref={convoRef} className="flex-1 overflow-y-auto min-h-[200px] h-[200px] w-full p-2 sm:p-4 bg-[#0f0f0f] text-black flex flex-col gap-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[85%] sm:max-w-[70%] w-[80%] bg-red-300 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
                  msg.sender === "me"
                    ? "bg-red-600 text-white self-end rounded-br-none"
                    : "bg-[#333333] text-white self-start rounded-bl-none"
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
            className="w-full flex items-center rounded-b-[16px] gap-2 p-2 sm:p-3 border-t border-gray-300 bg-[#0f0f0f] "
          >
            <input
              title="enter your message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              type="text"
              className="flex-1 px-3 sm:px-4 py-2 rounded-md border-[1px] focus:outline-none focus:ring-2 focus:ring-gray-100 text-white bg-transparent placeholder-gray-500 text-sm sm:text-base"
              placeholder="Type your message..."
            />
            <button
              type="submit"
              className="px-3 sm:px-4 py-2 rounded-md cursor-pointer bg-red-600 text-white font-semibold hover:bg-red-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-100 text-sm sm:text-base"
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
            className=" text-[30px] bg-red-600 rounded-full px-2 cursor-pointer  "
          >
            💬
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
