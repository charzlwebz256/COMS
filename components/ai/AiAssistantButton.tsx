import React from 'react';
import { Sparkles } from 'lucide-react';

interface AiAssistantButtonProps {
    onClick: () => void;
    isOpen: boolean;
}

const AiAssistantButton: React.FC<AiAssistantButtonProps> = ({ onClick, isOpen }) => {
    return (
        <button
            onClick={onClick}
            className={`fixed bottom-6 right-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 z-30 ${isOpen ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'}`}
            aria-label="Open AI Assistant"
            aria-hidden={isOpen}
        >
            <Sparkles size={28} />
        </button>
    );
};

export default AiAssistantButton;