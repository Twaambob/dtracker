import React, { useState } from 'react';
import { X, Settings, Repeat, Plus } from 'lucide-react';
import type { RecurringTransaction } from '@/types';
import { RecurringCard } from './recurring-card';

interface ManageRecurringModalProps {
    isOpen: boolean;
    onClose: () => void;
    recurringTransactions: RecurringTransaction[];
    onToggleActive: (id: string, active: boolean) => void;
    onDelete: (id: string) => void;
    onOpenAdd: () => void;
}

export const ManageRecurringModal: React.FC<ManageRecurringModalProps> = ({
    isOpen,
    onClose,
    recurringTransactions,
    onToggleActive,
    onDelete,
    onOpenAdd
}) => {
    const [showInactive, setShowInactive] = useState(false);

    if (!isOpen) return null;

    const filteredTransactions = showInactive
        ? recurringTransactions
        : recurringTransactions.filter((t) => t.active);

    const activeCount = recurringTransactions.filter((t) => t.active).length;
    const inactiveCount = recurringTransactions.length - activeCount;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-3xl bg-[#1a1a1a] border border-[#d4af37]/30 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="sticky top-0 flex justify-between items-center p-6 border-b border-[#d4af37]/10 bg-gradient-to-r from-[#1a1a1a] to-[#252525] z-10">
                    <div>
                        <h2 className="text-xl font-bold text-[#d4af37] font-serif tracking-wide flex items-center gap-2">
                            <Settings size={24} />
                            Manage Recurring Transactions
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                            {activeCount} active, {inactiveCount} inactive
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                onOpenAdd();
                                onClose();
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 hover:border-purple-500/50 rounded-lg transition-all text-purple-300 hover:text-purple-200 text-sm font-semibold"
                        >
                            <Plus size={16} /> Add New
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowInactive(false)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${!showInactive
                                ? 'bg-[#d4af37] text-black'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            Active ({activeCount})
                        </button>
                        <button
                            onClick={() => setShowInactive(true)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${showInactive
                                ? 'bg-[#d4af37] text-black'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            All ({recurringTransactions.length})
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {filteredTransactions.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 py-12">
                            <Repeat size={40} className="mb-4 opacity-20" />
                            <p className="text-sm">
                                {showInactive
                                    ? 'No recurring transactions yet.'
                                    : 'No active recurring transactions.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredTransactions.map((item) => (
                                <RecurringCard
                                    key={item.id}
                                    item={item}
                                    onClick={() => { }}
                                    onToggleActive={onToggleActive}
                                    onDelete={onDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
