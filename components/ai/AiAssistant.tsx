import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, User, Loader } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useDonors, useProjects, useBeneficiaries, useStaff, useEvents, useDonations } from '../../context/DataContext';

interface AiAssistantProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const MarkdownRenderer = ({ text }: { text: string }) => {
  const html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/^- (.*$)/gim, '<li>$1</li>') // List items with -
    .replace(/^\* (.*$)/gim, '<li>$1</li>') // List items with *
    .replace(/<\/li>[\n\r]<li>/g, '</li><li>') // Join consecutive list items
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>') // Wrap in ul
    .replace(/\n/g, '<br />') // Newlines
    .replace(/<br \/>(\s)*<ul>/g, '<ul>') // Fix space before list
    .replace(/<\/ul>(\s)*<br \/>/g, '</ul>'); // Fix space after list

  return <div className="text-sm whitespace-normal" dangerouslySetInnerHTML={{ __html: html }} />;
};


const AiAssistant: React.FC<AiAssistantProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Get all data from context
    const { donors } = useDonors();
    const { projects } = useProjects();
    const { beneficiaries } = useBeneficiaries();
    const { staff } = useStaff();
    const { events } = useEvents();
    const { donations } = useDonations();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if(isOpen) {
            setTimeout(scrollToBottom, 300);
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const fullContext = {
                donors,
                donations,
                projects,
                beneficiaries,
                staff,
                events
            };
            
            const systemInstruction = `You are COMS AI, an expert assistant for a charity and community organization management system (COMS). Your purpose is to help users understand their data by providing clear, intelligent, and well-organized answers.
            - Use the provided JSON data to answer user questions. The data represents the entire organization's database.
            - Perform calculations like totals, averages, counts, and summaries when asked.
            - Format your answers clearly. Use markdown for lists, bold text (**text**), and tables to make data easy to understand.
            - When asked for summaries, provide key metrics first, then elaborate. For example, if asked about donors, mention the total number of donors and total donations before listing top donors.
            - If a user asks a question you cannot answer from the data, politely say so.
            - Today's date is ${new Date().toLocaleDateString()}.
            - Here is the complete dataset for the organization: ${JSON.stringify(fullContext)}`;
            
            const response: any = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: input,
                config: {
                    systemInstruction: systemInstruction,
                }
            });

            const aiMessage: Message = { sender: 'ai', text: response.text };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            const errorMessage: Message = { sender: 'ai', text: "I'm sorry, I encountered an error. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <aside
          className={`fixed right-0 top-0 h-full bg-white dark:bg-gray-800 flex flex-col transition-all duration-300 ease-in-out overflow-hidden z-50 ${isOpen ? 'w-full sm:w-96 border-l border-gray-200 dark:border-gray-700' : 'w-0'}`}
          aria-hidden={!isOpen}
        >
          <div className="w-full sm:w-96 h-full flex flex-col">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-primary-500" />
                        <h2 className="text-xl font-semibold">COMS Ai Assistant</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X size={24} /></button>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    <div className="flex items-start gap-3">
                         <div className="p-2 bg-primary-500 text-white rounded-full"><Sparkles size={20}/></div>
                         <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg max-w-md">
                            <p className="text-sm">Hello! I'm your COMS AI Assistant. How can I help you analyze your organization's data today?</p>
                        </div>
                    </div>
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'ai' && <div className="p-2 bg-primary-500 text-white rounded-full flex-shrink-0"><Sparkles size={20}/></div>}
                            <div className={`p-3 rounded-lg max-w-md break-words ${msg.sender === 'user' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                <MarkdownRenderer text={msg.text} />
                            </div>
                            {msg.sender === 'user' && <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-full flex-shrink-0"><User size={20}/></div>}
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary-500 text-white rounded-full"><Sparkles size={20}/></div>
                            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg max-w-md flex items-center">
                                <Loader className="animate-spin mr-2" size={16} />
                                <p className="text-sm">Thinking...</p>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about your data..."
                            className="w-full px-4 py-2 border rounded-full bg-transparent dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-primary-500 text-white rounded-full p-3 disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors">
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default AiAssistant;