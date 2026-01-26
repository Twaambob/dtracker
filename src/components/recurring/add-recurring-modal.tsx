import React, { useState } from 'react';
import { X, User as UserIcon, DollarSign, Calendar, Mail, Repeat, Check, AlertTriangle, Home, Zap, Shield, CreditCard, Wallet } from 'lucide-react';
import type { RecurringFrequency, RecurringCategory } from '@/types';
import { calculateNextDueDate } from '@/lib/recurring-utils';

interface AddRecurringModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (transaction: any) => void;
}

export const AddRecurringModal: React.FC<AddRecurringModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [type, setType] = useState<'credit' | 'debt'>('debt');
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
    const [startDate, setStartDate] = useState('');
    const [category, setCategory] = useState<RecurringCategory>('other');
    const [note, setNote] = useState('');
    const [contact, setContact] = useState('');
    const [validationError, setValidationError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError('');

        if (!name || !amount || !startDate) {
            setValidationError('Please fill in all required fields');
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setValidationError('Please enter a valid amount');
            return;
        }

        // Calculate next due date
        const start = new Date(startDate);
        const nextDue = calculateNextDueDate(start, frequency);

        onAdd({
            type,
            name,
            amount: amountNum,
            frequency,
            start_date: startDate,
            next_due_date: nextDue.toISOString().split('T')[0],
            category,
            note,
            contact,
            active: true
        });

        // Reset form
        setName('');
        setAmount('');
        setStartDate('');
        setNote('');
        setContact('');
        setValidationError('');
        onClose();
    };

    const categoryIcons = {
        salary: Wallet,
        rent: Home,
        utilities: Zap,
        subscription: Repeat,
        insurance: Shield,
        loan: CreditCard,
        other: DollarSign
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-[#1a1a1a] border border-[#d4af37]/30 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 flex justify-between items-center p-6 border-b border-[#d4af37]/10 bg-gradient-to-r from-[#1a1a1a] to-[#252525] z-10">
                    <h2 className="text-xl font-bold text-[#d4af37] font-serif tracking-wide">New Recurring Transaction</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {validationError && (
                        <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
                            <AlertTriangle size={16} /> <span>{validationError}</span>
                        </div>
                    )}

                    {/* Type Selection */}
                    <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                        <button
                            type="button"
                            onClick={() => setType('credit')}
                            className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${type === 'credit'
                                ? 'bg-emerald-900/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            They Owe Me
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('debt')}
                            className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${type === 'debt'
                                ? 'bg-red-900/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            I Owe Them
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="space-y-2 col-span-2">
                            <label className="text-[10px] text-[#d4af37]/70 uppercase tracking-widest">Name *</label>
                            <div className="relative group">
                                <UserIcon className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={18} />
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Monthly Rent, Netflix, Salary"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-700"
                                />
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                            <label className="text-[10px] text-[#d4af37]/70 uppercase tracking-widest">Amount *</label>
                            <div className="relative group">
                                <DollarSign className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={18} />
                                <input
                                    type="number"
                                    required
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    step="0.01"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-700 font-mono"
                                />
                            </div>
                        </div>

                        {/* Start Date */}
                        <div className="space-y-2">
                            <label className="text-[10px] text-[#d4af37]/70 uppercase tracking-widest">Start Date *</label>
                            <div className="relative group">
                                <Calendar className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={18} />
                                <input
                                    type="date"
                                    required
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-2 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all text-sm [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        {/* Frequency */}
                        <div className="space-y-2">
                            <label className="text-[10px] text-[#d4af37]/70 uppercase tracking-widest">Frequency *</label>
                            <div className="relative group">
                                <Repeat className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={18} />
                                <select
                                    value={frequency}
                                    onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all text-sm appearance-none cursor-pointer"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="biweekly">Bi-weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="semiannually">Semi-annually</option>
                                    <option value="annually">Annually</option>
                                </select>
                            </div>
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-[10px] text-[#d4af37]/70 uppercase tracking-widest">Category *</label>
                            <div className="relative group">
                                {React.createElement(categoryIcons[category], {
                                    className: "absolute left-3 top-3 text-gray-500 group-focus-within:text-[#d4af37] transition-colors",
                                    size: 18
                                })}
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as RecurringCategory)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all text-sm appearance-none cursor-pointer"
                                >
                                    <option value="salary">Salary</option>
                                    <option value="rent">Rent</option>
                                    <option value="utilities">Utilities</option>
                                    <option value="subscription">Subscription</option>
                                    <option value="insurance">Insurance</option>
                                    <option value="loan">Loan</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="space-y-2 col-span-2">
                            <label className="text-[10px] text-[#d4af37]/70 uppercase tracking-widest">Contact (Optional)</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Contact info"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-700 text-sm"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2 col-span-2">
                            <label className="text-[10px] text-[#d4af37]/70 uppercase tracking-widest">Notes (Optional)</label>
                            <textarea
                                placeholder="Additional details..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={3}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-700 text-sm resize-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-4 py-3 bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] flex justify-center items-center gap-2"
                    >
                        <Check size={18} /> Create Recurring Transaction
                    </button>
                </form>
            </div>
        </div>
    );
};
