import React from 'react';
import { Page } from '../../App';
import { BarChart2, Users, Heart, Package, User, Calendar, FileText, Settings, ChevronLeft, ChevronRight, Activity } from 'lucide-react';

interface SidebarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    isOpen: boolean;
    setOpen: (isOpen: boolean) => void;
}

const navItems: { name: Page; icon: React.ReactNode }[] = [
    { name: 'Dashboard', icon: <BarChart2 size={20} /> },
    { name: 'Donors', icon: <Heart size={20} /> },
    { name: 'Projects', icon: <Package size={20} /> },
    { name: 'Beneficiaries', icon: <Users size={20} /> },
    { name: 'Staff & Volunteers', icon: <User size={20} /> },
    { name: 'Events', icon: <Calendar size={20} /> },
    { name: 'Reports', icon: <FileText size={20} /> },
    { name: 'Settings', icon: <Settings size={20} /> },
];

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isOpen, setOpen }) => {
    return (
        <aside 
            className={`fixed inset-y-0 left-0 z-40 bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 
                       lg:relative lg:shadow-md lg:translate-x-0
                       ${isOpen 
                           ? 'translate-x-0 lg:w-64' 
                           : '-translate-x-full lg:w-20'
                       }`
            }
            aria-hidden={!isOpen}
        >
            <div className="flex items-center justify-between h-16 border-b dark:border-gray-700 px-4">
                 <div className={`flex items-center gap-2 ${!isOpen && 'justify-center'}`}>
                    <Activity className="text-primary-500" size={28}/>
                    {isOpen && <span className="text-xl font-bold text-gray-800 dark:text-white">COMS</span>}
                 </div>
            </div>
            <nav className="mt-4">
                <ul>
                    {navItems.map((item) => (
                        <li key={item.name} className="px-4 py-1">
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(item.name);
                                }}
                                className={`flex items-center p-2 rounded-lg transition-colors duration-200 ${
                                    currentPage === item.name
                                        ? 'bg-primary-500 text-white'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                } ${!isOpen && 'justify-center'}`}
                            >
                                {item.icon}
                                {isOpen && <span className="ml-4 font-medium">{item.name}</span>}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <button 
                onClick={() => setOpen(!isOpen)} 
                className="absolute -right-3 top-16 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-full p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 hidden lg:block"
                aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
                {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
        </aside>
    );
};

export default Sidebar;