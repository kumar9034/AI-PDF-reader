import React, { useState } from 'react'
import { IoMdAdd } from "react-icons/io";
import { IoSend } from "react-icons/io5"

const App = () => {
    const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [input, setInput ] = useState("")


 
  const handlesendmessage = ()=>{
    if(!input.trim()) return 

    const userMsg = input;
    setInput("")
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setIsThinking(true);

    
  }
  const handleKeyPress = (e)=>{
    if(e.key === "Enter") handlesendmessage()
    
  }
  return (
    <div className=' w-full h-screen flex justify-between  '>
       {/* logo add  */}
      <div className='sm:w-[10%] w-[20%] h-[100%] bg-neutral-800 pt-7 sm:px-2 px-0'>
          <img className='w-100 h-auto' src="logo.png" alt="" />
      </div>
       {/* AI chat board container */}
      <div className='bg-neutral-900 sm:w-[90%] w-[85%] h-[100%] flex flex-col items-center sm:p-3 '>
        <h1 className='text-white font-[700] sm:text-2xl text-lg mt-5 sm:mt-0'>AI message chatboard </h1>
        <div className='sm:w-[55%] redw-full h-full p-1 '>
        <div className='overflow-y-auto h-[calc(100%-100px)] mb-4 scrollbar-hide'>
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`sm:text-sm text-[10px] text-white p-3 rounded-xl mb-3 max-w-fit ${
                        msg.sender === "user" ? "bg-neutral-700 ml-auto" : "bg-neutral-900 mr-auto"
                      }`}
                    >{msg.sender === "ai" ? (
                        <div className="prose prose-invert max-w-fit">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <h1>{msg.text}</h1>
                      )}
                    </div>
                  ))}
        
                  {isThinking && (
                    <div className='text-sm  mr-auto p-3 rounded-xl max-w-fit'>
                      <h1 className='animate-pulse'>Thinking...</h1>
                    </div>
                  )}
                </div>
       {/* input messages container  */}
       <div className=' fixed mb-7 max-w-3xl left-0  bg-neutral-800  h-15 inset-x-0 rounded-3xl mx-auto bottom-0  flex justify-center   '>
          <span className='hover:bg-neutral-700 w-12 h-10 rounded-full flex justify-center items-center mt-2 ml-4  cursor-pointer'>
            <input type="file" name="" id="" hidden />
            <IoMdAdd color='white' size={25}/>
          </span>
            <input
            value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
            className='w-full h-full text-white p-2 outline-none' type="text" placeholder='ask me question.....' />
            <button 
            onClick={handlesendmessage}
            className='px-4 py-1 '>
                <IoSend size={20} color="white" />
            </button>
       </div>
        </div>
       </div>
      
    </div>
  )
}

export default App
