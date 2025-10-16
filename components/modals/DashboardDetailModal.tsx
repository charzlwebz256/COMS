import React from 'react';
import { X } from 'lucide-react';
import { useDonors, useProjects, useBeneficiaries, useEvents, useDonations } from '../../context/DataContext';
import { DashboardViewType } from '../../pages/Dashboard';
import { Donation } from '../../types';

interface DashboardDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    viewType: DashboardViewType;
}

const DashboardDetailModal: React.FC<DashboardDetailModalProps> = ({ isOpen, onClose, viewType }) => {
    const { donors } = useDonors();
    const { projects } = useProjects();
    const { beneficiaries } = useBeneficiaries();
    const { events } = useEvents();
    const { donations } = useDonations();

    const getTitle = () => {
        switch (viewType) {
            case 'donations': return "Donations & Donors Overview";
            case 'projects': return "Projects Overview";
            case 'beneficiaries': return "Beneficiaries Overview";
            case 'events': return "Upcoming Events";
            default: return "Details";
        }
    };

    const renderContent = () => {
        switch (viewType) {
            case 'donations':
                const recentDonations = [...donations]
                    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5);

                return (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Recent Donations</h3>
                        <p className="text-sm text-gray-500 mb-4">Showing the 5 most recent donations.</p>
                        <ul className="divide-y dark:divide-gray-700">
                           {recentDonations.map((donation: Donation) => {
                                const donor = donors.find(d => d.id === donation.donor_id);
                                return (
                                    <li key={donation.id} className="py-2 flex justify-between items-center">
                                        <span>{donor?.name || 'Anonymous'} on {donation.date}</span>
                                        <span className="font-semibold text-green-500">${donation.amount.toLocaleString()}</span>
                                    </li>
                                );
                           })}
                        </ul>
                    </div>
                );
            case 'projects':
                return (
                     <div>
                        <h3 className="text-lg font-semibold mb-2">Active Projects</h3>
                        <p className="text-sm text-gray-500 mb-4">Showing all active projects.</p>
                         <ul className="divide-y dark:divide-gray-700">
                           {projects.filter(p => p.status === 'Active').map(project => (
                                <li key={project.id} className="py-2">
                                    <p className="font-semibold">{project.name}</p>
                                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                                        <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${(project.total_donations / project.budget) * 100}%` }}></div>
                                    </div>
                                </li>
                           ))}
                        </ul>
                    </div>
                );
            case 'beneficiaries':
                 return (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Recently Joined Beneficiaries</h3>
                        <p className="text-sm text-gray-500 mb-4">Showing the 5 most recently joined beneficiaries.</p>
                        <ul className="divide-y dark:divide-gray-700">
                           {[...beneficiaries].sort((a,b) => new Date(b.joined_date).getTime() - new Date(a.joined_date).getTime()).slice(0, 5).map(b => (
                                <li key={b.id} className="py-2 flex justify-between items-center">
                                    <span>{b.name}</span>
                                    <span className="text-xs text-gray-500">Joined: {b.joined_date}</span>
                                </li>
                           ))}
                        </ul>
                    </div>
                );
            case 'events':
                 return (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">All Upcoming Events</h3>
                        <ul className="divide-y dark:divide-gray-700">
                           {events.filter(e => new Date(e.date) >= new Date()).map(event => (
                                <li key={event.id} className="py-2">
                                    <p className="font-semibold">{event.title}</p>
                                    <p className="text-xs text-gray-500">{event.date} at {event.location}</p>
                                </li>
                           ))}
                        </ul>
                    </div>
                );
            default:
                return <p>No details to display.</p>;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose} role="dialog">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4 transform max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">{getTitle()}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X size={24} /></button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default DashboardDetailModal;