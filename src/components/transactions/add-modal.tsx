
import React, { useState } from 'react';
import { X, User as UserIcon, DollarSign, Calendar, Mail, Zap, Check, AlertTriangle } from 'lucide-react';
import { validateTransaction } from '@/lib/security';

export const AddModal = ({ isOpen, onClose, onAdd }: any) => {
    const [type, setType] = useState('debt');
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [contact, setContact] = useState('');
    const [returnsPercentage, setReturnsPercentage] = useState('');
    const [validationError, setValidationError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError('');

        // Validate transaction data
        const validation = validateTransaction({
            type,
            name,
            amount: parseFloat(amount),
            note,
            contact,
            dueDate,
            returnsPercentage: returnsPercentage ? parseFloat(returnsPercentage) : undefined
        });

        if (!validation.valid) {
            setValidationError(validation.errors.join(' '));
            return;
        }

        // Use sanitized data
        onAdd({
            ...validation.sanitized,
            createdAt: Date.now(),
            cleared: false
        });

        setName(''); setAmount(''); setNote(''); setDueDate(''); setContact(''); setReturnsPercentage(''); setValidationError(''); onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-[#1a1a1a] border border-[#d4af37]/30 rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-[#d4af37]/10 bg-gradient-to-r from-[#1a1a1a] to-[#252525]">
                    <h2 className="text-xl font-bold text-[#d4af37] font-serif tracking-wide">New Entry</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {validationError && (
                        <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
                            <AlertTriangle size={16} /> <span>{validationError}</span>
                        </div>
                    )}
                    <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                        <button type="button" onClick={() => setType('credit')} className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${type === 'credit' ? 'bg-emerald-900/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}>They Owe Me</button>
                        <button type="button" onClick={() => setType('debt')} className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${type === 'debt' ? 'bg-red-900/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}>I Owe Them</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2"><label className="text-[10px] text-[#d4af37]/70 uppercase tracking-widest">Entity Name</label><div className="relative group"><UserIcon className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={18} /><input type="text" required placeholder="e.g. John Doe" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-700" /></div></div>
                        <div className="space-y-2 col-span-2"><label className="text-[10px] text-[#d4af37]/70 uppercase tracking-widest">Amount</label><div className="relative group"><DollarSign className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={18} /><input type="number" required placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-700 font-mono" /></div></div>
                        <div className="space-y-2"><label className="text-[10px] text-[#d4af37]/70 uppercase tracking-widest">Due Date</label><div className="relative group"><Calendar className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={18} /><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-2 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-700 text-sm [color-scheme:dark]" /></div></div>
                        <div className="space-y-2"><label className="text-[10px] text-[#d4af37]/70 uppercase tracking-widest">Contact</label><div className="relative group"><Mail className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={18} /><input type="text" placeholder="Contact Info" value={contact} onChange={(e) => setContact(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-700 text-sm" /></div></div>
                    </div>
                    <div className="space-y-2"><label className="text-[10px] text-[#d4af37]/70 uppercase tracking-widest">Returns % (Optional)</label><div className="relative group"><Zap className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={18} /><input type="number" placeholder="e.g. 10" value={returnsPercentage} onChange={(e) => setReturnsPercentage(e.target.value)} min="0" max="100" step="0.1" className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-700 text-sm font-mono" /></div></div>
                    <div className="space-y-2"><label className="text-[10px] text-[#d4af37]/70 uppercase tracking-widest">Notes</label><input type="text" placeholder="e.g. Dinner split, Rent" value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-700 text-sm" /></div>
                    <button type="submit" className="w-full mt-4 py-3 bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] flex justify-center items-center gap-2"><Check size={18} /> Confirm Entry</button>
                </form>
            </div>
        </div>
    );
};
