import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { X } from 'lucide-react';

interface AddStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Omit<User, 'id' | 'bio' | 'assigned_project_ids' | 'address'> & { id?: number }) => void;
    userToEdit: User | null;
}

type FormData = Omit<User, 'id' | 'bio' | 'assigned_project_ids' | 'address'>;
type FormErrors = { [K in keyof FormData]?: string };

const AddStaffModal: React.FC<AddStaffModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
    const isEditMode = !!userToEdit;

    const getInitialState = (): FormData => ({
        name: userToEdit?.name || '',
        email: userToEdit?.email || '',
        phone: userToEdit?.phone || '',
        role: userToEdit?.role || 'Volunteer',
        status: userToEdit?.status || 'Active',
        joined_date: userToEdit?.joined_date || new Date().toISOString().split('T')[0],
    });

    const [formData, setFormData] = useState<FormData>(getInitialState());
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
            setErrors({});
        }
    }, [isOpen, userToEdit]);

    if (!isOpen) return null;

    const validate = (): FormErrors => {
        const newErrors: FormErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.joined_date) newErrors.joined_date = 'Joined date is required';
        return newErrors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            onSave({ ...formData, id: userToEdit?.id });
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4 transform" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-semibold">{isEditMode ? 'Edit Member' : 'Add New Member'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium">Full Name</label>
                                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={`mt-1 input-field ${errors.name ? 'border-red-500' : ''}`} required />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium">Role</label>
                                <select name="role" id="role" value={formData.role} onChange={handleChange} className="mt-1 input-field">
                                    <option>Admin</option><option>Staff</option><option>Volunteer</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium">Email Address</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={`mt-1 input-field ${errors.email ? 'border-red-500' : ''}`} required />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium">Phone Number (Optional)</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 input-field" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium">Status</label>
                                <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 input-field">
                                    <option>Active</option><option>Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="joined_date" className="block text-sm font-medium">Joined Date</label>
                                <input type="date" name="joined_date" id="joined_date" value={formData.joined_date} onChange={handleChange} className={`mt-1 input-field ${errors.joined_date ? 'border-red-500' : ''}`} required />
                                {errors.joined_date && <p className="text-red-500 text-xs mt-1">{errors.joined_date}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end items-center p-4 border-t dark:border-gray-700 space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors">{isEditMode ? 'Update Member' : 'Save Member'}</button>
                    </div>
                </form>
            </div>
            <style>{`.input-field{display:block;width:100%;padding:0.5rem 0.75rem;font-size:0.875rem;line-height:1.25rem;border:1px solid;border-radius:0.375rem;background-color:transparent;color:inherit}.dark .input-field{border-color:#4b5563}.input-field{border-color:#d1d5db}.input-field:focus{outline:2px solid transparent;outline-offset:2px;border-color:rgb(59 130 246);box-shadow:0 0 0 2px rgb(59 130 246 / .5)}.border-red-500{border-color:#ef4444}.border-red-500:focus{border-color:#ef4444;box-shadow:0 0 0 2px rgb(239 68 68 / .5)}`}</style>
        </div>
    );
};

export default AddStaffModal;