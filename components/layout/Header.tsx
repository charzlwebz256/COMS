import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { Sun, Moon, Bell, User, Search, Menu, DollarSign, CheckCircle } from 'lucide-react';

interface HeaderProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const notifications = [
    { icon: <DollarSign size={16} className="text-green-500"/>, text: "New donation of $500 received.", time: "15m ago" },
    { icon: <CheckCircle size={16} className="text-blue-500"/>, text: "Project 'Clean Water Initiative' has been completed.", time: "2h ago" },
    { icon: <DollarSign size={16} className="text-green-500"/>, text: "Starlight Foundation made their monthly recurring donation.", time: "1d ago" },
    { icon: <CheckCircle size={16} className="text-blue-500"/>, text: "Milestone reached in 'Youth Mentorship Program'.", time: "3d ago" },
];

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen, searchQuery, setSearchQuery }) => {
    const { theme, toggleTheme } = useTheme();
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="flex items-center justify-between h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6">
            <div className="flex items-center">
                 <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 dark:text-gray-400 focus:outline-none lg:hidden mr-4" aria-label="Open sidebar">
                    <Menu size={24} />
                 </button>
                <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-48 sm:w-64 lg:max-w-xs pl-10 pr-4 py-2 border rounded-full bg-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <div className="relative" ref={notificationRef}>
                    <button 
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                        className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="View notifications"
                    >
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
                    </button>
                    {notificationsOpen && (
                         <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 overflow-hidden z-20">
                            <div className="p-3 font-semibold border-b dark:border-gray-700">Notifications</div>
                            <ul className="divide-y dark:divide-gray-700 max-h-96 overflow-y-auto">
                                {notifications.map((notification, index) => (
                                     <li key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50">
                                        <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-1">
                                            {notification.icon}
                                        </div>
                                        <div>
                                            <p className="text-sm">{notification.text}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</p>
                                        </div>
                                     </li>
                                ))}
                            </ul>
                         </div>
                    )}
                </div>
                {/* User menu has been removed from the header and moved to the Settings page */}
            </div>
        </header>
    );
};

export default Header;