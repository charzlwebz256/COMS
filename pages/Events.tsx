import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import { Event } from '../types';
import { PlusCircle, Filter, X, Edit, Calendar, MapPin, DollarSign, Users, Package } from 'lucide-react';
import AddEventModal from '../components/modals/AddEventModal';

// --- MOCK DATA GENERATION ---
const eventTitles = ["Community Cleanup Day", "Tech Skills Workshop", "Annual Fundraising Gala", "Local Food Drive", "Health and Wellness Fair", "Youth Sports Camp", "Art in the Park", "Senior Social Hour", "Volunteer Appreciation Dinner", "Charity Concert"];
const locations = ["Westwood Community Center", "North Valley", "Eastside Hub", "Downtown", "Suburbia Hall", "Riverbend Park", "Hillcrest", "Southpoint", "Oakwood Shelter", "Maple Creek"];
const eventDescriptions: { [key: string]: string } = {
    "Community Cleanup Day": "Join us for a day of tidying up Riverbend Park! We'll provide gloves, bags, and refreshments. Let's make our community shine together.",
    "Tech Skills Workshop": "A free workshop for seniors and beginners to learn essential computer and internet skills. Topics include email, online safety, and video calls.",
    "Annual Fundraising Gala": "Our biggest night of the year! An evening of dinner, dancing, and auctions to support our ongoing community projects. Black-tie optional.",
    "Local Food Drive": "Help us stock the shelves of the local food bank. Drop off non-perishable food items at the Westwood Community Center throughout the week.",
    "Health and Wellness Fair": "Free health screenings, fitness demonstrations, and wellness resources for the whole family. Hosted at Eastside Hub.",
    "Youth Sports Camp": "A week-long summer sports camp for children ages 8-12. Activities include soccer, basketball, and team-building games.",
    "Art in the Park": "A showcase of local artists with live music and food trucks. A great way to support the arts and enjoy a beautiful day in the park.",
    "Senior Social Hour": "A weekly get-together for seniors featuring coffee, snacks, and board games. A great opportunity to connect with friends old and new.",
    "Volunteer Appreciation Dinner": "A special evening to honor the incredible volunteers who make our work possible. By invitation only.",
    "Charity Concert": "An evening of live music from local bands to raise funds for our disaster relief efforts. All ticket proceeds go directly to the cause."
};

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date): string => {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
};

const generateMockEvents = (count: number): Event[] => {
    const events: Event[] = [];
    for (let i = 1; i <= count; i++) {
        const title = getRandomElement(eventTitles);
        events.push({
            id: i,
            title: title,
            description: eventDescriptions[title] || "A description of the event, its purpose, and what attendees can expect. Join us for a day of community and engagement!",
            date: getRandomDate(new Date(2023, 0, 1), new Date(2025, 11, 31)),
            location: getRandomElement(locations),
            budget: Math.floor(Math.random() * 4500) + 500,
            project_id: Math.random() > 0.5 ? Math.floor(Math.random() * 10) + 1 : null,
            participants: Math.floor(Math.random() * 200) + 20,
        });
    }
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const mockEvents: Event[] = generateMockEvents(20);
// --- END MOCK DATA ---

// --- DETAIL MODAL ---
const EventDetailModal: React.FC<{ isOpen: boolean, onClose: () => void, event: Event | null }> = ({ isOpen, onClose, event }) => {
    if (!isOpen || !event) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4 transform" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-semibold">Event Details</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X size={24} /></button>
                </div>
                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{event.title}</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">{event.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700 text-sm">
                        <div className="flex items-center gap-3"><Calendar size={16} className="text-gray-500"/><span><span className="font-semibold">Date:</span> {event.date}</span></div>
                        <div className="flex items-center gap-3"><MapPin size={16} className="text-gray-500"/><span><span className="font-semibold">Location:</span> {event.location}</span></div>
                        <div className="flex items-center gap-3"><DollarSign size={16} className="text-gray-500"/><span><span className="font-semibold">Budget:</span> ${event.budget.toLocaleString()}</span></div>
                        <div className="flex items-center gap-3"><Users size={16} className="text-gray-500"/><span><span className="font-semibold">Participants:</span> {event.participants}</span></div>
                        {event.project_id && (
                             <div className="flex items-center gap-3"><Package size={16} className="text-gray-500"/><span><span className="font-semibold">Project ID:</span> {event.project_id}</span></div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


const Events: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
    const [events, setEvents] = useState<Event[]>(mockEvents);
    const [isAddEditModalOpen, setAddEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
    const [dateFilter, setDateFilter] = useState('');

    const handleSaveEvent = (eventData: Omit<Event, 'id' | 'participants'> & { id?: number }) => {
        if (eventData.id) { // Editing
            setEvents(events.map(e => e.id === eventData.id ? { ...e, ...eventData } : e));
        } else { // Adding
            const newEvent: Event = {
                ...eventData,
                id: Math.max(...events.map(e => e.id), 0) + 1,
                participants: 0,
            };
            setEvents([newEvent, ...events]);
        }
        setAddEditModalOpen(false);
        setEditingEvent(null);
    };

    const openAddModal = () => {
        setEditingEvent(null);
        setAddEditModalOpen(true);
    };

    const openEditModal = (event: Event) => {
        setEditingEvent(event);
        setAddEditModalOpen(true);
    };

    const openDetailModal = (event: Event) => {
        setViewingEvent(event);
        setIsDetailModalOpen(true);
    };

    const filteredEvents = useMemo(() => {
        return events.filter(event =>
            (!dateFilter || new Date(event.date) >= new Date(dateFilter)) &&
            (!searchQuery || event.title.toLowerCase().includes(searchQuery.toLowerCase()) || event.location.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [events, dateFilter, searchQuery]);

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Events</h1>
                    <button onClick={openAddModal} className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                        <PlusCircle size={20} />
                        <span>Add Event</span>
                    </button>
                </div>

                <Card>
                    <div className="p-4 border-b dark:border-gray-700">
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Filter size={20}/> Filter Events</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Events After</label>
                                <input type="date" id="dateFilter" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"/>
                            </div>
                            <div className="flex items-end">
                                <button onClick={() => setDateFilter('')} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg w-full flex items-center justify-center gap-2 transition-colors">
                                    <X size={20} /><span>Clear Filter</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="p-4 whitespace-nowrap">Event</th>
                                    <th className="p-4 whitespace-nowrap">Date</th>
                                    <th className="p-4 hidden md:table-cell whitespace-nowrap">Location</th>
                                    <th className="p-4 hidden lg:table-cell whitespace-nowrap">Participants</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {filteredEvents.length > 0 ? filteredEvents.map(event => (
                                    <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="p-4 font-medium text-gray-900 dark:text-white">
                                            <a href="#" onClick={(e) => { e.preventDefault(); openDetailModal(event); }} className="hover:underline hover:text-primary-500">
                                                {event.title}
                                            </a>
                                        </td>
                                        <td className="p-4 text-gray-900 dark:text-white">{event.date}</td>
                                        <td className="p-4 text-gray-900 dark:text-white hidden md:table-cell">{event.location}</td>
                                        <td className="p-4 text-gray-900 dark:text-white hidden lg:table-cell">{event.participants}</td>
                                        <td className="p-4">
                                            <button onClick={() => openEditModal(event)} className="text-primary-500 hover:text-primary-700 flex items-center gap-1">
                                                <Edit size={14}/> Edit
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={5} className="text-center p-8 text-gray-500">No events found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            <AddEventModal isOpen={isAddEditModalOpen} onClose={() => setAddEditModalOpen(false)} onSave={handleSaveEvent} eventToEdit={editingEvent} />
            <EventDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} event={viewingEvent} />
        </>
    );
};

export default Events;