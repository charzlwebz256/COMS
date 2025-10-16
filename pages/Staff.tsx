import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import { User } from '../types';
import { PlusCircle, Filter, X, Edit, ArrowUp, ArrowDown, Mail, Phone, MapPin, Calendar, Briefcase, FileText } from 'lucide-react';
import AddStaffModal from '../components/modals/AddStaffModal';

// --- MOCK DATA GENERATION ---
const firstNames = ["Alex", "Brian", "Chloe", "Daniel", "Eva", "Frank", "Grace", "Henry", "Ivy", "Jack", "Kate", "Leo", "Maya", "Nathan", "Oscar"];
const lastNames = ["Doe", "Smith", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia"];
const roles: User['role'][] = ['Admin', 'Staff', 'Volunteer'];
const statuses: User['status'][] = ['Active', 'Inactive'];
const bios = [
    "Dedicated professional with over 5 years of experience in community outreach and program management.",
    "Passionate volunteer committed to making a difference in local communities.",
    "Experienced administrator ensuring smooth operations and efficient resource allocation.",
    "Recent graduate eager to apply skills in social work and support our mission."
];

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date): string => {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
};

const generateMockUsers = (count: number): User[] => {
    const users: User[] = [];
    for (let i = 1; i <= count; i++) {
        const firstName = getRandomElement(firstNames);
        const lastName = getRandomElement(lastNames);
        const role = getRandomElement(roles);
    const emailDomain = role === 'Volunteer' ? '@volunteer.coms.org' : '@coms.org';
        
        users.push({
            id: i,
            name: `${firstName} ${lastName}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${emailDomain}`,
            role,
            phone: `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
            joined_date: getRandomDate(new Date(2020, 0, 1), new Date()),
            status: getRandomElement(statuses),
            address: `${Math.floor(Math.random() * 999) + 1} Civic Center Plaza`,
            bio: getRandomElement(bios),
            assigned_project_ids: [Math.floor(Math.random() * 10) + 1]
        });
    }
    return users;
};

const mockUsers: User[] = generateMockUsers(100);
// --- END MOCK DATA ---

// --- DETAIL MODAL ---
const StaffDetailModal: React.FC<{ isOpen: boolean, onClose: () => void, user: User | null }> = ({ isOpen, onClose, user }) => {
    if (!isOpen || !user) return null;

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4 transform" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-semibold">Member Profile</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X size={24} /></button>
                </div>
                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                     <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <img className="h-24 w-24 rounded-full object-cover" src={`https://i.pravatar.cc/150?u=${user.email}`} alt="avatar" />
                        <div className="text-center sm:text-left">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h3>
                             <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <span>{user.role}</span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`}>{user.status}</span>
                            </div>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t dark:border-gray-700">
                        <div>
                            <h4 className="font-semibold mb-2">Contact Information</h4>
                            <div className="space-y-2 text-sm">
                                <p><Mail size={14} className="inline mr-2 text-gray-500"/>{user.email}</p>
                                <p><Phone size={14} className="inline mr-2 text-gray-500"/>{user.phone}</p>
                                <p><MapPin size={14} className="inline mr-2 text-gray-500"/>{user.address}</p>
                                <p><Calendar size={14} className="inline mr-2 text-gray-500"/>Joined: {user.joined_date}</p>
                            </div>
                        </div>
                         <div>
                            <h4 className="font-semibold mb-2">Assigned Projects</h4>
                            <div className="space-y-2 text-sm">
                                {user.assigned_project_ids.map(id => <p key={id}><Briefcase size={14} className="inline mr-2 text-gray-500"/>Project ID: {id}</p>)}
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Bio</h4>
                        <p className="text-sm p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg italic">{user.bio}</p>
                    </div>
                </div>
            </div>
         </div>
    );
};


const Staff: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [roleFilter, setRoleFilter] = useState<'All' | User['role']>('All');
    const [statusFilter, setStatusFilter] = useState<'All' | User['status']>('All');
    const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);

    const requestSort = (key: keyof User) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: keyof User) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="inline ml-1" /> : <ArrowDown size={14} className="inline ml-1" />;
    };

    const handleSaveUser = (userData: Omit<User, 'id' | 'bio' | 'assigned_project_ids' | 'address'> & { id?: number }) => {
        if (userData.id) { // Editing
            setUsers(users.map(u => u.id === userData.id ? { ...u, ...userData } : u));
        } else { // Adding
            const newUser: User = {
                ...userData,
                id: Math.max(...users.map(u => u.id), 0) + 1,
                bio: 'New member profile.', address: 'Not specified', assigned_project_ids: [],
            };
            setUsers([newUser, ...users]);
        }
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const openAddModal = () => { setEditingUser(null); setIsModalOpen(true); };
    const openEditModal = (user: User) => { setEditingUser(user); setIsModalOpen(true); };
    const openDetailModal = (user: User) => { setViewingUser(user); setIsDetailModalOpen(true); };

    const filteredAndSortedUsers = useMemo(() => {
        let filtered = users.filter(user => 
            (roleFilter === 'All' || user.role === roleFilter) &&
            (statusFilter === 'All' || user.status === statusFilter) &&
            (!searchQuery || user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        if (sortConfig) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [users, roleFilter, statusFilter, searchQuery, sortConfig]);

    return (
        <>
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Staff & Volunteers</h1>
                 <button onClick={openAddModal} className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                    <PlusCircle size={20} />
                    <span>Add Member</span>
                </button>
            </div>
            <Card>
                <div className="p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Filter size={20}/> Filter Members</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                            <select id="roleFilter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                                <option>All</option><option>Admin</option><option>Staff</option><option>Volunteer</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                            <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                                <option>All</option><option>Active</option><option>Inactive</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button onClick={() => { setRoleFilter('All'); setStatusFilter('All'); }} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg w-full flex items-center justify-center gap-2 transition-colors">
                                <X size={20} /><span>Clear Filters</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                            <tr>
                                <th className="p-4 cursor-pointer whitespace-nowrap" onClick={() => requestSort('name')}>Name {getSortIndicator('name')}</th>
                                <th className="p-4 cursor-pointer whitespace-nowrap" onClick={() => requestSort('role')}>Role {getSortIndicator('role')}</th>
                                <th className="p-4 cursor-pointer whitespace-nowrap" onClick={() => requestSort('status')}>Status {getSortIndicator('status')}</th>
                                <th className="p-4 hidden md:table-cell whitespace-nowrap">Contact</th>
                                <th className="p-4 cursor-pointer hidden lg:table-cell whitespace-nowrap" onClick={() => requestSort('joined_date')}>Joined Date {getSortIndicator('joined_date')}</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {filteredAndSortedUsers.length > 0 ? filteredAndSortedUsers.slice(0, 50).map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                                         <a href="#" onClick={(e) => { e.preventDefault(); openDetailModal(user); }} className="hover:underline hover:text-primary-500">{user.name}</a>
                                    </td>
                                    <td className="p-4 text-gray-900 dark:text-white">{user.role}</td>
                                    <td className="p-4 text-gray-900 dark:text-white">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                                        }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-900 dark:text-white hidden md:table-cell">{user.email}</td>
                                    <td className="p-4 text-gray-900 dark:text-white hidden lg:table-cell">{user.joined_date}</td>
                                    <td className="p-4">
                                        <button onClick={() => openEditModal(user)} className="text-primary-500 hover:text-primary-700 flex items-center gap-1"><Edit size={14}/> Edit</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center p-8 text-gray-500 dark:text-gray-400">
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
        <AddStaffModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveUser} userToEdit={editingUser} />
        <StaffDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} user={viewingUser} />
        </>
    );
};

export default Staff;