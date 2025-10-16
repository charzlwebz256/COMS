
import React, { useState, useEffect } from 'react';
import { Event } from '../../types';
import { X } from 'lucide-react';

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<Event, 'id' | 'participants'> & { id?: number }) => void;
    eventToEdit: Event | null;
}

type FormData = Omit<Event, 'id' | 'participants'>;
type FormErrors = { [K in keyof FormData]?: string };

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onSave, eventToEdit }) => {
    const isEditMode = !!eventToEdit;

    const getInitialState = (): FormData => ({
        title: eventToEdit?.title || '',
        description: eventToEdit?.description || '',
        date: eventToEdit?.date || new Date().toISOString().split('T')[0],
        location: eventToEdit?.location || '',
        budget: eventToEdit?.budget || 0,
        project_id: eventToEdit?.project_id || null,
    });

    const [formData, setFormData] = useState<FormData>(getInitialState());
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
            setErrors({});
        }
    }, [isOpen, eventToEdit]);

    if (!isOpen) return null;

    const validate = (): FormErrors => {
        const newErrors: FormErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Event title is required';
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (formData.budget < 0) newErrors.budget = 'Budget cannot be negative';
        return newErrors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            onSave({ ...formData, id: eventToEdit?.id });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const parsedValue = e.target.type === 'number' ? parseFloat(value) || 0 : value;
        setFormData(prev => ({ ...prev, [name]: parsedValue }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4 transform" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-semibold">{isEditMode ? 'Edit Event' : 'Add New Event'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium">Event Title</label>
                            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className={`mt-1 input-field ${errors.title ? 'border-red-500' : ''}`} required />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium">Description (Optional)</label>
                            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 input-field"></textarea>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium">Date</label>
                                <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} className={`mt-1 input-field ${errors.date ? 'border-red-500' : ''}`} required />
                                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                            </div>
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium">Location</label>
                                <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} className={`mt-1 input-field ${errors.location ? 'border-red-500' : ''}`} required />
                                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="budget" className="block text-sm font-medium">Budget ($)</label>
                                <input type="number" name="budget" id="budget" value={formData.budget} onChange={handleChange} className={`mt-1 input-field ${errors.budget ? 'border-red-500' : ''}`} min="0" />
                                {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget}</p>}
                            </div>
                            <div>
                                <label htmlFor="project_id" className="block text-sm font-medium">Associated Project ID (Optional)</label>
                                <input type="number" name="project_id" id="project_id" value={formData.project_id || ''} onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData(prev => ({...prev, project_id: value ? parseInt(value, 10) : null}))
                                }} className="mt-1 input-field" />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end items-center p-4 border-t dark:border-gray-700 space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors">{isEditMode ? 'Update Event' : 'Save Event'}</button>
                    </div>
                </form>
            </div>
            <style>{`.input-field{display:block;width:100%;padding:0.5rem 0.75rem;font-size:0.875rem;line-height:1.25rem;border:1px solid;border-radius:0.375rem;background-color:transparent;color:inherit}.dark .input-field{border-color:#4b5563}.input-field{border-color:#d1d5db}.input-field:focus{outline:2px solid transparent;outline-offset:2px;border-color:rgb(59 130 246);box-shadow:0 0 0 2px rgb(59 130 246 / .5)}.border-red-500{border-color:#ef4444}.border-red-500:focus{border-color:#ef4444;box-shadow:0 0 0 2px rgb(239 68 68 / .5)}`}</style>
        </div>
    );
};

export default AddEventModal;
