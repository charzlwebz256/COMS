import React, { useState } from 'react';
import Card from '../components/ui/Card';
import { Project, User, ProjectExpense } from '../types';
// FIX: Imported the 'Calendar' icon from 'lucide-react'.
import { ArrowLeft, CheckCircle, Circle, DollarSign, Users, BarChart, Target, UserCheck, MapPin, User as UserIcon, TrendingDown, Calendar } from 'lucide-react';
import { Page } from '../App';

// Re-using mock data generation logic to find the project.
// In a real app, this would be an API call.
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
        const total_donations = Math.floor(Math.random() * budget);
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
            description: "A detailed description of the project's objectives, methods, and expected outcomes. This project aims to address a critical need within the community by providing essential resources and support. Our team is dedicated to ensuring its success and making a lasting positive impact.",
            status: getRandomElement(projectStatuses),
            start_date: getRandomDate(new Date(2022, 0, 1), new Date()),
            end_date: getRandomDate(new Date(), new Date(2025, 11, 31)),
            budget,
            total_donations,
            beneficiaries_helped: Math.floor(Math.random() * 500),
            location: getRandomElement(locations),
            team_members,
            project_lead_id: team_members[0], // Assign the first member as lead
            milestones: [
                { name: "Initial Planning & Research", completed: true, due_date: getRandomDate(new Date(2022, 0, 1), new Date(2022, 2, 1)) },
                { name: "Secure Funding & Partnerships", completed: true, due_date: getRandomDate(new Date(2022, 2, 1), new Date(2022, 5, 1)) },
                { name: "Community Outreach", completed: Math.random() > 0.3, due_date: getRandomDate(new Date(2022, 5, 1), new Date(2022, 8, 1)) },
                { name: "Implementation Phase 1", completed: Math.random() > 0.7, due_date: getRandomDate(new Date(2022, 8, 1), new Date(2023, 0, 1)) },
                { name: "Mid-Project Review", completed: false, due_date: getRandomDate(new Date(2023, 0, 1), new Date(2023, 2, 1)) },
                { name: "Final Implementation", completed: false, due_date: getRandomDate(new Date(2023, 2, 1), new Date(2023, 6, 1)) },
            ],
            expenses,
        });
    }
    return projects;
};
const mockProjects: Project[] = generateMockProjects(25);
// FIX: Added missing properties `address`, `bio`, and `assigned_project_ids` to mock User objects to conform to the User type.
const mockUsers: User[] = [
    { id: 1, name: "Alex Doe", email: "alex.doe@coms.org", role: "Admin", phone: "111-222-3333", joined_date: "2021-05-20", status: "Active", address: "123 Main St, Anytown", bio: "Lead administrator for COMS.", assigned_project_ids: [1, 5, 8] },
    { id: 2, name: "Brian Smith", email: "brian.s@coms.org", role: "Staff", phone: "222-333-4444", joined_date: "2022-08-11", status: "Active", address: "456 Oak Ave, Anytown", bio: "Project coordinator for community outreach.", assigned_project_ids: [1, 2, 3] },
    { id: 3, name: "Chloe Davis", email: "chloe.d@volunteer.coms.org", role: "Volunteer", phone: "333-444-5555", joined_date: "2023-03-01", status: "Active", address: "789 Pine Ln, Anytown", bio: "Passionate volunteer for environmental projects.", assigned_project_ids: [9] },
];


interface ProjectDetailsProps {
    projectId: number;
    setCurrentPage: (page: Page) => void;
    navigateToBeneficiaries: (projectId: number) => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ projectId, setCurrentPage, navigateToBeneficiaries }) => {
    const [project, setProject] = useState<Project | null>(() => mockProjects.find(p => p.id === projectId));
    const [newExpense, setNewExpense] = useState({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
    const [errors, setErrors] = useState<{description?: string, amount?: string}>({});

    if (!project) {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-bold">Project Not Found</h1>
                <button onClick={() => setCurrentPage('Projects')} className="mt-4 text-primary-500 hover:underline">
                    Go back to projects
                </button>
            </div>
        );
    }

    const handleExpenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewExpense(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({...prev, [name]: undefined}));
        }
    };
    
    const validateExpense = () => {
        const newErrors: {description?: string, amount?: string} = {};
        if (!newExpense.description.trim()) newErrors.description = 'Description is required.';
        if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) newErrors.amount = 'Amount must be positive.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddExpense = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateExpense()) return;

        const expenseToAdd: ProjectExpense = {
            id: Date.now(), // simple unique id
            description: newExpense.description,
            amount: parseFloat(newExpense.amount),
            date: newExpense.date,
        };
        
        setProject({
            ...project,
            expenses: [...project.expenses, expenseToAdd].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        });

        setNewExpense({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
    };

    const fundingPercentage = project.budget > 0 ? (project.total_donations / project.budget) * 100 : 0;
    const projectLead = mockUsers.find(u => u.id === project.project_lead_id);
    const totalExpenses = project.expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const getStatusColor = (status: Project['status']) => {
        switch (status) {
            case 'Active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'On Hold': return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200';
        }
    };

    return (
        <>
        <div className="space-y-6">
            <div>
                <button onClick={() => setCurrentPage('Projects')} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors mb-4">
                    <ArrowLeft size={18} />
                    Back to Projects
                </button>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">{project.name}</h1>
                        <span className={`mt-2 inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(project.status)}`}>
                            {project.status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full"><DollarSign className="text-green-500" size={24}/></div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Donations</p>
                        <p className="text-xl font-bold">${project.total_donations.toLocaleString()}</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full"><BarChart className="text-blue-500" size={24}/></div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Project Budget</p>
                        <p className="text-xl font-bold">${project.budget.toLocaleString()}</p>
                    </div>
                </Card>
                 <Card className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full"><TrendingDown className="text-red-500" size={24}/></div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
                        <p className="text-xl font-bold">${totalExpenses.toLocaleString()}</p>
                    </div>
                </Card>
                <div 
                    className="cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-lg rounded-xl"
                    onClick={() => navigateToBeneficiaries(project.id)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && navigateToBeneficiaries(project.id)}
                    aria-label={`View ${project.beneficiaries_helped} beneficiaries for this project`}
                >
                    <Card className="flex items-center gap-4 h-full">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full"><Users className="text-purple-500" size={24}/></div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Beneficiaries Helped</p>
                            <p className="text-xl font-bold">{project.beneficiaries_helped}</p>
                        </div>
                    </Card>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Project Overview</h2>
                            <p className="text-gray-600 dark:text-gray-300">{project.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t dark:border-gray-700 pt-4">
                            <div className="flex items-center gap-3"><UserIcon size={18} className="text-gray-500"/><div><span className="font-semibold">Lead:</span> {projectLead?.name || 'N/A'}</div></div>
                            <div className="flex items-center gap-3"><MapPin size={18} className="text-gray-500"/><div><span className="font-semibold">Location:</span> {project.location}</div></div>
                            <div className="flex items-center gap-3"><Calendar size={18} className="text-gray-500"/><div><span className="font-semibold">Start Date:</span> {project.start_date}</div></div>
                            <div className="flex items-center gap-3"><Calendar size={18} className="text-gray-500"/><div><span className="font-semibold">End Date:</span> {project.end_date}</div></div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2">Funding Progress</h3>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                                <div className="bg-primary-500 h-4 rounded-full" style={{ width: `${Math.min(fundingPercentage, 100)}%` }}></div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <span className="font-bold text-gray-800 dark:text-gray-200">${project.total_donations.toLocaleString()}</span> raised of ${project.budget.toLocaleString()} goal ({fundingPercentage.toFixed(1)}%)
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Target size={20}/> Milestones Timeline</h3>
                            <div className="relative pl-6">
                                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                                {project.milestones.map((milestone, index) => (
                                    <div key={index} className="relative mb-6">
                                        <div className="absolute -left-[18px] top-1">
                                            {milestone.completed ? <CheckCircle size={20} className="text-green-500 bg-white dark:bg-gray-800 rounded-full" /> : <Circle size={20} className="text-gray-400 bg-white dark:bg-gray-800 rounded-full" />}
                                        </div>
                                        <p className={`font-semibold ${milestone.completed ? 'text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>{milestone.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Due: {milestone.due_date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                     <Card>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><UserCheck size={20}/> Project Team</h3>
                        <div className="flex flex-wrap gap-4">
                            {mockUsers.filter(u => project.team_members.includes(u.id)).map(user => (
                                <div key={user.id} className="flex flex-col items-center text-center">
                                    <img src={`https://i.pravatar.cc/150?u=${user.email}`} alt={user.name} className="w-16 h-16 rounded-full mb-2 object-cover"/>
                                    <p className="font-semibold text-sm">{user.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><TrendingDown size={20}/> Recent Expenses</h3>
                        {project.expenses.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b dark:border-gray-700">
                                        <tr><th className="p-2">Description</th><th className="p-2">Amount</th><th className="p-2">Date</th></tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-700">
                                        {project.expenses.map(exp => (
                                            <tr key={exp.id}>
                                                <td className="p-2">{exp.description}</td>
                                                <td className="p-2 text-red-500">-${exp.amount.toLocaleString()}</td>
                                                <td className="p-2 text-xs">{exp.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No expenses logged for this project yet.</p>
                        )}
                         <form onSubmit={handleAddExpense} className="mt-4 pt-4 border-t dark:border-gray-700 space-y-2">
                             <input type="text" name="description" placeholder="Expense description" value={newExpense.description} onChange={handleExpenseChange} className={`input-field ${errors.description ? 'border-red-500' : ''}`} />
                             {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input type="number" name="amount" placeholder="Amount" value={newExpense.amount} onChange={handleExpenseChange} className={`input-field w-full ${errors.amount ? 'border-red-500' : ''}`} />
                                <input type="date" name="date" value={newExpense.date} onChange={handleExpenseChange} className="input-field w-full" />
                            </div>
                            {errors.amount && <p className="text-red-500 text-xs">{errors.amount}</p>}
                             <button type="submit" className="w-full px-4 py-2 text-sm rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors">Add Expense</button>
                         </form>
                    </Card>
                </div>
            </div>
        </div>
        <style>{`.input-field{display:block;width:100%;padding:0.5rem 0.75rem;font-size:0.875rem;line-height:1.25rem;border:1px solid;border-radius:0.375rem;background-color:transparent;color:inherit}.dark .input-field{border-color:#4b5563}.input-field{border-color:#d1d5db}.input-field:focus{outline:2px solid transparent;outline-offset:2px;border-color:rgb(59 130 246);box-shadow:0 0 0 2px rgb(59 130 246 / .5)}.border-red-500{border-color:#ef4444}.border-red-500:focus{border-color:#ef4444;box-shadow:0 0 0 2px rgb(239 68 68 / .5)}`}</style>
        </>
    );
};

export default ProjectDetails;