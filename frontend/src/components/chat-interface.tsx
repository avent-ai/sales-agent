import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Input } from "@/components/ui/input";
import BotIcon from '@/components/ui/bot-icon';
import styles from './ChatInterface.module.css';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  sentiment?: {
    label: string;
    score: number;
    positive_prob: number;
    neutral_prob: number;
    negative_prob: number;
  };
  thinkingProcess?: {
    conversationalStage: string,
    useTools: boolean,
    tool?: string,
    toolInput?: string,
    actionOutput?: string,
    actionInput?: string
  };
};

// Improved sentiment analysis function
async function analyzeSentiment(text: string) {
  try {
    console.log("Analyzing sentiment for:", text);
    const response = await fetch('http://localhost:5001/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text })
    });

    if (!response.ok) {
      throw new Error(`Sentiment API error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Sentiment analysis result:", result);
    return result;
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    // Return default values if API fails
    return {
      label: "neutral",
      score: 0.6,
      positive_prob: 0.2,
      neutral_prob: 0.6,
      negative_prob: 0.2
    };
  }
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [session_id] = useState(uuidv4());
  const [stream, setStream] = useState(false);
  const [botName, setBotName] = useState('');
  const [botMessageIndex, setBotMessageIndex] = useState(1);
  const [thinkingProcess, setThinkingProcess] = useState<any[]>([]);
  const [maxHeight, setMaxHeight] = useState('80vh');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const thinkingProcessEndRef = useRef<null | HTMLDivElement>(null);
  const [botHasResponded, setBotHasResponded] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    thinkingProcessEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thinkingProcess]);

  useEffect(() => {
    // Set the height based on viewport
    const handleResize = () => {
      setMaxHeight(`${window.innerHeight - 200}px`);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Fetch bot name when component mounts
    const fetchBotName = async () => {
      try {
        console.log("Fetching bot name from API...");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/botname`);
        
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Bot name received:", data);
        setBotName(data.name);
      } catch (error) {
        console.error("Failed to fetch the bot's name:", error);
      }
    };
    
    fetchBotName();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    console.log("Sending message:", inputValue);
    
    // First analyze sentiment
    const sentiment = await analyzeSentiment(inputValue);
    
    // Add user message with sentiment
    const newUserMessage: Message = {
      id: uuidv4(),
      text: inputValue,
      sender: 'user',
      sentiment: sentiment
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    
    // Clear input field
    setInputValue('');
    
    // Now send to backend
    handleBotResponse(inputValue, sentiment);
  };

  const handleBotResponse = async (userMessage: string, sentiment: any) => {
    console.log("Requesting bot response for:", userMessage);
    setIsBotTyping(true);

    try {
      const requestData = {
        session_id,
        human_say: userMessage,
        stream,
      };

      console.log("Sending request to API:", `${process.env.NEXT_PUBLIC_API_URL}/chat`);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Received bot response:", data);

      // Update bot name if provided
      if (data.bot_name) {
        setBotName(data.bot_name);
      }

      // Add thinking process
      if (data.conversational_stage) {
        setThinkingProcess(prev => [...prev, {
          conversationalStage: data.conversational_stage,
          tool: data.tool,
          toolInput: data.tool_input,
          actionOutput: data.action_output,
          actionInput: data.action_input
        }]);
      }

      // Add bot message
      const botMessage: Message = {
        id: uuidv4(),
        text: data.response || "I'm not sure how to respond to that.",
        sender: 'bot'
      };

      setBotMessageIndex(prev => prev + 1);
      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error("Failed to fetch bot's response:", error);
      
      // Add error message as bot response
      const errorMessage: Message = {
        id: uuidv4(),
        text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
        sender: 'bot'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
    } finally {
      setIsBotTyping(false);
      setBotHasResponded(true);
    }
  };

  // CSS for sentiment visualization
  const sentimentBarStyle = {
    height: '5px',
    borderRadius: '5px',
    marginRight: '5px',
    display: 'inline-block'
  };

  return (
    <div key="1" className="flex flex-col " style={{ height: '89vh' }}>
      <header className="flex items-center justify-center h-16 bg-gray-900 text-white">
        <BotIcon className="animate-wave h-7 w-6 mr-2" />
        <h1 className="text-2xl font-bold">Sally - Sales Buddy with Sentiment Analysis</h1>
      </header>
      <main className="flex flex-row justify-center items-start bg-gray-100 dark:bg-gray-900 p-4" >
        <div className="flex flex-col w-1/2 h-full bg-white rounded-lg shadow-md p-4 mr-4 chat-messages" style={{maxHeight}}>
          <div className="flex items-center mb-4">
            <BotIcon className="h-6 w-6 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold">Chat Interface With The Customer</h2>
          </div>
          <div className={`flex-1 overflow-y-auto ${styles.hideScrollbar}`}>
            {messages.map((message, index) => (
              <div key={message.id} className="flex items-center p-2">
                {message.sender === 'user' ? (
                  <>
                    <span role="img" aria-label="User" className="mr-2">👤</span>
                    <div className="flex flex-col">
                      <span className={`text-frame p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-900`}>
                        {message.text}
                      </span>

                      {/* Display sentiment for user messages */}
                      {message.sentiment && (
                        <div className="mt-1 text-xs text-gray-600">
                          <div>Detected sentiment: {message.sentiment.label} ({Math.round(message.sentiment.score * 100)}% confidence)</div>
                          <div className="flex items-center mt-1">
                            <div style={{...sentimentBarStyle, width: `${Math.round(message.sentiment.positive_prob * 100)}px`, backgroundColor: '#28a745'}}></div>
                            <span className="text-xs">Positive</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <div style={{...sentimentBarStyle, width: `${Math.round(message.sentiment.neutral_prob * 100)}px`, backgroundColor: '#6c757d'}}></div>
                            <span className="text-xs">Neutral</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <div style={{...sentimentBarStyle, width: `${Math.round(message.sentiment.negative_prob * 100)}px`, backgroundColor: '#dc3545'}}></div>
                            <span className="text-xs">Negative</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex w-full justify-between">
                    <div className="flex items-center">
                      <img
                        alt="Bot"
                        className="rounded-full mr-2"
                        src="/maskot.png"
                        style={{ width: 24, height: 24, objectFit: "cover" }}
                      />
                      <span className={`text-frame p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900`}>
                      <ReactMarkdown rehypePlugins={[rehypeRaw]} components={{
                        a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700" />
                      }}>
                        {message.text}
                      </ReactMarkdown>
                      </span>
                    </div>
                    {message.sender === 'bot' && (
                      <div className="flex items-center justify-end ml-2">
                        <div className="text-sm text-gray-500" style={{minWidth: '20px', textAlign: 'right'}}>
                          <strong>({messages.filter((m, i) => m.sender === 'bot' && i <= index).length})</strong>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            ))}
            {isBotTyping && (
              <div className="flex items-center justify-start">
                <img alt="Bot" className="rounded-full mr-2" src="/maskot.png" style={{ width: 24, height: 24, objectFit: "cover" }} />
                <div className={`${styles.typingBubble}`}>
                <span className={`${styles.typingDot}`}></span>
                <span className={`${styles.typingDot}`}></span>
                <span className={`${styles.typingDot}`}></span>
              </div>
              </div>
            )}
          </div>
          <div className="mt-4">
            <Input
              className="w-full"
              placeholder="Type your message..."
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage();
                }
              }}
            />
          </div>
        </div>
        <div className="flex flex-col w-1/2 h-full bg-white rounded-lg shadow-md p-4 thinking-process" style={{maxHeight}}>
          <div className="flex items-center mb-4">
            <BotIcon className="h-6 w-6 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold">AI Sales Agent {botName} Thought Process</h2>
          </div>
          <div className={`flex-1 overflow-y-auto hide-scroll ${styles.hideScrollbar}`} style={{ overflowX: 'hidden' }}>
            <div>
              {thinkingProcess.map((process, index) => (
                <div key={index} className="break-words my-2">
                  <div><strong>({index + 1})</strong></div>
                  <div><strong>Conversational Stage:</strong> {process.conversationalStage}</div>
                  {process.tool && (
                    <div><strong>Tool:</strong> {process.tool}</div>
                  )}
                  {process.toolInput && (
                    <div><strong>Tool Input:</strong> {process.toolInput}</div>
                  )}
                  {process.actionInput && (
                    <div><strong>Action Input:</strong> {process.actionInput}</div>
                  )}
                  {process.actionOutput && (
                    <div><strong>Action Output:</strong> {process.actionOutput}</div>
                  )}
                </div>
              ))}
            </div>
            <div ref={thinkingProcessEndRef} />
          </div>
        </div>
      </main>
    </div>
  );
}