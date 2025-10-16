import React, { useState } from 'react';
import { Activity, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Card from '../components/ui/Card';

interface LoginPageProps {
    onLoginSuccess: () => void;
    onNavigateToSignup: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigateToSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple mock validation for demo purposes
    if (email === 'admin@coms.org' && password === 'password123') {
            onLoginSuccess();
        } else {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center items-center mb-6">
                    <Activity className="text-primary-500" size={40} />
                    <h1 className="text-3xl font-bold ml-2 text-black dark:text-white">COMS</h1>
                </div>
                <Card className="shadow-2xl">
                    <h2 className="text-2xl font-semibold text-center mb-1 text-black dark:text-white">Welcome Back!</h2>
                    <p className="text-center text-gray-700 dark:text-gray-400 mb-6">Login to your account</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-black dark:text-gray-300">Email Address</label>
                            <div className="relative mt-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="email" 
                                    id="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white" 
                                    placeholder=""
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password"  className="block text-sm font-medium text-black dark:text-gray-300">Password</label>
                            <div className="relative mt-1">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type={isPasswordVisible ? 'text' : 'password'}
                                    id="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white" 
                                    placeholder=""
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                                >
                                    {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            Login
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-700 dark:text-gray-400 mt-6">
                        Don't have an account?{' '}
                        <button onClick={onNavigateToSignup} className="font-medium text-primary-500 hover:underline">
                            Sign Up
                        </button>
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;