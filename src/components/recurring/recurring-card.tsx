import React from 'react';
import { Clock, Repeat, Home, Zap, Shield, CreditCard, Wallet, DollarSign, X, Power } from 'lucide-react';
import type { RecurringTransaction } from '@/types';
import { usePreferences } from '@/context/preferences-context';
import { getFrequencyLabel } from '@/lib/recurring-utils';

interface RecurringCardProps {
    item: RecurringTransaction;
    onClick: (item: RecurringTransaction) => void;
    onToggleActive: (id: string, active: boolean) => void;
    onDelete: (id: string) => void;
}

export const RecurringCard: React.FC<RecurringCardProps> = ({ item, onClick, onToggleActive, onDelete }) => {
    const { formatCurrency: formatMoney } = usePreferences();
    const isCredit = item.type === 'credit';

    const getCategoryIcon = () => {
        const iconProps = { size: 20 };
        switch (item.category) {
            case 'salary': return <Wallet {...iconProps} />;
            case 'rent': return <Home {...iconProps} />;
            case 'utilities': return <Zap {...iconProps} />;
            case 'subscription': return <Repeat {...iconProps} />;
            case 'insurance': return <Shield {...iconProps} />;
            case 'loan': return <CreditCard {...iconProps} />;
            default: return <DollarSign {...iconProps} />;
        }
    };

    const daysUntilDue = Math.ceil((new Date(item.next_due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div
            onClick={() => onClick(item)}
            className={`group relative flex items-center justify-between p-4 mb-3 rounded-xl border backdrop-blur-md transition-all duration-300 hover:translate-x-1 cursor-pointer ${!item.active
                ? 'bg-gray-900/20 border-gray-500/20 opacity-60'
                : isCredit
                    ? 'bg-emerald-900/5 border-emerald-500/30 hover:bg-emerald-900/10 hover:border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.05)]'
                    : 'bg-red-900/5 border-red-500/30 hover:bg-red-900/10 hover:border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.05)]'
                }`}
            style={{
                borderLeft: `4px solid ${!item.active ? '#6b7280' : isCredit ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'
                    }`,
                borderStyle: 'dashed'
            }}
        >
            <div className="flex items-center gap-4 pl-1 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!item.active
                    ? 'bg-gray-500/10 text-gray-400'
                    : isCredit
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                    {getCategoryIcon()}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-medium truncate">{item.name}</h3>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${!item.active
                            ? 'bg-gray-600 text-gray-300'
                            : 'bg-purple-900/40 text-purple-300 border border-purple-500/30'
                            }`}>
                            <Repeat size={8} className="inline mr-1" />
                            {getFrequencyLabel(item.frequency)}
                        </span>
                        {!item.active && (
                            <span className="text-[9px] bg-gray-700 text-gray-400 px-2 py-0.5 rounded font-bold uppercase">
                                Inactive
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {daysUntilDue === 0 ? 'Due today' : daysUntilDue === 1 ? 'Due tomorrow' : `Due in ${daysUntilDue} days`}
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="capitalize">{item.category}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 pl-4">
                <span className={`font-mono font-bold text-lg whitespace-nowrap ${!item.active
                    ? 'text-gray-500'
                    : isCredit
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}>
                    {isCredit ? '+' : '-'}{formatMoney(item.amount)}
                </span>
                <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleActive(item.id, !item.active);
                        }}
                        title={item.active ? 'Deactivate' : 'Activate'}
                        className={`p-2 rounded-lg transition-colors ${item.active
                            ? 'bg-white/5 hover:bg-orange-500/20 text-white hover:text-orange-400'
                            : 'bg-white/5 hover:bg-emerald-500/20 text-gray-500 hover:text-emerald-400'
                            }`}
                    >
                        <Power size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete recurring transaction "${item.name}"?`)) {
                                onDelete(item.id);
                            }
                        }}
                        title="Delete"
                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
