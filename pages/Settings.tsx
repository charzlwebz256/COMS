import React, { useState } from 'react';
import Card from '../components/ui/Card';
import { useTheme } from '../hooks/useTheme';
import { User, Sun, Moon, Bell, FileSpreadsheet, RefreshCw, Save, LogOut } from 'lucide-react';
import { useDonors, useProjects, useBeneficiaries, useStaff, useEvents } from '../context/DataContext';

const ToggleSwitch: React.FC<{
    label: string;
    enabled: boolean;
    onToggle: () => void;
}> = ({ label, enabled, onToggle }) => {
    return (
        <label htmlFor={label} className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-700 dark:text-gray-300">{label}</span>
            <div className="relative">
                <input id={label} type="checkbox" className="sr-only" checked={enabled} onChange={onToggle} />
                <div className="block bg-gray-200 dark:bg-gray-600 w-12 h-6 rounded-full"></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${enabled ? 'transform translate-x-6 bg-primary-500' : ''}`}></div>
            </div>
        </label>
    );
};

interface SettingsProps {
    onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
    const { theme, toggleTheme } = useTheme();
    const [profile, setProfile] = useState({
        name: 'Charz Lwebz',
    email: 'charzlwebz256@gmail.com',
        phone: '+211928319402',
    });
    const [notifications, setNotifications] = useState({
        donations: true,
        projects: true,
        events: false,
        summary: true,
    });
    const [saveStatus, setSaveStatus] = useState('');

    const { donors } = useDonors();
    const { projects } = useProjects();
    const { beneficiaries } = useBeneficiaries();
    const { staff } = useStaff();
    const { events } = useEvents();

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleProfileSave = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would be an API call
        console.log('Profile saved:', profile);
        setSaveStatus('Profile updated successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
    };

    const handleNotificationToggle = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // --- Data Export Logic ---
    const handleExportData = () => {
        const sanitizeValue = (value: any) => {
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            let strValue = String(value);
            if (strValue.search(/("|,|\n)/g) >= 0) {
                strValue = `"${strValue.replace(/"/g, '""')}"`;
            }
            return strValue;
        };

        const convertToCSV = (data: any[]) => {
            if (data.length === 0) return '';
            const headers = Object.keys(data[0]);
            const headerRow = headers.join(',');
            const dataRows = data.map(row => 
                headers.map(header => sanitizeValue(row[header])).join(',')
            );
            return [headerRow, ...dataRows].join('\r\n');
        };

        const downloadFile = (content: string, filename: string, mimeType: string) => {
            const blob = new Blob([content], { type: mimeType });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        };
        
        const donorsForExport = donors.map(({ id, name, email, phone, donor_type, address, country, joined_date, total_donated }) => ({ id, name, email, phone, donor_type, address, country, joined_date, total_donated }));
        const projectsForExport = projects.map(({ id, name, description, status, start_date, end_date, budget, total_donations, beneficiaries_helped, location, project_lead_id }) => ({ id, name, description, status, start_date, end_date, budget, total_donations, beneficiaries_helped, location, project_lead_id }));
        const beneficiariesForExport = beneficiaries.map(({ id, name, email, phone, address, joined_date, status, project_ids, age, gender, household_size }) => ({ id, name, email, phone, address, joined_date, status, project_ids, age, gender, household_size }));
        const staffForExport = staff.map(({ id, name, email, role, phone, joined_date, status, address, assigned_project_ids }) => ({ id, name, email, role, phone, joined_date, status, address, assigned_project_ids }));
        const eventsForExport = events.map(({ id, title, description, date, location, budget, project_id, participants }) => ({ id, title, description, date, location, budget, project_id, participants }));
        
    downloadFile(convertToCSV(donorsForExport), 'COMS_Donors_Export.csv', 'text/csv;charset=utf-8;');
    downloadFile(convertToCSV(projectsForExport), 'COMS_Projects_Export.csv', 'text/csv;charset=utf-8;');
    downloadFile(convertToCSV(beneficiariesForExport), 'COMS_Beneficiaries_Export.csv', 'text/csv;charset=utf-8;');
    downloadFile(convertToCSV(staffForExport), 'COMS_Staff_Export.csv', 'text/csv;charset=utf-8;');
    downloadFile(convertToCSV(eventsForExport), 'COMS_Events_Export.csv', 'text/csv;charset=utf-8;');
    };
    
    const handleResetData = () => {
        if (window.confirm('Are you sure you want to reset all application data? This will restore the initial mock data and cannot be undone.')) {
            window.location.reload();
        }
    };


    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold">Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Profile Settings */}
                    <Card>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><User size={22}/> Profile Settings</h2>
                        <div className="flex items-center space-x-4 mb-6 pb-6 border-b dark:border-gray-700">
                            <img
                                className="h-20 w-20 rounded-full object-cover"
                                src="https://picsum.photos/100"
                                alt="User avatar"
                            />
                            <div>
                                <button className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    Change Picture
                                </button>
                                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB.</p>
                            </div>
                        </div>
                        <form onSubmit={handleProfileSave} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium">Name</label>
                                <input type="text" id="name" name="name" value={profile.name} onChange={handleProfileChange} className="mt-1 input-field" />
                            </div>
                             <div>
                                <label htmlFor="email" className="block text-sm font-medium">Email</label>
                                <input type="email" id="email" name="email" value={profile.email} onChange={handleProfileChange} className="mt-1 input-field" />
                            </div>
                             <div>
                                <label htmlFor="phone" className="block text-sm font-medium">Phone</label>
                                <input type="tel" id="phone" name="phone" value={profile.phone} onChange={handleProfileChange} className="mt-1 input-field" />
                            </div>
                            <div className="flex justify-end items-center pt-2">
                               {saveStatus && <p className="text-green-600 text-sm mr-4">{saveStatus}</p>}
                               <button type="submit" className="px-4 py-2 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors flex items-center gap-2">
                                  <Save size={16}/> Save Changes
                               </button>
                            </div>
                        </form>
                    </Card>

                    {/* Notification Settings */}
                    <Card>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Bell size={22}/> Notification Settings</h2>
                        <div className="space-y-4">
                            <ToggleSwitch label="New Donations" enabled={notifications.donations} onToggle={() => handleNotificationToggle('donations')} />
                            <ToggleSwitch label="Project Updates" enabled={notifications.projects} onToggle={() => handleNotificationToggle('projects')} />
                            <ToggleSwitch label="Event Reminders" enabled={notifications.events} onToggle={() => handleNotificationToggle('events')} />
                            <ToggleSwitch label="Weekly Summary Email" enabled={notifications.summary} onToggle={() => handleNotificationToggle('summary')} />
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-8">
                    {/* Appearance Settings */}
                    <Card>
                        <h2 className="text-xl font-semibold mb-4">Appearance</h2>
                        <div>
                            <span className="block text-sm font-medium mb-2">Theme</span>
                            <div className="flex space-x-2">
                                <button onClick={() => theme === 'dark' && toggleTheme()} className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border-2 ${theme === 'light' ? 'bg-primary-500 text-white border-primary-500' : 'hover:bg-gray-200 dark:hover:bg-gray-700 border-transparent'}`}>
                                    <Sun size={16}/> Light
                                </button>
                                <button onClick={() => theme === 'light' && toggleTheme()} className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border-2 ${theme === 'dark' ? 'bg-primary-500 text-white border-primary-500' : 'hover:bg-gray-200 dark:hover:bg-gray-700 border-transparent'}`}>
                                    <Moon size={16}/> Dark
                                </button>
                            </div>
                        </div>
                    </Card>

                    {/* Data Management */}
                    <Card>
                         <h2 className="text-xl font-semibold mb-4">Data Management</h2>
                         <div className="space-y-3">
                            <button onClick={handleExportData} className="w-full justify-center text-sm px-4 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors flex items-center gap-2">
                                <FileSpreadsheet size={16}/> Export All Data
                            </button>
                             <button onClick={handleResetData} className="w-full justify-center text-sm px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors flex items-center gap-2">
                                <RefreshCw size={16}/> Reset Application Data
                            </button>
                         </div>
                    </Card>

                    {/* Account */}
                    <Card>
                        <h2 className="text-xl font-semibold mb-4">Account</h2>
                        <button onClick={onLogout} className="w-full justify-center text-sm px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors flex items-center gap-2">
                           <LogOut size={16}/> Log Out
                       </button>
                    </Card>
                </div>
            </div>
             <style>{`.input-field{display:block;width:100%;padding:0.5rem 0.75rem;font-size:0.875rem;line-height:1.25rem;border:1px solid;border-radius:0.375rem;background-color:transparent;color:inherit}.dark .input-field{border-color:#4b5563}.input-field{border-color:#d1d5db}.input-field:focus{outline:2px solid transparent;outline-offset:2px;border-color:rgb(59 130 246);box-shadow:0 0 0 2px rgb(59 130 246 / .5)}.border-red-500{border-color:#ef4444}.border-red-500:focus{border-color:#ef4444;box-shadow:0 0 0 2px rgb(239 68 68 / .5)}`}</style>
        </div>
    );
};

export default Settings;