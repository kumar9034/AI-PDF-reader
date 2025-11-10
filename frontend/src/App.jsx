import React, { useState, useEffect, useRef } from "react";
import { IoMdAdd } from "react-icons/io";
import { IoSend } from "react-icons/io5";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  // 👇 Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handlesendmessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setIsThinking(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/chat`,
        { Question: input },
        { headers: { "Content-Type": "application/json" } }
      );

      const aiResponse = res.data.data;
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "", fullText: aiResponse },
      ]);
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

  // ⌨️ Typing effect
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsgIndex = messages.length - 1;
    const lastMsg = messages[lastMsgIndex];

    if (
      lastMsg.sender === "ai" &&
      lastMsg.fullText &&
      lastMsg.text.length < lastMsg.fullText.length
    ) {
      const timer = setTimeout(() => {
        setMessages((prev) => {
          const newMsgs = [...prev];
          newMsgs[lastMsgIndex].text = lastMsg.fullText.slice(
            0,
            lastMsg.text.length + 2
          );
          return newMsgs;
        });
      }, 20); // Typing speed
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handlesendmessage();
  };

  // 📤 File Upload
  const handlefile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

     const maxSize = 500 * 1024; 

  if (file.size > maxSize) {
    alert("⚠️ File too large! Please upload a PDF under 500 KB.");
    e.target.value = ""; // clear the input
    return;
  }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("Uploaded:", res.data);
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  return (
    <div className="w-full h-screen flex justify-between bg-neutral-900 text-white">
      {/* Sidebar */}
      <div className="sm:w-[10%] w-[20%] h-full bg-neutral-800 pt-7 sm:px-2 px-0">
        <img className="w-100 h-auto" src="logo.png" alt="logo" />
      </div>

      {/* Chat Section */}
      <div className="sm:w-[90%] w-[85%] flex flex-col items-center p-3 relative">
        <h1 className="font-bold sm:text-2xl text-lg mb-3">
          AI Message Chatboard
        </h1>

        <div className="sm:w-[70%] w-full flex flex-col h-full overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-2">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-neutral-500 text-3xl font-bold">
                  Welcome to ChatPDF
                </h1>
                <p className="text-neutral-500 text-sm mt-2">
                  Click <span className="text-xl">+</span> to upload a PDF (max 500 KB) and ask questions about it. 
                </p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-xl mb-3 sm:text-sm text-xs max-w-fit ${
                    msg.sender === "user"
                      ? "bg-neutral-700 ml-auto"
                      : " mr-auto"
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                </div>
              ))
            )}

            {isThinking && (
              <div className="text-sm mr-auto p-3 rounded-xl animate-pulse">
                Thinking...
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Section */}
          <div className="fixed bottom-5 inset-x-0 mx-auto max-w-3xl flex bg-neutral-800 rounded-3xl items-center px-4 py-2">
            <span
              onClick={() => document.getElementById("fileInput").click()}
              className="hover:bg-neutral-700 w-10 h-10 rounded-full flex justify-center items-center cursor-pointer mr-2"
            >
              <input
                onChange={handlefile}
                type="file"
                accept="application/pdf"
                id="fileInput"
                hidden
              />
              <IoMdAdd color="white" size={25} />
            </span>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent text-white p-2 outline-none"
              placeholder="Ask a question..."
            />

            <button
              onClick={handlesendmessage}
              className="ml-2 bg-neutral-700 hover:bg-neutral-600 rounded-full p-2 cursor-pointer"
            >
              <IoSend size={20} color="white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
