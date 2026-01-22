
import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, TrendingUp, TrendingDown, Shield, Zap, PieChart, Activity,
  Bell, AlertTriangle, LogOut, Download, Settings, Search
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { PreferencesProvider, usePreferences } from '@/context/preferences-context';
import { supabase } from '@/lib/supabase';
import { exportTransactionsToCSV } from '@/lib/export-utils';
import { getUrgencyScore, isDueSoon, isOverdue } from '@/lib/transaction-utils';

// Components
import { AuthScreen } from '@/components/auth/auth-screen';
import { ParticleBackground } from '@/components/ui/particle-background';
import { ExplosionFX } from '@/components/ui/explosion-fx';
import { NexusPanel } from '@/components/dashboard/nexus-panel';
import { TransactionCard } from '@/components/transactions/transaction-card';
import { AddModal } from '@/components/transactions/add-modal';
import { DetailModal } from '@/components/transactions/detail-modal';
import { ReminderModal } from '@/components/ui/reminder-modal';
import { SettingsDialog } from '@/components/settings/settings-dialog';
import { SearchBar } from '@/components/search/search-bar';
import { AddPaymentModal } from '@/components/payments/add-payment-modal';

function AppContent() {
  const { user, loading: authLoading, signOut } = useAuth();
  const {
    formatCurrency: formatMoney,
    enableVisceralSatisfaction
  } = usePreferences();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [hasEntered, setHasEntered] = useState(false);
  const [reminderItem, setReminderItem] = useState<any>(null);
  const [activeExplosion, setActiveExplosion] = useState<any>(null);
  const [paymentTransaction, setPaymentTransaction] = useState<any>(null);

  // Auto-enter if user is already logged in
  useEffect(() => {
    if (user && !authLoading) {
      setHasEntered(true);
    }
  }, [user, authLoading]);

  // Fetch and Subscribe to Transactions
  useEffect(() => {
    if (!user || !hasEntered) return;

    // Set up real-time subscription to transactions
    const channel = supabase
      .channel('transactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Reload transactions when any change occurs
          loadTransactions();
        }
      )
      .subscribe();

    // Initial load
    loadTransactions();

    async function loadTransactions() {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
      } else {
        // Transform snake_case DB data to camelCase for frontend
        const formattedData = (data || []).map(t => ({
          ...t,
          dueDate: t.due_date,
          returnsPercentage: t.returns_percentage,
          createdAt: t.created_at,
          // keep original snake_case too if needed, or cleanup
        }));
        setTransactions(formattedData);
      }
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, hasEntered]);

  const totalCredit = transactions.filter(t => t.type === 'credit' && !t.cleared).reduce((acc, curr) => acc + curr.amount, 0);
  const totalDebt = transactions.filter(t => t.type === 'debt' && !t.cleared).reduce((acc, curr) => acc + curr.amount, 0);
  const netWorth = totalCredit - totalDebt;
  const notifications = transactions.filter(t => (isDueSoon(t.dueDate) || isOverdue(t.dueDate)) && !t.cleared);

  // Search filtering
  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    const query = searchQuery.toLowerCase();
    return transactions.filter(t => {
      const matchesName = t.name?.toLowerCase().includes(query);
      const matchesContact = t.contact?.toLowerCase().includes(query);
      const matchesNote = t.note?.toLowerCase().includes(query);
      return matchesName || matchesContact || matchesNote;
    });
  }, [transactions, searchQuery]);

  const topPriority = useMemo(() => {
    let highestScore = 0; let priorityTransaction = null;
    transactions.filter(t => !t.cleared).forEach(t => {
      // Map back to camelCase for utility function if needed, or update utility
      // actually getUrgencyScore expects .dueDate. 
      // The transactions state currently comes straight from DB (snake_case).
      // We need to either transform data on load OR update utilities to handle snake_case.
      // Let's transform on load to keep frontend consistent camelCase.
      const camelT = {
        ...t,
        dueDate: t.due_date,
        returnsPercentage: t.returns_percentage,
        createdAt: t.created_at
      };

      const score = getUrgencyScore(camelT);
      if (score > highestScore) { highestScore = score; priorityTransaction = camelT; }
    });
    return priorityTransaction ? { transaction: priorityTransaction, score: highestScore } : null;
  }, [transactions]);

  const addTransaction = async (transaction: any) => {
    if (!user) return;

    // Map camelCase to snake_case for Supabase
    const dbTransaction = {
      user_id: user.id,
      type: transaction.type,
      name: transaction.name,
      amount: transaction.amount,
      note: transaction.note,
      contact: transaction.contact,
      due_date: transaction.dueDate, // camelCase -> snake_case
      returns_percentage: transaction.returnsPercentage, // camelCase -> snake_case
      cleared: transaction.cleared,
      created_at: new Date().toISOString() // Ensure ISO string for timestamptz
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([dbTransaction])
      .select() // Return the inserted data
      .single();

    if (error) {
      console.error("Error adding transaction:", error);
      alert(`Error adding transaction: ${error.message}`);
    } else if (data) {
      // Optimistically update UI
      const newTransaction = {
        ...data,
        dueDate: data.due_date,
        returnsPercentage: data.returns_percentage,
        createdAt: data.created_at
      };
      setTransactions(prev => [newTransaction, ...prev]);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    // Optimistic UI update
    setTransactions(prev => prev.filter(t => t.id !== id));

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting transaction:", error);
      // Revert if error (optional, but good practice would be to reload)
      loadTransactions();
    }
  };

  const settleTransaction = async (id: string) => {
    if (!user) return;

    // Optimistic UI update
    setTransactions(prev => prev.filter(t => t.id !== id));

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error settling transaction:", error);
      loadTransactions();
    }
  };

  const addPayment = async (transactionId: string, payment: { amount: number; date: number; note?: string }) => {
    if (!user) return;
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    const newPayments = [...(transaction.payments || []), { id: Date.now().toString(), ...payment }];

    // Optimistic update
    setTransactions(prev => prev.map(t =>
      t.id === transactionId ? { ...t, payments: newPayments } : t
    ));

    const { error } = await supabase
      .from('transactions')
      .update({ payments: newPayments })
      .eq('id', transactionId);

    if (error) {
      console.error("Error adding payment:", error);
      loadTransactions(); // Revert on error
    }
  };

  const handleSettleVisuals = (transaction: any) => {
    if (enableVisceralSatisfaction) {
      setActiveExplosion({
        active: true, x: window.innerWidth / 2, y: window.innerHeight / 2, type: transaction.type
      });
      setTimeout(() => { settleTransaction(transaction.id); }, 800);
    } else {
      settleTransaction(transaction.id);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setTransactions([]);
      setHasEntered(false);
    }
    catch (error) { console.error("Logout failed:", error); }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-[#d4af37] rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.3)] animate-pulse">
            <Shield className="text-black w-8 h-8" strokeWidth={2.5} />
          </div>
          <p className="text-[#d4af37] text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasEntered) return <AuthScreen onEnter={() => setHasEntered(true)} />;

  return (
    <div className="relative min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-[#d4af37] selection:text-black overflow-x-auto animate-in fade-in duration-500" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
      {enableVisceralSatisfaction && <ParticleBackground />}
      {activeExplosion && enableVisceralSatisfaction && (
        <ExplosionFX active={activeExplosion.active} x={activeExplosion.x} y={activeExplosion.y} type={activeExplosion.type} onComplete={() => setActiveExplosion(null)} />
      )}

      <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <AddPaymentModal
        isOpen={!!paymentTransaction}
        onClose={() => setPaymentTransaction(null)}
        onAdd={(payment) => {
          if (paymentTransaction) {
            addPayment(paymentTransaction.id, payment);
            setPaymentTransaction(null);
          }
        }}
        remainingAmount={paymentTransaction ? (paymentTransaction.amount - (paymentTransaction.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0)) : 0}
        transactionName={paymentTransaction?.name || ''}
        formatCurrency={formatMoney}
      />

      <div className="relative z-10 min-w-[600px] max-w-7xl mx-auto px-4 py-4 min-h-screen flex flex-col">
        <header className="flex flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#d4af37] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              <Shield className="text-black" size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#fbf5b7]">SOVEREIGN</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] leading-none">{user?.email || 'Authenticated'} ({user?.id.slice(0, 8)}...)</p>
            </div>
          </div>
          <div className="flex flex-row gap-4 items-center w-auto">
            <div className="w-32">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search transactions..."
              />
            </div>
            <div className="flex gap-4 items-center justify-start">
              {/* Export button - hidden on mobile */}
              <button
                onClick={() => exportTransactionsToCSV(transactions)}
                className="flex p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-emerald-500 hover:text-emerald-400 transition-all text-gray-400"
                title="Export to CSV"
              >
                <Download size={20} />
              </button>
              {/* Settings button */}
              <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[#d4af37] hover:text-[#d4af37] transition-all text-gray-400" title="Preferences">
                <Settings size={20} />
              </button>
              {/* Notifications */}
              <div className="relative">
                <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[#d4af37] hover:text-[#d4af37] transition-all relative">
                  <Bell size={20} />
                  {notifications.length > 0 && (<span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full text-[10px] flex items-center justify-center font-bold text-white shadow-lg animate-pulse">{notifications.length}</span>)}
                </button>
                {isNotifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-[#1a1a1a] border border-[#d4af37]/30 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-white/10 bg-[#222]"><h4 className="text-sm font-bold text-[#d4af37] flex items-center gap-2"><AlertTriangle size={14} /> Urgent Attention</h4></div>
                    <div className="max-h-60 overflow-y-auto">{notifications.length === 0 ? (<p className="p-4 text-xs text-gray-500 text-center">No urgent payments due.</p>) : (notifications.map(n => (<div key={n.id} onClick={() => { setSelectedTransaction(n); setIsNotifOpen(false); }} className="cursor-pointer p-3 border-b border-white/5 hover:bg-white/5 transition-colors flex justify-between items-center"><div><p className="text-sm font-medium text-white">{n.name}</p><p className="text-[10px] text-gray-400">Due: {new Date(n.dueDate).toLocaleDateString()}</p></div><span className={`text-xs font-mono font-bold ${n.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>{formatMoney(n.amount)}</span></div>)))}</div>
                  </div>
                )}
              </div>
              {/* Desktop new entry button */}
              <button onClick={() => setIsModalOpen(true)} className="group flex items-center gap-2 bg-white/5 hover:bg-[#d4af37] hover:text-black border border-white/10 hover:border-[#d4af37] px-5 py-2.5 rounded-full transition-all duration-300 backdrop-blur-md">
                <Plus size={18} /><span className="text-sm font-semibold">New Entry</span>
              </button>
              <button onClick={handleLogout} className="flex p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-red-500 hover:text-red-500 transition-all text-gray-400" title="Lock Terminal"><LogOut size={20} /></button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex gap-3">

          <div className="flex flex-col w-40 shrink-0 gap-2">
            <div className="animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: '50ms' } as React.CSSProperties}>
              <NexusPanel topPriority={topPriority} onSettle={handleSettleVisuals} onSelectTransaction={setSelectedTransaction} />
            </div>

            <nav className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: '150ms' } as React.CSSProperties}>
              {[{ id: 'dashboard', label: 'Overview', icon: PieChart }, { id: 'credits', label: 'Incoming', icon: TrendingUp }, { id: 'debts', label: 'Outgoing', icon: TrendingDown }, { id: 'history', label: 'Archive', icon: Activity }].map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 border ${activeTab === item.id ? 'bg-[#d4af37]/10 border-[#d4af37]/50 text-[#d4af37]' : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                  <item.icon size={20} /><span className="font-medium">{item.label}</span>{item.id === 'dashboard' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#d4af37] shadow-[0_0_8px_#d4af37]" />}
                </button>
              ))}
            </nav>

            <div className="mt-auto p-5 rounded-2xl bg-gradient-to-br from-[#151515] to-[#0d0d0d] border border-white/5 animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: '250ms' } as React.CSSProperties}>
              <h4 className="text-xs text-gray-500 uppercase tracking-widest mb-2">Liquidity Score</h4>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-serif text-[#d4af37]">{Math.min(100, Math.max(0, 50 + (netWorth / 100))).toFixed(1)}</span>
                <span className="text-sm text-emerald-500 mb-1 flex items-center"><TrendingUp size={12} className="mr-1" /> Live</span>
              </div>
              <div className="w-full h-1 bg-gray-800 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.5)] transition-all duration-1000" style={{ width: `${Math.min(100, Math.max(0, 50 + (netWorth / 100)))}%` }} />
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="grid grid-cols-3 gap-4 shrink-0">
              <div className="relative p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm overflow-hidden group hover:border-[#d4af37]/30 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' } as React.CSSProperties}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Shield size={60} /></div>
                <p className="text-sm text-gray-400 font-medium">Net Position</p>
                <h2 className={`text-3xl font-bold mt-1 font-mono ${netWorth >= 0 ? 'text-[#d4af37]' : 'text-red-400'}`}>{formatMoney(netWorth)}</h2>
                <p className="text-xs text-gray-500 mt-2">Total settled balance</p>
              </div>
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-emerald-900/10 to-transparent border border-emerald-500/10 backdrop-blur-sm group hover:border-emerald-500/30 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms' } as React.CSSProperties}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-500"><TrendingUp size={60} /></div>
                <p className="text-sm text-emerald-500/80 font-medium">Receivables</p>
                <h2 className="text-3xl font-bold mt-1 text-white font-mono">{formatMoney(totalCredit)}</h2>
                <div className="flex -space-x-2 mt-3">
                  {transactions.filter(t => t.type === 'credit').slice(0, 3).map((t, i) => (<div key={i} className="w-6 h-6 rounded-full bg-gray-800 border-2 border-[#121212] flex items-center justify-center text-[8px] text-gray-500 font-bold uppercase">{t.name.charAt(0)}</div>))}
                  <div className="w-6 h-6 rounded-full bg-emerald-900 border-2 border-[#121212] flex items-center justify-center text-[8px] text-emerald-400 pl-0.5">{transactions.filter(t => t.type === 'credit').length}</div>
                </div>
              </div>
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-red-900/10 to-transparent border border-red-500/10 backdrop-blur-sm group hover:border-red-500/30 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '300ms' } as React.CSSProperties}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-red-500"><TrendingDown size={60} /></div>
                <p className="text-sm text-red-400/80 font-medium">Payables</p>
                <h2 className="text-3xl font-bold mt-1 text-white font-mono">{formatMoney(totalDebt)}</h2>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">{notifications.length > 0 ? (<span className="text-red-400 font-bold flex items-center gap-1"><AlertTriangle size={10} /> {notifications.length} Due Soon</span>) : 'All Clear'}</p>
              </div>
            </div>

            <div className="flex-1 bg-[#121214]/50 border border-white/5 rounded-3xl backdrop-blur-md flex flex-col overflow-hidden shadow-2xl min-h-[400px] animate-in fade-in slide-in-from-bottom-6 duration-700" style={{ animationDelay: '400ms' } as React.CSSProperties}>
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h3 className="text-lg font-serif tracking-wide text-white">{activeTab === 'dashboard' ? 'Recent Activity' : activeTab === 'credits' ? 'Incoming Funds' : activeTab === 'debts' ? 'Outstanding Debts' : 'Archive'}</h3>
                <div className="flex gap-2 text-xs"><span className="px-2 py-1 rounded bg-white/5 text-gray-400 border border-white/5">Sort: Recent</span></div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {filteredTransactions.filter(t => { if (activeTab === 'dashboard') return true; if (activeTab === 'credits') return t.type === 'credit'; if (activeTab === 'debts') return t.type === 'debt'; return false; })
                  .map(t => (<TransactionCard key={t.id} item={t} onClick={setSelectedTransaction} onSettle={handleSettleVisuals} onDelete={deleteTransaction} onRemind={setReminderItem} />))}
                {filteredTransactions.length === 0 && searchQuery && (<div className="h-full flex flex-col items-center justify-center text-gray-600"><Search size={40} className="mb-4 opacity-20" /><p>No transactions match your search.</p><button onClick={() => setSearchQuery('')} className="mt-2 text-[#d4af37] hover:underline text-sm">Clear search</button></div>)}
                {transactions.length === 0 && !searchQuery && (<div className="h-full flex flex-col items-center justify-center text-gray-600"><Zap size={40} className="mb-4 opacity-20" /><p>No active records found in the ledger.</p></div>)}
              </div>
            </div>
          </div>
        </div>
      </div >

      <AddModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={addTransaction} />
      {selectedTransaction && <DetailModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} onSettle={handleSettleVisuals} onDelete={deleteTransaction} onAddPayment={setPaymentTransaction} />}
      <ReminderModal isOpen={!!reminderItem} onClose={() => setReminderItem(null)} transaction={reminderItem} />

      <style>{`
        * { 
          scroll-behavior: smooth;
        }
        
        .custom-scrollbar { 
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
          scrollbar-width: thin;
          scrollbar-color: rgba(212, 175, 55, 0.3) rgba(255, 255, 255, 0.05);
        }
        
        .custom-scrollbar::-webkit-scrollbar { 
          width: 8px; 
          height: 8px;
        } 
        
        .custom-scrollbar::-webkit-scrollbar-track { 
          background: rgba(255, 255, 255, 0.05); 
          border-radius: 10px;
          margin: 4px;
        } 
        
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: linear-gradient(180deg, rgba(212, 175, 55, 0.4), rgba(212, 175, 55, 0.6)); 
          border-radius: 10px; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 6px rgba(212, 175, 55, 0.3);
        } 
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: linear-gradient(180deg, rgba(212, 175, 55, 0.7), rgba(212, 175, 55, 0.9)); 
          box-shadow: 0 0 12px rgba(212, 175, 55, 0.6);
        }
        
        ::-webkit-scrollbar { 
          width: 14px; 
          height: 14px;
        }
        
        ::-webkit-scrollbar-track { 
          background: linear-gradient(90deg, rgba(10, 10, 12, 0.9), rgba(20, 20, 25, 0.9)); 
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          margin: 2px;
        }
        
        ::-webkit-scrollbar-thumb { 
          background: linear-gradient(180deg, rgba(212, 175, 55, 0.3), rgba(212, 175, 55, 0.5)); 
          border-radius: 10px;
          border: 2px solid rgba(10, 10, 12, 0.5);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: inset 0 0 6px rgba(212, 175, 55, 0.2), 0 0 8px rgba(212, 175, 55, 0.2);
        }
        
        ::-webkit-scrollbar-thumb:hover { 
          background: linear-gradient(180deg, rgba(212, 175, 55, 0.6), rgba(212, 175, 55, 0.8));
          box-shadow: inset 0 0 8px rgba(212, 175, 55, 0.4), 0 0 16px rgba(212, 175, 55, 0.5);
          border-color: rgba(212, 175, 55, 0.3);
        }
        
        ::-webkit-scrollbar-thumb:active {
          background: linear-gradient(180deg, rgba(212, 175, 55, 0.8), rgba(212, 175, 55, 1));
        }
        
        ::-webkit-scrollbar-corner {
          background: rgba(10, 10, 12, 0.9);
          border-radius: 10px;
        }
        
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(212, 175, 55, 0.5) rgba(10, 10, 12, 0.8);
        }
      `}</style>
    </div >
  );
}

export default function App() {
  return (
    <PreferencesProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </PreferencesProvider>
  );
}
