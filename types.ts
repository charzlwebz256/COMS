export interface Donor {
    id: number;
    name: string;
    email: string;
    phone: string;
    donor_type: 'Recurring' | 'One-Time' | 'Major Sponsor';
    address: string;
    country: string;
    joined_date: string; // YYYY-MM-DD
    total_donated: number;
}

export interface Donation {
    id: number;
    donor_id: number;
    project_id: number | null; // Can be a general donation
    amount: number;
    date: string; // YYYY-MM-DD
    payment_method: 'Credit Card' | 'PayPal' | 'Bank Transfer';
    receipt_url?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'Admin' | 'Staff' | 'Volunteer';
    phone: string;
    joined_date: string; // YYYY-MM-DD
    status: 'Active' | 'Inactive';
    address: string;
    bio: string;
    assigned_project_ids: number[];
}

export interface Milestone {
    name: string;
    completed: boolean;
    due_date: string; // YYYY-MM-DD
}

export interface ProjectExpense {
    id: number;
    description: string;
    amount: number;
    date: string; // YYYY-MM-DD
}

export interface Project {
    id: number;
    name: string;
    description: string;
    status: 'Active' | 'Completed' | 'Pending' | 'On Hold';
    start_date: string; // YYYY-MM-DD
    end_date: string; // YYYY-MM-DD
    budget: number;
    total_donations: number;
    beneficiaries_helped: number;
    location: string;
    milestones: Milestone[];
    team_members: number[]; // Array of User IDs
    project_lead_id: number; // User ID
    expenses: ProjectExpense[];
}

export interface BeneficiarySupport {
    date: string;
    type: 'Financial' | 'Food' | 'Health' | 'Education';
    amount?: number;
    project_id: number;
}

export interface Beneficiary {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    joined_date: string; // YYYY-MM-DD
    status: 'Active' | 'Inactive';
    project_ids: number[]; // Projects they are part of
    age: number;
    gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
    household_size: number;
    notes: string;
    support_history: BeneficiarySupport[];
}

export interface Event {
    id: number;
    title: string;
    description: string;
    date: string; // YYYY-MM-DD
    location: string;
    budget: number;
    project_id: number | null; // Can be a general event
    participants: number;
}