import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import { Beneficiary, BeneficiarySupport } from '../types';
import { PlusCircle, Filter, X, Edit, ArrowUp, ArrowDown, Mail, Phone, MapPin, Calendar, Users, Briefcase, Hash, User as UserIcon, FileText } from 'lucide-react';
import AddBeneficiaryModal from '../components/modals/AddBeneficiaryModal';

// --- MOCK DATA GENERATION ---
const firstNames = ["Liam", "Olivia", "Noah", "Emma", "Oliver", "Ava", "Elijah", "Charlotte", "William", "Sophia", "James", "Amelia", "Benjamin", "Isabella", "Lucas", "Mia", "Henry", "Evelyn", "Alexander", "Harper"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const domains = ["example.com", "mail.com", "inbox.com", "personal.net", "home.org"];
const streets = ["Main St", "Oak Ave", "Pine Rd", "Maple Dr", "Elm St", "Cedar Ln", "Birch Rd", "Willow Way"];
const cities = ["Anytown", "Otherville", "Big City", "Smalltown", "Metropolis", "Springfield", "Rivertown", "Lakeside"];
const statuses: Beneficiary['status'][] = ['Active', 'Inactive'];
const genders: Beneficiary['gender'][] = ['Male', 'Female', 'Other', 'Prefer not to say'];
const supportTypes: BeneficiarySupport['type'][] = ['Financial', 'Food', 'Health', 'Education'];

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date): string => {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
};

const generateMockBeneficiaries = (count: number): Beneficiary[] => {
    const beneficiaries: Beneficiary[] = [];
    for (let i = 1; i <= count; i++) {
        const firstName = getRandomElement(firstNames);
        const lastName = getRandomElement(lastNames);
        const name = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomElement(domains)}`;

        const support_history: BeneficiarySupport[] = [];
        const historyCount = Math.floor(Math.random() * 4);
        for(let j=0; j<historyCount; j++) {
            support_history.push({
                date: getRandomDate(new Date(2022, 0, 1), new Date()),
                type: getRandomElement(supportTypes),
                amount: Math.random() > 0.5 ? Math.floor(Math.random() * 500) + 50 : undefined,
                project_id: Math.floor(Math.random() * 10) + 1
            });
        }

        beneficiaries.push({
            id: i,
            name,
            email,
            phone: `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
            status: getRandomElement(statuses),
            address: `${Math.floor(Math.random() * 999) + 1} ${getRandomElement(streets)}, ${getRandomElement(cities)}`,
            joined_date: getRandomDate(new Date(2021, 0, 1), new Date()),
            project_ids: [Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 10) + 11],
            age: Math.floor(Math.random() * 60) + 18,
            gender: getRandomElement(genders),
            household_size: Math.floor(Math.random() * 5) + 1,
            notes: "Initial assessment completed. Follow-up required in 3 months.",
            support_history,
        });
    }
    return beneficiaries.sort((a, b) => new Date(b.joined_date).getTime() - new Date(a.joined_date).getTime());
};

const mockBeneficiaries: Beneficiary[] = generateMockBeneficiaries(500);
// --- END OF MOCK DATA GENERATION ---

// --- DETAIL MODAL ---
const BeneficiaryDetailModal: React.FC<{ isOpen: boolean, onClose: () => void, beneficiary: Beneficiary | null }> = ({ isOpen, onClose, beneficiary }) => {
    if (!isOpen || !beneficiary) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl m-4 transform" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-semibold">Beneficiary Profile</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X size={24} /></button>
                </div>
                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <img className="h-24 w-24 rounded-full object-cover" src={`https://i.pravatar.cc/150?u=${beneficiary.id}`} alt="avatar" />
                        <div className="text-center sm:text-left">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{beneficiary.name}</h3>
                            <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <span><MapPin size={14} className="inline mr-1" />{beneficiary.address.split(',')[1]?.trim() || 'Unknown City'}</span>
                                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${beneficiary.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`}>{beneficiary.status}</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t border-b dark:border-gray-700 py-4">
                        <div><p className="text-sm text-gray-500">Age</p><p className="font-semibold">{beneficiary.age}</p></div>
                        <div><p className="text-sm text-gray-500">Gender</p><p className="font-semibold">{beneficiary.gender}</p></div>
                        <div><p className="text-sm text-gray-500">Household</p><p className="font-semibold">{beneficiary.household_size}</p></div>
                        <div><p className="text-sm text-gray-500">Joined</p><p className="font-semibold">{beneficiary.joined_date}</p></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-2">Contact Information</h4>
                            <div className="space-y-2 text-sm">
                                <p><Mail size={14} className="inline mr-2 text-gray-500"/>{beneficiary.email}</p>
                                <p><Phone size={14} className="inline mr-2 text-gray-500"/>{beneficiary.phone}</p>
                                <p><MapPin size={14} className="inline mr-2 text-gray-500"/>{beneficiary.address}</p>
                            </div>
                        </div>
                         <div>
                            <h4 className="font-semibold mb-2">Associated Projects</h4>
                            <div className="space-y-2 text-sm">
                                {beneficiary.project_ids.map(id => <p key={id}><Briefcase size={14} className="inline mr-2 text-gray-500"/>Project ID: {id}</p>)}
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Case Notes</h4>
                        <p className="text-sm p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg italic">{beneficiary.notes}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Support History</h4>
                         <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase">
                                    <tr><th className="p-3">Date</th><th className="p-3">Type</th><th className="p-3">Details</th><th className="p-3">Project ID</th></tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700">
                                    {beneficiary.support_history.length > 0 ? beneficiary.support_history.map((s, i) => (
                                        <tr key={i}>
                                            <td className="p-3">{s.date}</td>
                                            <td className="p-3">{s.type}</td>
                                            <td className="p-3">{s.type === 'Financial' ? `$${s.amount}` : 'N/A'}</td>
                                            <td className="p-3">{s.project_id}</td>
                                        </tr>
                                    )) : <tr><td colSpan={4} className="text-center p-4 text-gray-500">No support history recorded.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


interface BeneficiariesProps {
    searchQuery: string;
    projectIdFilter: number | null;
    clearProjectFilter: () => void;
}

type SortableKeys = keyof Beneficiary;

const Beneficiaries: React.FC<BeneficiariesProps> = ({ searchQuery, projectIdFilter, clearProjectFilter }) => {
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(mockBeneficiaries);
    const [isAddEditModalOpen, setAddEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
    const [viewingBeneficiary, setViewingBeneficiary] = useState<Beneficiary | null>(null);
    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>({ key: 'joined_date', direction: 'descending' });

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: SortableKeys) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="inline ml-1" /> : <ArrowDown size={14} className="inline ml-1" />;
    };
    
    const handleClearFilters = () => {
        setStatusFilter('All');
        clearProjectFilter();
    };

    const handleSaveBeneficiary = (beneficiaryData: Omit<Beneficiary, 'id' | 'age' | 'gender' | 'household_size' | 'notes' | 'support_history'> & { id?: number }) => {
        if (beneficiaryData.id) { // Editing
            setBeneficiaries(beneficiaries.map(b => b.id === beneficiaryData.id ? { ...b, ...beneficiaryData } : b));
        } else { // Adding
            const newBeneficiary: Beneficiary = {
                ...beneficiaryData,
                id: Math.max(...beneficiaries.map(b => b.id), 0) + 1,
                age: 0, gender: 'Prefer not to say', household_size: 1, notes: '', support_history: [],
            };
            setBeneficiaries([newBeneficiary, ...beneficiaries]);
        }
        setAddEditModalOpen(false);
        setEditingBeneficiary(null);
    };

    const openAddModal = () => {
        setEditingBeneficiary(null);
        setAddEditModalOpen(true);
    };

    const openEditModal = (beneficiary: Beneficiary) => {
        setEditingBeneficiary(beneficiary);
        setAddEditModalOpen(true);
    };

    const openDetailModal = (beneficiary: Beneficiary) => {
        setViewingBeneficiary(beneficiary);
        setIsDetailModalOpen(true);
    }

    const sortedAndFilteredBeneficiaries = useMemo(() => {
        let sortableItems = [...beneficiaries].filter(beneficiary =>
            (statusFilter === 'All' || beneficiary.status === statusFilter) &&
            (!projectIdFilter || beneficiary.project_ids.includes(projectIdFilter)) &&
            (!searchQuery || beneficiary.name.toLowerCase().includes(searchQuery.toLowerCase()) || beneficiary.email.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [beneficiaries, statusFilter, projectIdFilter, searchQuery, sortConfig]);

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Beneficiaries</h1>
                    <button onClick={openAddModal} className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                        <PlusCircle size={20} /><span>Add Beneficiary</span>
                    </button>
                </div>

                <Card>
                    <div className="p-4 border-b dark:border-gray-700">
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Filter size={20} /> Filter Beneficiaries</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                                    <option>All</option><option>Active</option><option>Inactive</option>
                                </select>
                            </div>
                             <div className="flex items-end">
                                <button onClick={handleClearFilters} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg w-full flex items-center justify-center gap-2 transition-colors">
                                    <X size={20} /><span>Clear Filters</span>
                                </button>
                            </div>
                        </div>
                        {projectIdFilter && (
                            <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/50 rounded-lg text-primary-700 dark:text-primary-200 text-sm">
                                Filtering for beneficiaries in project ID: {projectIdFilter}. 
                                <button onClick={clearProjectFilter} className="ml-2 font-semibold underline">Clear project filter</button>
                            </div>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="p-4 cursor-pointer whitespace-nowrap" onClick={() => requestSort('name')}>Name {getSortIndicator('name')}</th>
                                    <th className="p-4 hidden md:table-cell whitespace-nowrap">Contact</th>
                                    <th className="p-4 cursor-pointer whitespace-nowrap" onClick={() => requestSort('status')}>Status {getSortIndicator('status')}</th>
                                    <th className="p-4 cursor-pointer hidden lg:table-cell whitespace-nowrap" onClick={() => requestSort('joined_date')}>Joined Date {getSortIndicator('joined_date')}</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {sortedAndFilteredBeneficiaries.length > 0 ? sortedAndFilteredBeneficiaries.slice(0, 50).map(beneficiary => (
                                    <tr key={beneficiary.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="p-4 font-medium text-gray-900 dark:text-white">
                                            <a href="#" onClick={(e) => { e.preventDefault(); openDetailModal(beneficiary); }} className="hover:underline hover:text-primary-500">{beneficiary.name}</a>
                                        </td>
                                        <td className="p-4 text-gray-900 dark:text-white hidden md:table-cell">
                                            <a href={`mailto:${beneficiary.email}`} className="hover:underline">{beneficiary.email}</a>
                                        </td>
                                        <td className="p-4 text-gray-900 dark:text-white">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                beneficiary.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                                            }`}>
                                                {beneficiary.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-900 dark:text-white hidden lg:table-cell">{beneficiary.joined_date}</td>
                                        <td className="p-4">
                                            <button onClick={() => openEditModal(beneficiary)} className="text-primary-500 hover:text-primary-700 flex items-center gap-1"><Edit size={14} /> Edit</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={5} className="text-center p-8 text-gray-500">No beneficiaries found matching your criteria.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            <AddBeneficiaryModal isOpen={isAddEditModalOpen} onClose={() => setAddEditModalOpen(false)} onSave={handleSaveBeneficiary} beneficiaryToEdit={editingBeneficiary} />
            <BeneficiaryDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} beneficiary={viewingBeneficiary} />
        </>
    );
};

export default Beneficiaries;