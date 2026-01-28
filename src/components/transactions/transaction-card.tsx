
import { TrendingUp, TrendingDown, Clock, Scroll, Check, X, ChevronRight } from 'lucide-react';
import { usePreferences } from '@/context/preferences-context';
import { isDueSoon, isOverdue } from '@/lib/transaction-utils';

export const TransactionCard = ({ item, onClick, onSettle, onDelete, onRemind }: any) => {
    const { formatCurrency: formatMoney } = usePreferences();
    const isCredit = item.type === 'credit';
    const urgent = isDueSoon(item.dueDate) && !item.cleared;
    const overdue = isOverdue(item.dueDate) && !item.cleared;
    const returnsPct = item.returnsPercentage ?? item.returns_percentage ?? null;
    const expectedReturns = returnsPct !== null && returnsPct !== undefined ? (item.amount * (returnsPct / 100)) : null;

    return (
        <div onClick={() => onClick(item)}
            className={`group relative flex items-center justify-between p-4 mb-3 rounded-xl border backdrop-blur-md transition-all duration-300 hover:translate-x-1 cursor-pointer ${item.cleared ? 'bg-white/5 border-white/10 opacity-60' : overdue ? 'bg-red-900/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : urgent ? 'bg-[#d4af37]/10 border-[#d4af37]/40 shadow-[0_0_10px_rgba(212,175,55,0.1)]' : isCredit ? 'bg-emerald-900/5 border-emerald-500/20 hover:bg-emerald-900/10 hover:border-emerald-500/40' : 'bg-red-900/5 border-red-500/20 hover:bg-red-900/10 hover:border-red-500/40'}`}>

            <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${item.cleared ? 'bg-gray-500' : overdue ? 'bg-red-600' : urgent ? 'bg-[#d4af37]' : isCredit ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <div className="flex items-center gap-4 pl-3 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.cleared ? 'bg-gray-500/10 text-gray-400' : isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {item.cleared ? <Check size={20} /> : isCredit ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium truncate">{item.name}</h3>
                        {item.cleared && <span className="text-[10px] bg-gray-600 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Settled</span>}
                        {urgent && <span className="text-[10px] bg-[#d4af37] text-black px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Due Soon</span>}
                        {overdue && <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Overdue</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        {item.dueDate ? (<span className={`flex items-center gap-1 ${!item.cleared && (urgent || overdue) ? 'text-orange-300' : ''}`}><Clock size={10} /> {new Date(item.dueDate).toLocaleDateString()}</span>) : (<span>{item.note || 'No details'}</span>)}
                        {returnsPct !== null && (
                            <span className="ml-2 text-xs text-gray-400">Returns: {returnsPct}%{expectedReturns !== null ? ` (${expectedReturns.toFixed(2)})` : ''}</span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4 pl-4">
                <span className={`font-mono font-bold text-lg whitespace-nowrap ${item.cleared ? 'text-gray-400 line-through opacity-50' : isCredit ? 'text-emerald-400' : 'text-red-400'}`}>{isCredit ? '+' : '-'}{formatMoney(item.amount)}</span>
                <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {!item.cleared && isCredit && (
                        <button onClick={(e) => { e.stopPropagation(); onRemind(item); }} title="Send Royal Decree"
                            className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-white hover:text-blue-400 transition-colors">
                            <Scroll size={16} />
                        </button>
                    )}
                    {!item.cleared && (
                        <button onClick={(e) => { e.stopPropagation(); onSettle(item); }} title="Settle Up"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white hover:text-[#d4af37] transition-colors">
                            <Check size={16} />
                        </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} title="Delete"
                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors">
                        <X size={16} />
                    </button>
                </div>
                <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
            </div>
        </div>
    );
};
