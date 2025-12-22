import React, { useState } from 'react';
import { X, DollarSign, FileText, AlertTriangle } from 'lucide-react';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (payment: { amount: number; date: number; note?: string }) => void;
  remainingAmount: number;
  transactionName: string;
  formatCurrency: (amount: number) => string;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  remainingAmount,
  transactionName,
  formatCurrency
}) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const paymentAmount = parseFloat(amount);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (paymentAmount > remainingAmount) {
      setError(`Payment cannot exceed remaining balance of ${formatCurrency(remainingAmount)}`);
      return;
    }

    onAdd({
      amount: paymentAmount,
      date: Date.now(),
      note: note.trim() || undefined
    });

    // Reset form
    setAmount('');
    setNote('');
    setError('');
    onClose();
  };

  const handleQuickAmount = (percentage: number) => {
    const quickAmount = (remainingAmount * percentage / 100).toFixed(2);
    setAmount(quickAmount);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#1a1a1a] border border-[#d4af37]/30 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-[#d4af37]/10 bg-gradient-to-r from-[#1a1a1a] to-[#252525]">
          <div>
            <h2 className="text-xl font-bold text-[#d4af37] font-serif">Record Payment</h2>
            <p className="text-xs text-gray-500 mt-1">For: {transactionName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
              <AlertTriangle size={16} /> <span>{error}</span>
            </div>
          )}

          {/* Remaining Balance */}
          <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-xl">
            <p className="text-xs text-emerald-400/80 uppercase tracking-wider mb-1">Remaining Balance</p>
            <p className="text-2xl font-mono font-bold text-emerald-400">{formatCurrency(remainingAmount)}</p>
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Quick Select</label>
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((percent) => (
                <button
                  key={percent}
                  type="button"
                  onClick={() => handleQuickAmount(percent)}
                  className="py-2 px-3 bg-white/5 hover:bg-[#d4af37]/20 border border-white/10 hover:border-[#d4af37]/50 rounded-lg text-sm font-semibold text-gray-300 hover:text-[#d4af37] transition-all"
                >
                  {percent}%
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-xs text-[#d4af37]/70 uppercase tracking-widest">Payment Amount</label>
            <div className="relative group">
              <DollarSign className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={18} />
              <input
                type="number"
                required
                placeholder="0.00"
                step="0.01"
                min="0.01"
                max={remainingAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-700 font-mono text-lg"
              />
            </div>
          </div>

          {/* Note Input */}
          <div className="space-y-2">
            <label className="text-xs text-[#d4af37]/70 uppercase tracking-widest">Note (Optional)</label>
            <div className="relative group">
              <FileText className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={18} />
              <input
                type="text"
                placeholder="e.g. Partial payment, Installment 1"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-700 text-sm"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-4 py-3 bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
          >
            Record Payment
          </button>
        </form>
      </div>
    </div>
  );
};
