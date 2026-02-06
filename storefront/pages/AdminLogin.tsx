import React, { useState } from 'react';
import { Lock, User, ShieldCheck, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
    onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Demo credentials
        if (username === 'admin' && password === 'demo123') {
            onLogin();
        } else {
            setError('Invalid credentials. Use demo credentials: admin / demo123');
        }
    };

    const fillDemoCredentials = () => {
        setUsername('admin');
        setPassword('demo123');
        setError('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
            {/* Back to Store */}
            <a
                href="/"
                className="absolute top-8 left-8 flex items-center gap-2 text-white/90 hover:text-white font-bold transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Store
            </a>

            <div className="w-full max-w-md">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl mb-4">
                        <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-2">Admin Access</h1>
                    <p className="text-white/80 text-lg">Inventory Management System</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username */}
                        <div>
                            <label className="block text-white font-bold mb-2">Username</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/50 focus:border-white/40 focus:outline-none transition-colors"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-white font-bold mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/50 focus:border-white/40 focus:outline-none transition-colors"
                                    placeholder="Enter password"
                                    required
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-rose-500/20 border-2 border-rose-500/40 rounded-2xl">
                                <p className="text-white text-sm font-bold">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-lg hover:bg-white/90 transition-colors"
                        >
                            Sign In
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-white/80 text-sm mb-3 font-bold">Demo Credentials:</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-white/60">Username:</span>
                                <code className="px-3 py-1 bg-white/10 rounded-lg text-white font-mono">admin</code>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/60">Password:</span>
                                <code className="px-3 py-1 bg-white/10 rounded-lg text-white font-mono">demo123</code>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={fillDemoCredentials}
                            className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-colors"
                        >
                            Fill Demo Credentials
                        </button>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="text-center text-white/60 text-sm mt-6">
                    Built by <span className="font-bold">Rupesh Reddy Baitapalli</span>
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
