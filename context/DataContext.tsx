import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Donor, Project, Beneficiary, User, Event, Donation } from '../types';

// This file centralizes data management to avoid prop drilling,
// especially for components like the AI assistant that need wide data access.

// --- MOCK DATA IMPORTS (Simplified for this file) ---
// In a real app, these would be API calls. Here, we'll redefine the generation logic.
const firstNames = ["Liam", "Olivia", "Noah", "Emma", "Oliver", "Ava", "Elijah", "Charlotte", "William", "Sophia"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
const projectNames = ["Clean Water Initiative", "Youth Mentorship Program", "Urban Farming Initiative", "Digital Literacy for Seniors", "Community Health Clinic"];
const eventTitles = ["Community Cleanup Day", "Tech Skills Workshop", "Annual Fundraising Gala", "Local Food Drive", "Health and Wellness Fair"];
const roles: User['role'][] = ['Admin', 'Staff', 'Volunteer'];
const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date): string => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];

const generateMockDonors = (count: number): Donor[] => Array.from({ length: count }, (_, i) => ({
    id: i + 1, name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`, email: `donor${i+1}@example.com`, phone: '555-1234', donor_type: getRandomElement(['Recurring', 'One-Time', 'Major Sponsor']), address: '123 Main St', country: 'USA', joined_date: getRandomDate(new Date(2021, 0, 1), new Date()), total_donated: 0 // Total donated will be calculated from donations
}));

const generateMockProjects = (count: number): Project[] => Array.from({ length: count }, (_, i) => ({
    id: i + 1, name: getRandomElement(projectNames), description: 'A project description.', status: getRandomElement(['Active', 'Completed', 'Pending', 'On Hold']), start_date: '2023-01-01', end_date: '2024-01-01', budget: Math.floor(Math.random() * 50000) + 25000, total_donations: 0, beneficiaries_helped: Math.floor(Math.random() * 200), location: 'Anytown', milestones: [], team_members: [1,2], project_lead_id: 1, expenses: []
}));

const generateMockBeneficiaries = (count: number): Beneficiary[] => Array.from({ length: count }, (_, i) => ({
    id: i + 1, name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`, email: `beneficiary${i+1}@example.com`, phone: '555-5678', address: '456 Oak Ave', joined_date: getRandomDate(new Date(2022, 0, 1), new Date()), status: getRandomElement(['Active', 'Inactive']), project_ids: [1], age: Math.floor(Math.random() * 50) + 18, gender: getRandomElement(['Male', 'Female', 'Other']), household_size: Math.floor(Math.random() * 4) + 1, notes: 'Notes.', support_history: []
}));

const generateMockStaff = (count: number): User[] => Array.from({ length: count }, (_, i) => ({
    id: i + 1, name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`, email: `user${i+1}@coms.org`, role: getRandomElement(roles), phone: '555-8765', joined_date: getRandomDate(new Date(2020, 0, 1), new Date()), status: 'Active', address: '789 Pine Ln', bio: 'A bio.', assigned_project_ids: [1]
}));

const generateMockEvents = (count: number): Event[] => Array.from({ length: count }, (_, i) => ({
    id: i + 1, title: getRandomElement(eventTitles), description: 'An event description.', date: getRandomDate(new Date(2024, 0, 1), new Date(2025, 5, 1)), location: 'Community Hall', budget: 5000, project_id: 1, participants: 100
}));

const generateMockDonations = (count: number, donorIds: number[], projectIds: number[]): Donation[] => Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    donor_id: getRandomElement(donorIds),
    project_id: Math.random() > 0.3 ? getRandomElement(projectIds) : null,
    amount: Math.floor(Math.random() * 500) + 20,
    date: getRandomDate(new Date(2023, 0, 1), new Date()),
    payment_method: getRandomElement(['Credit Card', 'PayPal', 'Bank Transfer']),
}));


// --- CONTEXT DEFINITIONS ---
const DonorsContext = createContext<{ donors: Donor[]; setDonors: React.Dispatch<React.SetStateAction<Donor[]>> }>({ donors: [], setDonors: () => {} });
const ProjectsContext = createContext<{ projects: Project[]; setProjects: React.Dispatch<React.SetStateAction<Project[]>> }>({ projects: [], setProjects: () => {} });
const BeneficiariesContext = createContext<{ beneficiaries: Beneficiary[]; setBeneficiaries: React.Dispatch<React.SetStateAction<Beneficiary[]>> }>({ beneficiaries: [], setBeneficiaries: () => {} });
const StaffContext = createContext<{ staff: User[]; setStaff: React.Dispatch<React.SetStateAction<User[]>> }>({ staff: [], setStaff: () => {} });
const EventsContext = createContext<{ events: Event[]; setEvents: React.Dispatch<React.SetStateAction<Event[]>> }>({ events: [], setEvents: () => {} });
const DonationsContext = createContext<{ donations: Donation[]; setDonations: React.Dispatch<React.SetStateAction<Donation[]>> }>({ donations: [], setDonations: () => {} });


// --- PROVIDERS ---
export const DonorsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [donors, setDonors] = useState<Donor[]>(() => generateMockDonors(100));
    return <DonorsContext.Provider value={{ donors, setDonors }}>{children}</DonorsContext.Provider>;
};
export const ProjectsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [projects, setProjects] = useState<Project[]>(() => generateMockProjects(25));
    return <ProjectsContext.Provider value={{ projects, setProjects }}>{children}</ProjectsContext.Provider>;
};
export const BeneficiariesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(() => generateMockBeneficiaries(500));
    return <BeneficiariesContext.Provider value={{ beneficiaries, setBeneficiaries }}>{children}</BeneficiariesContext.Provider>;
};
export const StaffProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [staff, setStaff] = useState<User[]>(() => generateMockStaff(20));
    return <StaffContext.Provider value={{ staff, setStaff }}>{children}</StaffContext.Provider>;
};
export const EventsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [events, setEvents] = useState<Event[]>(() => generateMockEvents(20));
    return <EventsContext.Provider value={{ events, setEvents }}>{children}</EventsContext.Provider>;
};
export const DonationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { donors, setDonors } = useContext(DonorsContext);
    const { projects, setProjects } = useContext(ProjectsContext);
    const [donations, setDonations] = useState<Donation[]>(() => {
        const donorIds = donors.map(d => d.id);
        const projectIds = projects.map(p => p.id);
        const generatedDonations = generateMockDonations(1000, donorIds, projectIds);
        
        // Post-process to update donor and project totals
        const donorTotals: Record<number, number> = {};
        const projectTotals: Record<number, number> = {};
        
        for (const donation of generatedDonations) {
            donorTotals[donation.donor_id] = (donorTotals[donation.donor_id] || 0) + donation.amount;
            if (donation.project_id) {
                projectTotals[donation.project_id] = (projectTotals[donation.project_id] || 0) + donation.amount;
            }
        }

        setDonors(prevDonors => prevDonors.map(d => ({ ...d, total_donated: donorTotals[d.id] || 0 })));
        setProjects(prevProjects => prevProjects.map(p => ({ ...p, total_donations: projectTotals[p.id] || 0 })));
        
        return generatedDonations;
    });
    return <DonationsContext.Provider value={{ donations, setDonations }}>{children}</DonationsContext.Provider>;
};


// --- HOOKS ---
export const useDonors = () => useContext(DonorsContext);
export const useProjects = () => useContext(ProjectsContext);
export const useBeneficiaries = () => useContext(BeneficiariesContext);
export const useStaff = () => useContext(StaffContext);
export const useEvents = () => useContext(EventsContext);
export const useDonations = () => useContext(DonationsContext);