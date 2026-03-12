import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AcademicCapIcon, EyeIcon, EyeSlashIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            toast.error('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const res = await authAPI.login({ username, password });
            login(res.data.token, res.data.admin);
            toast.success(`Welcome back, ${res.data.admin.name}!`);
            navigate('/dashboard');
        } catch (error) {
            // Error toasts are handled by the api interceptor
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left panel - branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 to-primary-900 flex-col justify-between p-12">
                <div className="flex items-center space-x-3">
                    <AcademicCapIcon className="h-10 w-10 text-white" />
                    <span className="text-white font-bold text-2xl tracking-wide">ExamHall</span>
                </div>
                <div>
                    <h1 className="text-white text-4xl font-bold leading-tight mb-4">
                        Exam Hall Allocation System
                    </h1>
                    <p className="text-primary-200 text-lg leading-relaxed">
                        Streamline exam hall management with automated student allocation, real-time tracking, and comprehensive reporting.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Students', value: 'Managed' },
                        { label: 'Rooms', value: 'Allocated' },
                        { label: 'Exams', value: 'Scheduled' },
                        { label: 'Reports', value: 'Generated' },
                    ].map((item) => (
                        <div key={item.label} className="bg-white/10 backdrop-blur rounded-xl p-4">
                            <p className="text-primary-200 text-sm">{item.label}</p>
                            <p className="text-white font-semibold text-lg">{item.value}</p>
                        </div>
                    ))}
                </div>
                <p className="text-primary-300 text-sm">© 2024 ExamHall. All rights reserved.</p>
            </div>

            {/* Right panel - login form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center space-x-2 mb-8">
                        <AcademicCapIcon className="h-8 w-8 text-primary-600" />
                        <span className="text-primary-700 font-bold text-xl">ExamHall</span>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <div className="mb-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                                <LockClosedIcon className="h-8 w-8 text-primary-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
                            <p className="text-gray-500 mt-1 text-sm">Sign in to manage exam hall allocations</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        autoComplete="username"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-gray-50"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                <div className="relative">
                                    <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-gray-50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                    >
                                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                id="login-btn"
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-xs text-gray-400">
                            Default credentials: <span className="font-medium text-gray-600">admin / admin123</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
