
import { X, Hash, Calendar, FileText, Mail, Clock, Check } from 'lucide-react';
import { usePreferences } from '@/context/preferences-context';
import { isDueSoon, isOverdue } from '@/lib/transaction-utils';
import { PaymentHistory } from '@/components/payments/payment-history';

export const DetailModal = ({ transaction, onClose, onSettle, onDelete, onAddPayment }: any) => {
    const { formatCurrency: formatMoney } = usePreferences();
    if (!transaction) return null;
    const isCredit = transaction.type === 'credit';
    const urgent = isDueSoon(transaction.dueDate) && !transaction.cleared;
    const overdue = isOverdue(transaction.dueDate) && !transaction.cleared;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-[#141414] border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-8">
                <div className={`relative p-8 flex flex-col items-center justify-center border-b border-white/5 ${isCredit ? 'bg-gradient-to-b from-emerald-900/20 to-transparent' : 'bg-gradient-to-b from-red-900/20 to-transparent'}`}>
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-black/20 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><X size={20} /></button>
                    <div className={`mb-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${isCredit ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        {isCredit ? 'Incoming Credit' : 'Outstanding Debt'}
                    </div>
                    <h2 className={`text-5xl font-mono font-bold tracking-tight mb-2 ${isCredit ? 'text-emerald-400' : 'text-red-400'}`}>
                        {transaction.payments?.length > 0 ? formatMoney(transaction.amount - (transaction.payments.reduce((sum: number, p: any) => sum + p.amount, 0))) : formatMoney(transaction.amount)}
                    </h2>
                    {transaction.payments?.length > 0 && (
                        <p className="text-xs text-gray-500 font-mono">of {formatMoney(transaction.amount)} total</p>
                    )}
                    <h3 className="text-xl text-white font-serif">{transaction.name}</h3>
                </div>
                <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5"><label className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest"><Hash size={12} /> Transaction ID</label><p className="text-sm font-mono text-gray-300 truncate">{transaction.id.slice(0, 8)}...</p></div>
                        <div className="space-y-1.5"><label className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest"><Calendar size={12} /> Date Added</label><p className="text-sm text-white">{new Date(transaction.createdAt || Date.now()).toLocaleDateString()}</p></div>
                    </div>

                    {transaction.note && (<div className="space-y-1.5"><label className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest"><FileText size={12} /> Notes</label><p className="text-sm text-gray-300">{transaction.note}</p></div>)}
                    {transaction.contact && (<div className="space-y-1.5"><label className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest"><Mail size={12} /> Contact</label><p className="text-sm text-white">{transaction.contact}</p></div>)}

                    {/* Payment History Section */}
                    {!transaction.cleared && (
                        <div className="pt-4 border-t border-white/10">
                            <PaymentHistory
                                payments={transaction.payments || []}
                                totalAmount={transaction.amount}
                                onAddPayment={() => onAddPayment(transaction)}
                                formatCurrency={formatMoney}
                            />
                        </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-white/10"><label className={`flex items-center gap-2 text-[10px] uppercase tracking-widest ${urgent || overdue ? 'text-[#d4af37]' : 'text-gray-500'}`}><Clock size={12} /> Due Date</label><p className={`text-sm font-medium ${overdue ? 'text-red-500' : urgent ? 'text-[#d4af37]' : 'text-white'}`}>{transaction.dueDate ? new Date(transaction.dueDate).toLocaleDateString() : 'No Deadline'} {overdue && ' (Overdue)'}</p></div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <button onClick={() => { onSettle(transaction); onClose(); }} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-[#d4af37] hover:text-black text-white font-semibold transition-all duration-300"><Check size={18} /> Settle</button>
                        <button onClick={() => { onDelete(transaction.id); onClose(); }} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-gray-400 font-semibold transition-all duration-300"><X size={18} /> Delete</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
