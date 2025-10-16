import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import { Donor, Donation } from '../types';
import { PlusCircle, Filter, X, Briefcase, Mail, Phone, MapPin, Calendar as CalendarIcon, DollarSign, Globe, Hash, CreditCard, Edit, Eye } from 'lucide-react';
import AddDonorModal from '../components/modals/AddDonorModal';

// --- MOCK DATA GENERATION ---
const firstNames = ["Liam", "Olivia", "Noah", "Emma", "Oliver", "Ava", "Elijah", "Charlotte", "William", "Sophia", "James", "Amelia", "Benjamin", "Isabella", "Lucas", "Mia", "Henry", "Evelyn", "Alexander", "Harper"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const companyNames = ["Innovate Inc.", "Quantum Solutions", "Starlight Foundation", "Vertex Industries", "Apex Global", "Procyon Solutions", "Orion Group", "Nebula Corp", "Jupiter Enterprises", "Pulsar Systems"];
const domains = ["example.com", "mail.com", "inbox.com", "tech.net", "services.org"];
const streets = ["Main St", "Oak Ave", "Pine Rd", "Maple Dr", "Elm St", "Cedar Ln", "Birch Rd", "Willow Way"];
const cities = ["Anytown", "Otherville", "Big City", "Smalltown", "Metropolis", "Springfield", "Rivertown", "Lakeside"];
const countries = ["USA", "Canada", "UK", "Australia", "Germany", "France"];
const donorTypes: Donor['donor_type'][] = ['Recurring', 'One-Time', 'Major Sponsor'];

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date): string => {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
};

const generateMockDonors = (count: number): Donor[] => {
    const donors: Donor[] = [];
    for (let i = 1; i <= count; i++) {
        const isCompany = Math.random() < 0.2;
        const donorType = getRandomElement(donorTypes);
        let name, email;

        if (isCompany) {
            name = getRandomElement(companyNames);
            email = `contact@${name.toLowerCase().replace(/\s/g, '').replace(/[.,]/g, '')}.org`;
        } else {
            const firstName = getRandomElement(firstNames);
            const lastName = getRandomElement(lastNames);
            name = `${firstName} ${lastName}`;
            email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomElement(domains)}`;
        }

        let total_donated;
        if (donorType === 'Major Sponsor') total_donated = Math.floor(Math.random() * 90000) + 10000;
        else if (donorType === 'Recurring') total_donated = Math.floor(Math.random() * 4800) + 200;
        else total_donated = Math.floor(Math.random() * 500) + 50;
        
        donors.push({
            id: i,
            name,
            email,
            phone: `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
            donor_type: donorType,
            address: `${Math.floor(Math.random() * 999) + 1} ${getRandomElement(streets)}, ${getRandomElement(cities)}`,
            country: getRandomElement(countries),
            joined_date: getRandomDate(new Date(2021, 0, 1), new Date()),
            total_donated
        });
    }
    return donors.sort((a,b) => b.total_donated - a.total_donated);
};

const mockDonors: Donor[] = generateMockDonors(500);
// --- END OF MOCK DATA GENERATION ---

// --- DONOR DETAIL MODAL COMPONENT ---
const DonorDetailModal: React.FC<{ isOpen: boolean; onClose: () => void; donor: Donor | null }> = ({ isOpen, onClose, donor }) => {
    const mockDonationHistory = useMemo((): Omit<Donation, 'donor_id' | 'project_id' | 'receipt_url'>[] => {
        if (!donor) return [];
        const history: Omit<Donation, 'donor_id' | 'project_id' | 'receipt_url'>[] = [];
        const count = Math.floor(Math.random() * 5) + 2;
        for (let i = 0; i < count; i++) {
            history.push({
                id: 1000 + i,
                amount: Math.floor(Math.random() * (donor.total_donated / count)) + 10,
                payment_method: getRandomElement(['Credit Card', 'PayPal', 'Bank Transfer']),
                date: getRandomDate(new Date(donor.joined_date), new Date()),
            });
        }
        return history.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [donor]);

    if (!isOpen || !donor) return null;

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="donor-detail-title">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4 transform" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 id="donor-detail-title" className="text-xl font-semibold">Donor Profile</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X size={24} /></button>
                </div>
                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <img className="h-24 w-24 rounded-full object-cover" src={`https://i.pravatar.cc/150?u=${donor.id}`} alt={`${donor.name}'s avatar`} />
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{donor.name}</h3>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ donor.donor_type === 'Recurring' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : donor.donor_type === 'Major Sponsor' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200' }`}>{donor.donor_type}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-3"><Mail size={16} className="text-gray-500"/><span>{donor.email}</span></div>
                        <div className="flex items-center gap-3"><Phone size={16} className="text-gray-500"/><span>{donor.phone}</span></div>
                        <div className="flex items-center gap-3"><MapPin size={16} className="text-gray-500"/><span>{donor.address}</span></div>
                        <div className="flex items-center gap-3"><Globe size={16} className="text-gray-500"/><span>{donor.country}</span></div>
                        <div className="flex items-center gap-3"><CalendarIcon size={16} className="text-gray-500"/><span>Joined: {donor.joined_date}</span></div>
                        <div className="flex items-center gap-3"><DollarSign size={16} className="text-green-500"/><span>Total Donated: <span className="font-semibold">${donor.total_donated.toLocaleString()}</span></span></div>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-2">Donation History</h4>
                        <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase">
                                    <tr>
                                        <th className="p-3">Date</th><th className="p-3">Amount</th><th className="p-3">Method</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700">
                                    {mockDonationHistory.map(d => (
                                        <tr key={d.id}>
                                            <td className="p-3">{d.date}</td>
                                            <td className="p-3 font-medium text-green-600">${d.amount.toLocaleString()}</td>
                                            <td className="p-3">{d.payment_method}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
         </div>
    )
}

const Donors: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
    const [donors, setDonors] = useState<Donor[]>(mockDonors);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
    const [viewingDonor, setViewingDonor] = useState<Donor | null>(null);
    const [typeFilter, setTypeFilter] = useState<'All' | 'Recurring' | 'One-Time' | 'Major Sponsor'>('All');
    const [dateFilter, setDateFilter] = useState('');

    const handleClearFilters = () => {
        setTypeFilter('All');
        setDateFilter('');
    };

    const handleSaveDonor = (donorData: Omit<Donor, 'total_donated'> & { id?: number }) => {
        if (donorData.id) { // Editing existing donor
            setDonors(donors.map(d => d.id === donorData.id ? { ...d, ...donorData } : d));
        } else { // Adding new donor
            const newDonor: Donor = {
                id: Math.max(...donors.map(d => d.id), 0) + 1,
                ...donorData,
                total_donated: 0,
            };
            setDonors([newDonor, ...donors]);
        }
        setIsModalOpen(false);
        setEditingDonor(null);
    };

    const openAddModal = () => {
        setEditingDonor(null);
        setIsModalOpen(true);
    };

    const openEditModal = (donor: Donor) => {
        setEditingDonor(donor);
        setIsModalOpen(true);
    };
    
    const openDetailModal = (donor: Donor) => {
        setViewingDonor(donor);
        setIsDetailModalOpen(true);
    }

    const filteredDonors = useMemo(() => {
        return donors.filter(donor => 
            (typeFilter === 'All' || donor.donor_type === typeFilter) &&
            (!dateFilter || new Date(donor.joined_date) >= new Date(dateFilter)) &&
            (!searchQuery || donor.name.toLowerCase().includes(searchQuery.toLowerCase()) || donor.email.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [donors, typeFilter, dateFilter, searchQuery]);

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Donors</h1>
                    <button onClick={openAddModal} className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                        <PlusCircle size={20} /><span>Add Donor</span>
                    </button>
                </div>

                <Card>
                    <div className="p-4 border-b dark:border-gray-700">
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Filter size={20}/> Filter Donors</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                                <label htmlFor="donorType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Donor Type</label>
                                <select id="donorType" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                                    <option>All</option><option>Recurring</option><option>One-Time</option><option>Major Sponsor</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="dateJoined" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Joined After</label>
                                <input type="date" id="dateJoined" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"/>
                            </div>
                            <div className="flex items-end">
                                <button onClick={handleClearFilters} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg w-full flex items-center justify-center gap-2 transition-colors">
                                    <X size={20} /><span>Clear Filters</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="p-4">Name</th><th className="p-4 hidden md:table-cell">Contact</th><th className="p-4">Type</th><th className="p-4">Total Donated</th><th className="p-4 hidden lg:table-cell">Joined Date</th><th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {filteredDonors.length > 0 ? filteredDonors.slice(0, 50).map(donor => (
                                    <tr key={donor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="p-4 font-medium text-gray-900 dark:text-white">
                                            <a href="#" onClick={(e) => { e.preventDefault(); openDetailModal(donor); }} className="hover:underline">{donor.name}</a>
                                        </td>
                                        <td className="p-4 text-gray-900 dark:text-white hidden md:table-cell">
                                            <a href={`mailto:${donor.email}`} className="hover:underline">{donor.email}</a>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ donor.donor_type === 'Recurring' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : donor.donor_type === 'Major Sponsor' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200' }`}>{donor.donor_type}</span>
                                        </td>
                                        <td className="p-4">${donor.total_donated.toLocaleString()}</td>
                                        <td className="p-4 hidden lg:table-cell">{donor.joined_date}</td>
                                        <td className="p-4">
                                            <button onClick={() => openEditModal(donor)} className="text-primary-500 hover:text-primary-700 flex items-center gap-1"><Edit size={14}/> Edit</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={6} className="text-center p-8 text-gray-500">No donors found matching your criteria.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            <AddDonorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveDonor} donorToEdit={editingDonor} />
            <DonorDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} donor={viewingDonor} />
        </>
    );
};

export default Donors;