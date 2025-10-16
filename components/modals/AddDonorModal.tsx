import React, { useState, useEffect } from 'react';
import { Donor } from '../../types';
import { X } from 'lucide-react';

const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic of the", "Congo, Republic of the", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czechia",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];


interface AddDonorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (donor: Omit<Donor, 'total_donated'> & { id?: number }) => void;
    donorToEdit: Donor | null;
}

type FormData = Omit<Donor, 'id' | 'total_donated'>;
type FormErrors = { [K in keyof FormData]?: string };

const AddDonorModal: React.FC<AddDonorModalProps> = ({ isOpen, onClose, onSave, donorToEdit }) => {
    const isEditMode = !!donorToEdit;

    const getInitialState = (): FormData => ({
        name: donorToEdit?.name || '',
        email: donorToEdit?.email || '',
        phone: donorToEdit?.phone || '',
        donor_type: donorToEdit?.donor_type || 'One-Time',
        address: donorToEdit?.address || '',
        country: donorToEdit?.country || 'United States of America',
        joined_date: donorToEdit?.joined_date || new Date().toISOString().split('T')[0],
    });

    const [formData, setFormData] = useState<FormData>(getInitialState());
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
            setErrors({});
        }
    }, [isOpen, donorToEdit]);

    if (!isOpen) return null;

    const validate = (): FormErrors => {
        const newErrors: FormErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.joined_date) newErrors.joined_date = 'Joined date is required';
        if (!formData.country) newErrors.country = 'Country is required';
        return newErrors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            onSave({ ...formData, id: donorToEdit?.id });
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
                    <h2 className="text-xl font-semibold">{isEditMode ? 'Edit Donor' : 'Add New Donor'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium">Full Name</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={`mt-1 input-field ${errors.name ? 'border-red-500' : ''}`} required />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
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
                         <div>
                            <label htmlFor="donor_type" className="block text-sm font-medium">Donor Type</label>
                            <select name="donor_type" id="donor_type" value={formData.donor_type} onChange={handleChange} className="mt-1 input-field">
                                <option>One-Time</option><option>Recurring</option><option>Major Sponsor</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium">Address (Optional)</label>
                            <textarea name="address" id="address" value={formData.address} onChange={handleChange} rows={2} className="mt-1 input-field"></textarea>
                        </div>
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium">Country</label>
                            <select name="country" id="country" value={formData.country} onChange={handleChange} className={`mt-1 input-field ${errors.country ? 'border-red-500' : ''}`} required>
                                {countries.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                        </div>
                         <div>
                            <label htmlFor="joined_date" className="block text-sm font-medium">Joined Date</label>
                            <input type="date" name="joined_date" id="joined_date" value={formData.joined_date} onChange={handleChange} className={`mt-1 input-field ${errors.joined_date ? 'border-red-500' : ''}`} required />
                            {errors.joined_date && <p className="text-red-500 text-xs mt-1">{errors.joined_date}</p>}
                        </div>
                    </div>
                    <div className="flex justify-end items-center p-4 border-t dark:border-gray-700 space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors">{isEditMode ? 'Update Donor' : 'Save Donor'}</button>
                    </div>
                </form>
            </div>
            <style>{`.input-field{display:block;width:100%;padding:0.5rem 0.75rem;font-size:0.875rem;line-height:1.25rem;border:1px solid;border-radius:0.375rem;background-color:transparent;color:inherit}.dark .input-field{border-color:#4b5563}.input-field{border-color:#d1d5db}.input-field:focus{outline:2px solid transparent;outline-offset:2px;border-color:rgb(59 130 246);box-shadow:0 0 0 2px rgb(59 130 246 / .5)}.border-red-500{border-color:#ef4444}.border-red-500:focus{border-color:#ef4444;box-shadow:0 0 0 2px rgb(239 68 68 / .5)}`}</style>
        </div>
    );
};

export default AddDonorModal;