
import React from 'react';
import { Zap, Target, Shield, AlertTriangle, ArrowRight, Check, CheckCircle, Send, FileText, DollarSign } from 'lucide-react';
import { usePreferences } from '@/context/preferences-context';
import { isOverdue } from '@/lib/transaction-utils';

export const NexusPanel = ({ topPriority, onSettle, onSelectTransaction }: any) => {
    const { formatCurrency: formatMoney } = usePreferences();
    if (!topPriority || topPriority.score < 100) {
        return (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#151515] to-[#0d0d0d] border border-white/5 h-60 flex flex-col justify-center items-center text-center">
                <Zap size={30} className="text-gray-600 mb-2 opacity-50" />
                <h4 className="text-md font-bold text-white mb-1">All Clear.</h4>
                <p className="text-sm text-gray-500">The Ledger reports no critical priorities.</p>
                <button className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#d4af37] hover:text-white transition-colors">
                    <Target size={14} /> Review Goal Tracking
                </button>
            </div>
        );
    }

    const { transaction, score } = topPriority;
    const isDebt = transaction.type === 'debt';
    const isOverdueItem = isOverdue(transaction.dueDate);
    let actionText = '', actionIcon = Check, actionColor = 'bg-[#d4af37] hover:bg-[#b5952f] text-black';
    let urgencyText = 'Critical Action Required';

    if (isDebt) {
        actionText = isOverdueItem ? `Pay ${formatMoney(transaction.amount)}` : `Review Payment`;
        actionIcon = isOverdueItem ? DollarSign : ArrowRight;
        actionColor = isOverdueItem ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-[#d4af37] hover:bg-[#b5952f] text-black';
        urgencyText = isOverdueItem ? 'OVERDUE PAYABLE' : 'URGENT DEBT DUE';
    } else {
        actionText = isOverdueItem ? `Send Reminder` : `Grant`;
        actionIcon = Send;
        actionColor = 'w-1/2 bg-emerald-700 hover:bg-emerald-600 text-white';
        urgencyText = isOverdueItem ? 'OVERDUE RECEIVABLE' : 'FOLLOW UP NEEDED';
    }

    return (
        <div className={`p-6 rounded-2xl border backdrop-blur-sm shadow-2xl relative h-60 flex flex-col justify-between overflow-hidden
      ${isOverdueItem ? 'bg-red-900/20 border-red-600/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]' :
                isDebt ? 'bg-[#d4af37]/10 border-[#d4af37]/50 shadow-[0_0_30px_rgba(212,175,55,0.3)]' :
                    'bg-emerald-900/10 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]'}`}>
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs uppercase font-bold tracking-widest text-[#d4af37] flex items-center gap-1">
                    <Shield size={12} className="text-[#d4af37]" /> NEXUS PRIORITY
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${isOverdueItem ? 'bg-red-800 text-white' : 'bg-black/20 text-gray-400'}`}>Score: {score}</span>
            </div>
            <div>
                <p className={`text-sm font-medium mb-1 ${isOverdueItem ? 'text-red-300' : 'text-gray-400'}`}>{urgencyText}</p>
                <h3 className="text-2xl font-bold font-serif text-white truncate" title={transaction.name}>{transaction.name.toUpperCase()}</h3>
                <h4 className={`text-4xl font-mono font-extrabold mt-1 ${isDebt ? 'text-red-400' : 'text-emerald-400'}`}>{isDebt ? '-' : '+'}{formatMoney(transaction.amount)}</h4>
            </div>
            <div className="flex gap-2 mb-4">
                <button onClick={(e) => { e.stopPropagation(); onSelectTransaction(transaction); }} className="flex-1 py-2.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all flex justify-center items-center gap-2 text-xs lg:text-sm">
                    <FileText size={16} /> Details
                </button>
                <button onClick={(e) => { e.stopPropagation(); isDebt ? onSelectTransaction(transaction) : onSettle(transaction); }} className={`flex-1 py-2.5 px-2 rounded-xl font-bold transition-all flex justify-center items-center gap-2 text-xs lg:text-sm ${actionColor}`}>
                    {React.createElement(actionIcon, { size: 16 })} {actionText}
                </button>
            </div>
        </div>
    );
};
