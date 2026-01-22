
import React, { useState } from 'react';
import { MessageSquare, Shield, Crown, Skull, Check, Copy, X, Scroll } from 'lucide-react';
import { usePreferences } from '@/context/preferences-context';

export const ReminderModal = ({ isOpen, onClose, transaction }: any) => {
    const { formatCurrency: formatMoney } = usePreferences();
    const [level, setLevel] = useState<'jester' | 'knight' | 'king' | 'executioner'>('jester');
    const [copied, setCopied] = useState(false);

    if (!isOpen || !transaction) return null;

    const messages = {
        jester: {
            title: "Court Jester", icon: MessageSquare, color: "text-emerald-400", bg: "bg-emerald-900/20", border: "border-emerald-500/30",
            text: `Hey ${transaction.name.split(' ')[0]}! 👋 Just doing my monthly financial cleanup. Looks like there's still ${formatMoney(transaction.amount)} pending from ${transaction.note || 'our last exchange'}. No rush, just keeping the books tidy! 🃏`
        },
        knight: {
            title: "The Knight", icon: Shield, color: "text-blue-400", bg: "bg-blue-900/20", border: "border-blue-500/30",
            text: `Greetings ${transaction.name.split(' ')[0]}. I am reviewing the ledger and noted an outstanding balance of ${formatMoney(transaction.amount)}. Kindly remit payment at your earliest convenience to settle this account. 🛡️`
        },
        king: {
            title: "Sovereign Decree", icon: Crown, color: "text-[#d4af37]", bg: "bg-[#d4af37]/10", border: "border-[#d4af37]/50",
            text: `BY ROYAL DECREE: The Sovereign Ledger demands restitution. An amount of ${formatMoney(transaction.amount)} is outstanding. Immediate action is requested to maintain your standing in the Treasury. 👑`
        },
        executioner: {
            title: "The Executioner", icon: Skull, color: "text-red-500", bg: "bg-red-900/20", border: "border-red-500/50",
            text: `Silence is acceptance of debt. ${formatMoney(transaction.amount)}. Send it now. Do not make me ask again. ☠️`
        }
    };

    const currentMsg = messages[level];

    const handleCopy = () => {
        const textArea = document.createElement("textarea");
        textArea.value = currentMsg.text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => { setCopied(false); onClose(); }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-md bg-[#1a1a1a] border border-[#d4af37]/30 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-white/5 bg-gradient-to-r from-[#1a1a1a] to-[#252525] flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#d4af37] font-serif flex items-center gap-2">
                        <Scroll size={20} /> Royal Decree
                    </h2>
                    <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-white" /></button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-4 gap-2">
                        {(Object.entries(messages) as [string, any][]).map(([key, config]) => (
                            <button key={key} onClick={() => setLevel(key as any)}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${level === key ? `${config.bg} ${config.border} ${config.color} shadow-lg scale-105` : 'border-transparent hover:bg-white/5 text-gray-500'}`}
                                title={config.title}>
                                <config.icon size={20} />
                                <span className="text-[10px] uppercase font-bold mt-1">{key}</span>
                            </button>
                        ))}
                    </div>
                    <div className={`p-4 rounded-xl border ${currentMsg.border} ${currentMsg.bg} relative group transition-all duration-300`}>
                        <div className="absolute -top-3 left-4 px-2 bg-[#1a1a1a] text-xs font-bold text-gray-400 uppercase tracking-widest">Message Preview</div>
                        <p className={`font-mono text-sm leading-relaxed ${currentMsg.color}`}>"{currentMsg.text}"</p>
                    </div>
                    <button onClick={handleCopy} className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 ${copied ? 'bg-emerald-600 text-white' : 'bg-[#d4af37] hover:bg-[#b5952f] text-black'}`}>
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        {copied ? 'Copied to Clipboard!' : 'Copy & Close'}
                    </button>
                    <p className="text-[10px] text-center text-gray-500">Copying will close this window so you can paste into your messaging app.</p>
                </div>
            </div>
        </div>
    );
};
