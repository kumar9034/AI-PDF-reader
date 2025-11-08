import React, { useState, useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import { IoSend } from "react-icons/io5";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [input, setInput] = useState("");
  
  const handlesendmessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setIsThinking(true);

    try {
      const res = await axios.post(
          `${import.meta.env.BACKEND_URL}/chat`,
        { Question: input },
        { headers: { "Content-Type": "application/json" } }
      );

      const aiResponse = res.data.data;
      setMessages((prev) => [...prev, { sender: "ai", text: "", fullText: aiResponse }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "⚠️ Could not connect to AI server." },
      ]);
    } finally {
      setIsThinking(false);
    }
  };
  
  // ⌨️ Typing effect logic
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsgIndex = messages.length - 1;
    const lastMsg = messages[lastMsgIndex];

    if (lastMsg.sender === "ai" && lastMsg.fullText && lastMsg.text.length < lastMsg.fullText.length) {
      const timer = setTimeout(() => {
        setMessages((prev) => {
          const newMsgs = [...prev];
          newMsgs[lastMsgIndex].text = lastMsg.fullText.slice(0, lastMsg.text.length + 1);
          return newMsgs;
        });
      }, 25); // typing speed (25ms per char)
      return () => clearTimeout(timer);
    }
  }, [messages]);
  
  const handleKeyPress = (e) => {
    if (e.key === "Enter") handlesendmessage();
  };
  const formData = new FormData();
  
  const handlefile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    formData.append("file", file);
    formData.forEach((value, key) => console.log(key, value));
    console.log("Selected file:", file);
    uploader()
  };
  
     const uploader = async ()=> {
      const res = await axios.post(`${import.meta.env.BACKEND_URL}/upload`, formData , {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
      console.log(res)
    }

  return (
    <div className="w-full h-screen flex justify-between">
      {/* Sidebar */}
      <div className="sm:w-[10%] w-[20%] h-full bg-neutral-800 pt-7 sm:px-2 px-0">
        <img className="w-100 h-auto" src="logo.png" alt="" />
      </div>

      {/* Chat Section */}
      <div className="bg-neutral-900 sm:w-[90%] w-[85%] h-full flex flex-col items-center sm:p-3">
        <h1 className="text-white font-[700] sm:text-2xl text-lg mt-5 sm:mt-0">
          AI Message Chatboard
        </h1>

        <div className="sm:w-[70%] w-full h-full p-1">
          <div className="overflow-y-auto h-[calc(100%-100px)] mb-4 scrollbar-hide">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`sm:text-sm text-[10px] text-white p-3 rounded-xl mb-3 max-w-fit ${
                  msg.sender === "user"
                    ? "bg-neutral-700 ml-auto"
                    : "bg-neutral-900  mr-auto"
                }`}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.text}
                </ReactMarkdown>
              </div>
            ))}

            {isThinking && (
              <div className="text-sm mr-auto p-3 rounded-xl max-w-fit">
                <h1 className="animate-pulse text-white">Thinking...</h1>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="fixed mb-7 max-w-3xl left-0 bg-neutral-800 h-15 inset-x-0 rounded-3xl mx-auto bottom-0 flex justify-center">
            <span
              onClick={() => document.getElementById("fileInput").click()}
              className="hover:bg-neutral-700 w-12 h-10 rounded-full flex justify-center items-center mt-2 ml-4 cursor-pointer"
            >
              <input onChange={handlefile} type="file" id="fileInput" hidden />
              <IoMdAdd color="white" size={25} />
            </span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full h-full text-white p-2 outline-none bg-transparent"
              type="text"
              placeholder="ask me question....."
            />
            <button onClick={handlesendmessage} className="px-4 py-1">
              <IoSend size={20} color="white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
