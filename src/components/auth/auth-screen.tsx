
import React, { useState } from 'react';
import {
    Shield, AlertTriangle, MailCheck, Loader2, Send, Lock, UserPlus, ArrowRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ParticleBackground } from '@/components/ui/particle-background';
import { isValidEmail, isValidPassword, checkRateLimit } from '@/lib/security';

export const AuthScreen = ({ onEnter }: { onEnter: () => void }) => {
    const [view, setView] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [resetSent, setResetSent] = useState(false);

    const handleAuthError = (error: unknown) => {
        setIsLoading(false);
        let msg = 'Authentication failed. Please try again.';

        if (typeof error === 'object' && error !== null) {
            const err = error as Record<string, any>;
            if (err.code && typeof err.code === 'string' && err.code.includes('auth/')) {
                if (err.message && typeof err.message === 'string') {
                    msg = err.message.replace(/Firebase: /g, '').replace(/\(auth-.*\)/g, '').trim();
                }
            } else if (err.message && typeof err.message === 'string') {
                msg = err.message;
            }
        }

        setErrorMessage(msg);
        console.error(error);
    };

    const handleEmailPassword = async (e: React.FormEvent, isSignUp: boolean) => {
        e.preventDefault();
        setErrorMessage('');

        // Rate limiting check
        if (!checkRateLimit('login', 5, 60000)) {
            setErrorMessage('Too many login attempts. Please wait a minute before trying again.');
            return;
        }

        // Validate email
        if (!isValidEmail(email)) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }

        // Validate password for signup
        if (isSignUp) {
            const passwordValidation = isValidPassword(password);
            if (!passwordValidation.valid) {
                setErrorMessage(passwordValidation.message);
                return;
            }
        } else {
            // Basic validation for login
            if (!password || password.length < 6) {
                setErrorMessage('Password is required.');
                return;
            }
        }

        setIsLoading(true);
        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
            onEnter();
        } catch (error) { handleAuthError(error); }
    };

    const handleGoogleSignIn = async () => {
        setErrorMessage(''); setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
            // OAuth will redirect, so onEnter() is called after redirect
        } catch (error) { handleAuthError(error); }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(''); setIsLoading(true);
        if (!email) {
            setErrorMessage("Please enter your email address.");
            setIsLoading(false); return;
        }
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/reset-password'
            });
            if (error) throw error;
            setResetSent(true);
            setIsLoading(false);
        } catch (error) { handleAuthError(error); }
    };

    return (
        <div className="relative min-h-screen z-50 flex items-center justify-center p-4 bg-[#050505] text-white overflow-auto">
            <ParticleBackground />
            <div className="relative z-10 w-full max-w-sm">
                <div className="text-center mb-8 space-y-2">
                    <div className="w-16 h-16 bg-[#d4af37] mx-auto rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.3)] mb-4">
                        <Shield className="text-black w-8 h-8" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#fbf5b7] tracking-wide">
                        SOVEREIGN
                    </h1>
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em]">Personal Ledger</p>
                </div>

                <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#d4af37]/5 to-transparent pointer-events-none" />

                    {view === 'reset' ? (
                        <form onSubmit={handlePasswordReset} className="relative space-y-4">
                            <h3 className="text-[#d4af37] font-serif text-lg font-bold text-center mb-2">Reset Password</h3>
                            {errorMessage && <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm flex items-center gap-2"><AlertTriangle size={16} /><span>{errorMessage}</span></div>}
                            {resetSent ? (
                                <div className="text-center space-y-4">
                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400"><MailCheck size={24} /></div>
                                    <p className="text-sm text-gray-300">Check your inbox! We've sent a password reset link to <span className="text-white font-bold">{email}</span>.</p>
                                    <button onClick={() => { setView('login'); setResetSent(false); }} className="text-[#d4af37] text-sm font-bold hover:underline">Back to Login</button>
                                </div>
                            ) : (
                                <>
                                    <p className="text-xs text-center text-gray-500 mb-4">Enter your email and the Sovereign will dispatch a courier to restore your access.</p>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-[#d4af37] uppercase tracking-widest font-bold">Email</label>
                                        <div className="relative">
                                            <MailCheck className="absolute left-3 top-3 text-gray-500" size={18} />
                                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@sovereign.net" className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#d4af37] transition-all" required />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={isLoading} className="w-full h-12 bg-[#d4af37] hover:bg-[#b5952f] disabled:opacity-50 text-black font-bold rounded-xl transition-all flex justify-center items-center gap-2">
                                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={18} />} <span>Send Reset Link</span>
                                    </button>
                                    <button type="button" onClick={() => setView('login')} className="w-full text-xs text-gray-500 hover:text-white transition-colors">Cancel</button>
                                </>
                            )}
                        </form>
                    ) : (
                        <>
                            <form onSubmit={(e) => handleEmailPassword(e, view === 'signup')} className="relative space-y-4">
                                {errorMessage && (
                                    <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
                                        <AlertTriangle size={16} /> <span>{errorMessage}</span>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <label className="text-[10px] text-[#d4af37] uppercase tracking-widest font-bold">Email</label>
                                    <div className="relative">
                                        <MailCheck className="absolute left-3 top-3 text-gray-500" size={18} />
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@sovereign.net"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#d4af37] transition-all" required />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-[#d4af37] uppercase tracking-widest font-bold">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#d4af37] transition-all" required />
                                    </div>
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full h-12 bg-[#d4af37] hover:bg-[#b5952f] disabled:bg-[#d4af37]/50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] flex justify-center items-center gap-2">
                                    {isLoading ? <><Loader2 className="animate-spin" size={20} /><span>Processing...</span></> : <>{view === 'login' ? <Lock size={18} /> : <UserPlus size={18} />}<span>{view === 'login' ? 'Authorize Access' : 'Create Account'}</span></>}
                                </button>
                            </form>

                            {view === 'login' && (
                                <div className="text-center mt-2">
                                    <button type="button" onClick={() => { setView('reset'); setErrorMessage(''); }} className="text-[10px] text-gray-500 hover:text-[#d4af37] transition-colors">Forgot your password?</button>
                                </div>
                            )}

                            <div className="flex items-center my-6">
                                <div className="flex-grow border-t border-white/10" />
                                <span className="px-3 text-xs text-gray-600 uppercase">OR</span>
                                <div className="flex-grow border-t border-white/10" />
                            </div>
                            <div className="space-y-3">
                                <button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full h-12 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all flex justify-center items-center gap-3 border border-white/10 disabled:opacity-50">
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" /> Continue with Google
                                </button>
                            </div>
                            <div className="mt-8 pt-4 border-t border-white/5 text-center">
                                <button onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setErrorMessage(''); setEmail(''); setPassword(''); }} className="text-xs text-gray-500 hover:text-[#d4af37] transition-colors flex items-center justify-center mx-auto">
                                    {view === 'login' ? 'Need an account? Sign Up' : 'Already registered? Log In'} <ArrowRight size={12} className="ml-1" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
