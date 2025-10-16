import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import { Project, User, ProjectExpense } from '../types';
import { PlusCircle, Filter, X, Edit, Target, DollarSign, CheckCircle, TrendingUp } from 'lucide-react';
import AddProjectModal from '../components/modals/AddProjectModal';

// --- MOCK DATA GENERATION ---
const projectNames = ["Clean Water Initiative", "Youth Mentorship Program", "Urban Farming Initiative", "Digital Literacy for Seniors", "Community Health Clinic", "Affordable Housing Project", "Disaster Relief Fund", "Mobile Library", "Reforestation Drive", "Animal Shelter Support"];
const projectStatuses: Project['status'][] = ['Active', 'Completed', 'Pending', 'On Hold'];
const locations = ["Westwood Community Center", "North Valley", "Eastside Hub", "Downtown", "Suburbia Hall", "Riverbend Park", "Hillcrest", "Southpoint", "Oakwood Shelter", "Maple Creek"];

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date): string => {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
};

const generateMockProjects = (count: number): Project[] => {
    const projects: Project[] = [];
    for (let i = 1; i <= count; i++) {
        const budget = Math.floor(Math.random() * 950000) + 50000;
        const total_donations = Math.floor(Math.random() * budget * 1.2); // Allow overfunding
        const team_members = [1, 2, 3].slice(0, Math.floor(Math.random() * 3) + 1);
        
        const expenses: ProjectExpense[] = [];
        const numExpenses = Math.floor(Math.random() * 5);
        let spent = 0;
        for (let j = 0; j < numExpenses; j++) {
            const amount = Math.floor(Math.random() * (total_donations / 5));
            spent += amount;
            if (spent < total_donations) {
                expenses.push({
                    id: i * 100 + j,
                    description: `Initial supplies purchase #${j + 1}`,
                    amount,
                    date: getRandomDate(new Date(2022, 0, 1), new Date()),
                });
            }
        }

        projects.push({
            id: i,
            name: getRandomElement(projectNames),
            description: "A brief description of the project's goals and impact.",
            status: total_donations >= budget ? 'Completed' : getRandomElement(projectStatuses),
            start_date: getRandomDate(new Date(2022, 0, 1), new Date()),
            end_date: getRandomDate(new Date(), new Date(2025, 11, 31)),
            budget,
            total_donations,
            beneficiaries_helped: Math.floor(Math.random() * 500),
            milestones: [
                { name: "Planning", completed: true, due_date: getRandomDate(new Date(2022, 0, 1), new Date()) },
                { name: "Funding", completed: Math.random() > 0.3, due_date: getRandomDate(new Date(2022, 3, 1), new Date()) },
                { name: "Execution", completed: Math.random() > 0.7, due_date: getRandomDate(new Date(2022, 6, 1), new Date()) },
            ],
            team_members,
            project_lead_id: team_members[0],
            location: getRandomElement(locations),
            expenses,
        });
    }
    return projects;
};

// This data is now needed for the modal
// FIX: Added missing properties `address`, `bio`, and `assigned_project_ids` to mock User objects to conform to the User type.
const mockUsers: User[] = [
    { id: 1, name: "Alex Doe", email: "alex.doe@coms.org", role: "Admin", phone: "111-222-3333", joined_date: "2021-05-20", status: "Active", address: "123 Main St, Anytown", bio: "Lead administrator for COMS.", assigned_project_ids: [1, 5, 8] },
    { id: 2, name: "Brian Smith", email: "brian.s@coms.org", role: "Staff", phone: "222-333-4444", joined_date: "2022-08-11", status: "Active", address: "456 Oak Ave, Anytown", bio: "Project coordinator for community outreach.", assigned_project_ids: [1, 2, 3] },
    { id: 3, name: "Chloe Davis", email: "chloe.d@volunteer.coms.org", role: "Volunteer", phone: "333-444-5555", joined_date: "2023-03-01", status: "Active", address: "789 Pine Ln, Anytown", bio: "Passionate volunteer for environmental projects.", assigned_project_ids: [9] },
];
// --- END OF MOCK DATA GENERATION ---

interface ProjectsProps {
    searchQuery: string;
    navigateToProject: (id: number) => void;
}

const Projects: React.FC<ProjectsProps> = ({ searchQuery, navigateToProject }) => {
    const [projects, setProjects] = useState<Project[]>(generateMockProjects(25));
    const [statusFilter, setStatusFilter] = useState<'All' | Project['status']>('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    
    const fundingInfographicData = useMemo(() => {
        const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
        const totalDonations = projects.reduce((acc, p) => acc + p.total_donations, 0);
        const fundedProjects = projects.filter(p => p.total_donations >= p.budget);
        const fullyFundedCount = fundedProjects.length;
        const fullyFundedValue = fundedProjects.reduce((acc, p) => acc + p.budget, 0);
        const overallFundingPercentage = totalBudget > 0 ? (totalDonations / totalBudget) * 100 : 0;

        return {
            totalBudget,
            totalDonations,
            fullyFundedCount,
            fullyFundedValue,
            overallFundingPercentage,
        };
    }, [projects]);


    const handleSaveProject = (projectData: Omit<Project, 'id' | 'total_donations' | 'beneficiaries_helped' | 'expenses'> & { id?: number }) => {
        if (projectData.id) { // Editing
            setProjects(projects.map(p => p.id === projectData.id ? { ...p, ...projectData } : p));
        } else { // Adding
            const newProject: Project = {
                ...projectData,
                id: Math.max(...projects.map(p => p.id), 0) + 1,
                total_donations: 0,
                beneficiaries_helped: 0,
                expenses: [],
            };
            setProjects([newProject, ...projects]);
        }
        setIsModalOpen(false);
        setEditingProject(null);
    };
    
    const openAddModal = () => {
        setEditingProject(null);
        setIsModalOpen(true);
    };

    const openEditModal = (project: Project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const filteredProjects = useMemo(() => {
        return projects.filter(project => 
            (statusFilter === 'All' || project.status === statusFilter) &&
            (!searchQuery || project.name.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [projects, statusFilter, searchQuery]);

    const getStatusColor = (status: Project['status']) => {
        switch (status) {
            case 'Active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'On Hold': return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getProgressBarColor = (status: Project['status']) => {
        switch (status) {
            case 'Active': return 'bg-blue-500';
            case 'Completed': return 'bg-green-500';
            case 'Pending': return 'bg-yellow-500';
            case 'On Hold': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Projects</h1>
                    <button onClick={openAddModal} className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                        <PlusCircle size={20} />
                        <span>Add Project</span>
                    </button>
                </div>

                <Card>
                    <h2 className="text-xl font-semibold mb-4">Overall Funding Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full"><Target className="text-blue-500" size={24}/></div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Budget</p>
                                <p className="text-2xl font-bold">${fundingInfographicData.totalBudget.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full"><DollarSign className="text-green-500" size={24}/></div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Donations</p>
                                <p className="text-2xl font-bold">${fundingInfographicData.totalDonations.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-full"><TrendingUp className="text-yellow-500" size={24}/></div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Funding Progress</p>
                                <p className="text-2xl font-bold">{fundingInfographicData.overallFundingPercentage.toFixed(1)}%</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full"><CheckCircle className="text-purple-500" size={24}/></div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Projects Funded</p>
                                <p className="text-2xl font-bold">{fundingInfographicData.fullyFundedCount}</p>
                                <p className="text-sm font-medium text-green-500">${fundingInfographicData.fullyFundedValue.toLocaleString()} value</p>
                            </div>
                        </div>
                    </div>
                    <div>
                         <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                            <div className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full" style={{ width: `${Math.min(fundingInfographicData.overallFundingPercentage, 100)}%` }}></div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="p-4 border-b dark:border-gray-700">
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Filter size={20}/> Filter Projects</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="projectStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                <select id="projectStatus" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                                    <option>All</option>
                                    <option>Active</option>
                                    <option>Completed</option>
                                    <option>Pending</option>
                                    <option>On Hold</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button onClick={() => setStatusFilter('All')} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg w-full flex items-center justify-center gap-2 transition-colors">
                                    <X size={20} /><span>Clear Filter</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="p-4 whitespace-nowrap">Project Name</th>
                                    <th className="p-4 whitespace-nowrap">Status</th>
                                    <th className="p-4 whitespace-nowrap">Funding Progress</th>
                                    <th className="p-4 whitespace-nowrap hidden md:table-cell">Beneficiaries</th>
                                    <th className="p-4 whitespace-nowrap hidden lg:table-cell">End Date</th>
                                    <th className="p-4 whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {filteredProjects.length > 0 ? filteredProjects.map(project => {
                                    const fundingPercentage = project.status === 'Completed' ? 100 : project.budget > 0 ? (project.total_donations / project.budget) * 100 : 0;
                                    return (
                                        <tr 
                                            key={project.id} 
                                            className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                            onClick={() => navigateToProject(project.id)}
                                        >
                                            <td className="p-4 font-medium text-gray-900 dark:text-white">
                                                <span className="group-hover:underline group-hover:text-primary-500 transition-colors">
                                                    {project.name}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                                                    {project.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                                                    <div className={`${getProgressBarColor(project.status)} h-2.5 rounded-full`} style={{ width: `${Math.min(fundingPercentage, 100)}%` }}></div>
                                                </div>
                                                <span className="text-xs">{fundingPercentage.toFixed(0)}% Funded</span>
                                            </td>
                                            <td className="p-4 text-gray-900 dark:text-white hidden md:table-cell">{project.beneficiaries_helped}</td>
                                            <td className="p-4 text-gray-900 dark:text-white hidden lg:table-cell">{project.end_date}</td>
                                            <td className="p-4">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openEditModal(project);
                                                    }} 
                                                    className="text-yellow-500 hover:text-yellow-700 flex items-center gap-1 z-10 relative"
                                                >
                                                    <Edit size={14}/> Edit
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan={6} className="text-center p-8 text-gray-500">No projects found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            <AddProjectModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSaveProject} 
                projectToEdit={editingProject}
                users={mockUsers}
            />
        </>
    );
};

export default Projects;