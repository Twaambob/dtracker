import React from 'react';
import { Calendar, Check, Plus } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  date: number;
  note?: string;
}

interface PaymentHistoryProps {
  payments: Payment[];
  totalAmount: number;
  onAddPayment: () => void;
  formatCurrency: (amount: number) => string;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  payments,
  totalAmount,
  onAddPayment,
  formatCurrency
}) => {
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = totalAmount - totalPaid;
  const progress = (totalPaid / totalAmount) * 100;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">Payment Progress</span>
          <span className="text-white font-mono font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-emerald-400 font-mono">Paid: {formatCurrency(totalPaid)}</span>
          <span className={`font-mono font-bold ${remaining > 0 ? 'text-[#d4af37]' : 'text-emerald-400'}`}>
            Remaining: {formatCurrency(remaining)}
          </span>
        </div>
      </div>

      {/* Payment History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Payment History</h4>
          <button
            onClick={onAddPayment}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 rounded-lg text-[#d4af37] text-xs font-semibold transition-all"
          >
            <Plus size={14} /> Add Payment
          </button>
        </div>

        {payments.length === 0 ? (
          <div className="p-4 border border-dashed border-white/10 rounded-xl text-center">
            <p className="text-sm text-gray-500">No payments recorded yet</p>
            <p className="text-xs text-gray-600 mt-1">Click "Add Payment" to log a payment</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {payments
              .sort((a, b) => b.date - a.date)
              .map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0">
                      <Check size={16} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-mono font-bold text-white">{formatCurrency(payment.amount)}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <Calendar size={10} />
                        <span>{new Date(payment.date).toLocaleDateString()}</span>
                        {payment.note && <span className="text-gray-600">• {payment.note}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {remaining === 0 && totalPaid > 0 && (
        <div className="p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
          <p className="text-sm text-emerald-400 font-semibold flex items-center gap-2">
            <Check size={16} /> Fully Paid!
          </p>
        </div>
      )}
    </div>
  );
};
