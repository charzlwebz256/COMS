import React, { useState, useEffect } from 'react';
import { Project, User } from '../../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface AddProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (project: Omit<Project, 'id' | 'total_donations' | 'beneficiaries_helped' | 'expenses'> & { id?: number }) => void;
    projectToEdit: Project | null;
    users: User[];
}

type FormData = Omit<Project, 'id' | 'total_donations' | 'beneficiaries_helped' | 'expenses'>;
type FormErrors = { [K in keyof FormData]?: string } & { milestones?: string };


const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onSave, projectToEdit, users }) => {
    const isEditMode = !!projectToEdit;

    const getInitialState = (): FormData => ({
        name: projectToEdit?.name || '',
        description: projectToEdit?.description || '',
        status: projectToEdit?.status || 'Pending',
        start_date: projectToEdit?.start_date || new Date().toISOString().split('T')[0],
        end_date: projectToEdit?.end_date || '',
        budget: projectToEdit?.budget || 0,
        milestones: projectToEdit?.milestones || [],
        team_members: projectToEdit?.team_members || [],
        project_lead_id: projectToEdit?.project_lead_id || 0,
        location: projectToEdit?.location || '',
    });

    const [formData, setFormData] = useState<FormData>(getInitialState());
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
            setErrors({});
        }
    }, [isOpen, projectToEdit]);

    if (!isOpen) return null;
    
    const validate = (): FormErrors => {
        const newErrors: FormErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Project name is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.start_date) newErrors.start_date = 'Start date is required';
        if (!formData.end_date) newErrors.end_date = 'End date is required';
        if (formData.start_date && formData.end_date && new Date(formData.end_date) < new Date(formData.start_date)) {
             newErrors.end_date = 'End date cannot be before start date';
        }
        if (formData.budget <= 0) newErrors.budget = 'Budget must be a positive number';
        if (formData.project_lead_id === 0) newErrors.project_lead_id = 'A project lead must be assigned';
        if (formData.milestones.some(m => !m.name.trim() || !m.due_date)) {
            newErrors.milestones = 'All milestones must have a name and a due date.';
        }
        return newErrors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            onSave({ ...formData, id: projectToEdit?.id });
        }
    };
    
    // FIX: The 'type' property was being destructured from a union type where it doesn't always exist,
    // causing a type inference issue. Using a type guard ('type' in e.target) is a safer way to
    // check for number inputs before parsing.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const parsedValue = 'type' in e.target && e.target.type === 'number' ? parseFloat(value) || 0 : value;
        setFormData(prev => ({ ...prev, [name]: parsedValue }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // selectedOptions is an HTMLCollectionOf<HTMLOptionElement>; cast Array.from result for correct typing
        const selectedOptions = Array.from(e.target.selectedOptions) as HTMLOptionElement[];
        const selectedIds = selectedOptions.map(option => parseInt(option.value, 10));
        setFormData(prev => ({ ...prev, team_members: selectedIds }));
    };
    
    const handleMilestoneChange = (index: number, field: 'name' | 'due_date', value: string) => {
        const newMilestones = [...formData.milestones];
        newMilestones[index] = { ...newMilestones[index], [field]: value };
        setFormData(prev => ({ ...prev, milestones: newMilestones }));
    };

    const addMilestone = () => {
        setFormData(prev => ({
            ...prev,
            milestones: [...prev.milestones, { name: '', completed: false, due_date: '' }]
        }));
    };

    const removeMilestone = (index: number) => {
        setFormData(prev => ({
            ...prev,
            milestones: prev.milestones.filter((_, i) => i !== index)
        }));
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4 transform" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-semibold">{isEditMode ? 'Edit Project' : 'Add New Project'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="name" className="block text-sm font-medium">Project Name</label>
                                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={`mt-1 input-field ${errors.name ? 'border-red-500' : ''}`} required />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium">Status</label>
                                <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 input-field">
                                    <option>Pending</option><option>Active</option><option>On Hold</option><option>Completed</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium">Description</label>
                            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className={`mt-1 input-field ${errors.description ? 'border-red-500' : ''}`}></textarea>
                             {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="project_lead_id" className="block text-sm font-medium">Project Lead</label>
                                <select name="project_lead_id" id="project_lead_id" value={formData.project_lead_id} onChange={handleChange} className={`mt-1 input-field ${errors.project_lead_id ? 'border-red-500' : ''}`}>
                                    <option value={0} disabled>Select a lead</option>
                                    {users.filter(u => u.role !== 'Volunteer').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                                 {errors.project_lead_id && <p className="text-red-500 text-xs mt-1">{errors.project_lead_id}</p>}
                            </div>
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium">Location</label>
                                <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} className="mt-1 input-field" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="start_date" className="block text-sm font-medium">Start Date</label>
                                <input type="date" name="start_date" id="start_date" value={formData.start_date} onChange={handleChange} className={`mt-1 input-field ${errors.start_date ? 'border-red-500' : ''}`} required />
                                {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
                            </div>
                             <div>
                                <label htmlFor="end_date" className="block text-sm font-medium">End Date</label>
                                <input type="date" name="end_date" id="end_date" value={formData.end_date} onChange={handleChange} className={`mt-1 input-field ${errors.end_date ? 'border-red-500' : ''}`} required />
                                {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
                            </div>
                        </div>
                         <div>
                            <label htmlFor="budget" className="block text-sm font-medium">Total Budget ($)</label>
                            <input type="number" name="budget" id="budget" value={formData.budget} onChange={handleChange} className={`mt-1 input-field ${errors.budget ? 'border-red-500' : ''}`} required min="1" />
                            {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget}</p>}
                        </div>
                         <div>
                            <label htmlFor="team_members" className="block text-sm font-medium">Team Members</label>
                            <select name="team_members" id="team_members" multiple value={formData.team_members.map(String)} onChange={handleTeamChange} className="mt-1 input-field h-32">
                                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                            </select>
                        </div>
                        <div>
                            <h3 className="text-md font-medium mb-2">Milestones</h3>
                            <div className="space-y-2">
                                {formData.milestones.map((milestone, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row items-center gap-2">
                                        <input type="text" placeholder="Milestone Name" value={milestone.name} onChange={(e) => handleMilestoneChange(index, 'name', e.target.value)} className="input-field w-full" />
                                        <input type="date" value={milestone.due_date} onChange={(e) => handleMilestoneChange(index, 'due_date', e.target.value)} className="input-field w-full sm:w-auto" />
                                        <button type="button" onClick={() => removeMilestone(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full self-end sm:self-center"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                                {errors.milestones && <p className="text-red-500 text-xs mt-1">{errors.milestones}</p>}
                            </div>
                             <button type="button" onClick={addMilestone} className="mt-2 text-sm text-primary-500 font-semibold flex items-center gap-1 hover:text-primary-600">
                                <Plus size={16}/> Add Milestone
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-end items-center p-4 border-t dark:border-gray-700 space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors">{isEditMode ? 'Update Project' : 'Save Project'}</button>
                    </div>
                </form>
            </div>
            <style>{`.input-field{display:block;width:100%;padding:0.5rem 0.75rem;font-size:0.875rem;line-height:1.25rem;border:1px solid;border-radius:0.375rem;background-color:transparent;color:inherit}.dark .input-field{border-color:#4b5563}.input-field{border-color:#d1d5db}.input-field:focus{outline:2px solid transparent;outline-offset:2px;border-color:rgb(59 130 246);box-shadow:0 0 0 2px rgb(59 130 246 / .5)}.border-red-500{border-color:#ef4444}.border-red-500:focus{border-color:#ef4444;box-shadow:0 0 0 2px rgb(239 68 68 / .5)}`}</style>
        </div>
    );
};

export default AddProjectModal;