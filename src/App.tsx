import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Plus, TrendingUp, TrendingDown, DollarSign, Shield, Zap, PieChart, Activity,
  User, X, Check, Calendar, Mail, Bell, AlertTriangle, Clock, Lock, Fingerprint,
  ChevronRight, Hash, FileText, LogOut, ArrowRight, UserPlus, MailCheck, Loader2,
  Send, Target, Scroll, Crown, Skull, MessageSquare, Copy, Settings, Search, Download
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut,
  signInWithCustomToken, sendPasswordResetEmail
} from 'firebase/auth';
import {
  getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query
} from 'firebase/firestore';
import { firebaseConfig, appId } from './firebase.config';
import { PreferencesProvider, usePreferences } from '@/context/preferences-context';
import { SettingsDialog } from '@/components/settings/settings-dialog';
import { SearchBar } from '@/components/search/search-bar';
import { PaymentHistory } from '@/components/payments/payment-history';
import { AddPaymentModal } from '@/components/payments/add-payment-modal';
import {
  isValidEmail,
  isValidPassword,
  checkRateLimit,
  validateTransaction
} from '@/lib/security';
import { exportTransactionsToCSV } from '@/lib/export-utils';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);



const isDueSoon = (dateString?: string) => {
  if (!dateString) return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(dateString);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7 && diffDays >= 0;
};

const isOverdue = (dateString?: string) => {
  if (!dateString) return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(dateString);
  return due < today;
};

const getUrgencyScore = (transaction: any) => {
  let score = 0;
  const dateString = transaction.dueDate;
  const amount = transaction.amount || 0;
  score += transaction.type === 'debt' ? 100 : 50;
  if (!dateString) { score -= 50; }
  else {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(dateString);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) { score += 500; }
    else if (diffDays <= 1) { score += 300; }
    else if (diffDays <= 7) { score += 150; }
    else if (diffDays <= 30) { score += 20; }
  }
  score += amount / 10;
  if (!transaction.cleared) { score += 10; }
  return Math.round(score);
};

// --- Feature 4: Visceral Satisfaction Engine (Explosion FX) ---
const ExplosionFX = ({ active, x, y, type, onComplete }: any) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles: any[] = [];
    const particleCount = 60;
    const colors = type === 'debt'
      ? ['#ef4444', '#7f1d1d', '#111111', '#555555']
      : ['#d4af37', '#10b981', '#ffffff', '#fbf5b7'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * (type === 'debt' ? 15 : 10),
        vy: (Math.random() - 0.5) * (type === 'debt' ? 15 : 10) - (type === 'credit' ? 5 : 0),
        size: Math.random() * (type === 'debt' ? 6 : 8),
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0, decay: Math.random() * 0.02 + 0.01
      });
    }

    let animationFrameId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let activeParticles = 0;
      particles.forEach(p => {
        if (p.life > 0) {
          activeParticles++;
          p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life -= p.decay;
          ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
          if (type === 'debt') {
            ctx.beginPath(); ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.size, p.y + p.size * 0.5);
            ctx.lineTo(p.x + p.size * 0.5, p.y + p.size);
            ctx.fill();
          } else {
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
          }
        }
      });
      if (activeParticles > 0) { animationFrameId = requestAnimationFrame(render); }
      else { onComplete(); }
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [active, x, y, type, onComplete]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 z-[100] pointer-events-none" />;
};

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;
    let particles: any[] = [];
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    class Particle {
      x: number; y: number; size: number; speedX: number; speedY: number; opacity: number; color: string;
      constructor() {
        this.x = Math.random() * canvas!.width; this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 2;
        this.speedX = (Math.random() - 0.5) * 0.5; this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5; this.color = Math.random() > 0.5 ? '212, 175, 55' : '16, 185, 129';
      }
      update() {
        this.x += this.speedX; this.y += this.speedY;
        if (this.x > canvas!.width) this.x = 0; if (this.x < 0) this.x = canvas!.width;
        if (this.y > canvas!.height) this.y = 0; if (this.y < 0) this.y = canvas!.height;
      }
      draw() {
        ctx!.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx!.beginPath(); ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx!.fill();
      }
    }
    const init = () => { particles = []; for (let i = 0; i < 70; i++) { particles.push(new Particle()); } };
    const animate = () => {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      const gradient = ctx!.createLinearGradient(0, 0, canvas!.width, canvas!.height);
      gradient.addColorStop(0, 'rgba(10, 10, 12, 0)'); gradient.addColorStop(1, 'rgba(20, 20, 25, 0.2)');
      ctx!.fillStyle = gradient; ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
      particles.forEach(p => { p.update(); p.draw(); });
      animationFrameId = requestAnimationFrame(animate);
    };
    window.addEventListener('resize', resizeCanvas); resizeCanvas(); init(); animate();
    return () => { window.removeEventListener('resize', resizeCanvas); cancelAnimationFrame(animationFrameId); };
  }, []);
  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" />;
};

// --- Feature 2: Royal Decree Reminder Modal ---
const ReminderModal = ({ isOpen, onClose, transaction }: any) => {
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

const AuthScreen = ({ onEnter }: { onEnter: () => void }) => {
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleAuthError = (error: any) => {
    setIsLoading(false);
    let msg = 'Authentication failed. Please try again.';
    if (error.code?.includes('auth/')) {
      msg = error.message.replace(/Firebase: /g, '').replace(/\(auth-.*\)/g, '').trim();
    } else { msg = error.message; }
    setErrorMessage(msg);
    console.error(error);
  };

  const handleEmailPassword = async (e: React.FormEvent, isSignUp: boolean) => {
    e.preventDefault();
    setErrorMessage('');

    // Rate limiting check
    if (!checkRateLimit('login', 5, 60000)) {
      setErrorMessage('Too many login attempts. Please wait a minute before trying again.');
      return;
    }

    // Validate email
    if (!isValidEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    // Validate password for signup
    if (isSignUp) {
      const passwordValidation = isValidPassword(password);
      if (!passwordValidation.valid) {
        setErrorMessage(passwordValidation.message);
        return;
      }
    } else {
      // Basic validation for login
      if (!password || password.length < 6) {
        setErrorMessage('Password is required.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isSignUp) { await createUserWithEmailAndPassword(auth, email, password); }
      else { await signInWithEmailAndPassword(auth, email, password); }
      onEnter();
    } catch (error) { handleAuthError(error); }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(''); setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onEnter();
    } catch (error) { handleAuthError(error); }
  };

  const handleAnonSignIn = async () => {
    setErrorMessage(''); setIsLoading(true);
    try {
      await signInAnonymously(auth);
      onEnter();
    } catch (error) { handleAuthError(error); }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(''); setIsLoading(true);
    if (!email) {
      setErrorMessage("Please enter your email address.");
      setIsLoading(false); return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setIsLoading(false);
    } catch (error) { handleAuthError(error); }
  };

  return (
    <div className="relative min-h-screen z-50 flex items-center justify-center p-4 bg-[#050505] text-white overflow-auto">
      <ParticleBackground />
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8 space-y-2">
          <div className="w-16 h-16 bg-[#d4af37] mx-auto rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.3)] mb-4">
            <Shield className="text-black w-8 h-8" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#fbf5b7] tracking-wide">
            SOVEREIGN
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em]">Personal Ledger</p>
        </div>

        <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#d4af37]/5 to-transparent pointer-events-none" />

          {view === 'reset' ? (
            <form onSubmit={handlePasswordReset} className="relative space-y-4">
              <h3 className="text-[#d4af37] font-serif text-lg font-bold text-center mb-2">Reset Password</h3>
              {errorMessage && <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm flex items-center gap-2"><AlertTriangle size={16} /><span>{errorMessage}</span></div>}
              {resetSent ? (
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400"><MailCheck size={24} /></div>
                  <p className="text-sm text-gray-300">Check your inbox! We've sent a password reset link to <span className="text-white font-bold">{email}</span>.</p>
                  <button onClick={() => { setView('login'); setResetSent(false); }} className="text-[#d4af37] text-sm font-bold hover:underline">Back to Login</button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-center text-gray-500 mb-4">Enter your email and the Sovereign will dispatch a courier to restore your access.</p>
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#d4af37] uppercase tracking-widest font-bold">Email</label>
                    <div className="relative">
                      <MailCheck className="absolute left-3 top-3 text-gray-500" size={18} />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@sovereign.net" className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#d4af37] transition-all" required />
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full h-12 bg-[#d4af37] hover:bg-[#b5952f] disabled:opacity-50 text-black font-bold rounded-xl transition-all flex justify-center items-center gap-2">
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={18} />} <span>Send Reset Link</span>
                  </button>
                  <button type="button" onClick={() => setView('login')} className="w-full text-xs text-gray-500 hover:text-white transition-colors">Cancel</button>
                </>
              )}
            </form>
          ) : (
            <>
              <form onSubmit={(e) => handleEmailPassword(e, view === 'signup')} className="relative space-y-4">
                {errorMessage && (
                  <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
                    <AlertTriangle size={16} /> <span>{errorMessage}</span>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] text-[#d4af37] uppercase tracking-widest font-bold">Email</label>
                  <div className="relative">
                    <MailCheck className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@sovereign.net"
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#d4af37] transition-all" required />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-[#d4af37] uppercase tracking-widest font-bold">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********"
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#d4af37] transition-all" required />
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full h-12 bg-[#d4af37] hover:bg-[#b5952f] disabled:bg-[#d4af37]/50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] flex justify-center items-center gap-2">
                  {isLoading ? <><Loader2 className="animate-spin" size={20} /><span>Processing...</span></> : <>{view === 'login' ? <Lock size={18} /> : <UserPlus size={18} />}<span>{view === 'login' ? 'Authorize Access' : 'Create Account'}</span></>}
                </button>
              </form>

              {view === 'login' && (
                <div className="text-center mt-2">
                  <button type="button" onClick={() => { setView('reset'); setErrorMessage(''); }} className="text-[10px] text-gray-500 hover:text-[#d4af37] transition-colors">Forgot your password?</button>
                </div>
              )}

              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-white/10" />
                <span className="px-3 text-xs text-gray-600 uppercase">OR</span>
                <div className="flex-grow border-t border-white/10" />
              </div>
              <div className="space-y-3">
                <button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full h-12 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all flex justify-center items-center gap-3 border border-white/10 disabled:opacity-50">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo-google.png" alt="Google" className="w-5 h-5" /> Continue with Google
                </button>
                <button onClick={handleAnonSignIn} disabled={isLoading} className="w-full h-12 bg-white/5 hover:bg-white/10 text-gray-400 font-semibold rounded-xl transition-all flex justify-center items-center gap-3 border border-white/10 disabled:opacity-50">
                  <Fingerprint size={18} /> Access Anonymously
                </button>
              </div>
              <div className="mt-8 pt-4 border-t border-white/5 text-center">
                <button onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setErrorMessage(''); setEmail(''); setPassword(''); }} className="text-xs text-gray-500 hover:text-[#d4af37] transition-colors flex items-center justify-center mx-auto">
                  {view === 'login' ? 'Need an account? Sign Up' : 'Already registered? Log In'} <ArrowRight size={12} className="ml-1" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const NexusPanel = ({ topPriority, onSettle, onSelectTransaction }: any) => {
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

const DetailModal = ({ transaction, onClose, onSettle, onDelete, onAddPayment }: any) => {
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


const AddModal = ({ isOpen, onClose, onAdd }: any) => {
  const [type, setType] = useState('debt');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [contact, setContact] = useState('');
  const [returnsPercentage, setReturnsPercentage] = useState('');
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validate transaction data
    const validation = validateTransaction({
      type,
      name,
      amount: parseFloat(amount),
      note,
      contact,
      dueDate,
      returnsPercentage: returnsPercentage ? parseFloat(returnsPercentage) : undefined
    });

    if (!validation.valid) {
      setValidationError(validation.errors.join(' '));
      return;
    }

    // Use sanitized data
    onAdd({
      ...validation.sanitized,
      createdAt: Date.now(),
      cleared: false
    });

    setName(''); setAmount(''); setNote(''); setDueDate(''); setContact(''); setReturnsPercentage(''); setValidationError(''); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#1a1a1a] border border-[#d4af37]/30 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-[#d4af37]/10 bg-gradient-to-r from-[#1a1a1a] to-[#252525]">
          <h2 className="text-xl font-bold text-[#d4af37] font-serif tracking-wide">New Entry</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
              <AlertTriangle size={16} /> <span>{validationError}</span>
            </div>
          )}
          <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
            <button type="button" onClick={() => setType('credit')} className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${type === 'credit' ? 'bg-emerald-900/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}>They Owe Me</button>
            <button type="button" onClick={() => setType('debt')} className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${type === 'debt' ? 'bg-red-900/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}>I Owe Them</button>
          </div>
          {/* Inputs abbreviated for brevity, same as previous */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2"><label className="text-[10px] text-[#d4af37]/70 uppercase tracking-widest">Entity Name</label><div className="relative group"><User className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={18} /><input type="text" required placeholder="e.g. John Doe" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-700" /></div></div>
            <div className="space-y-2 col-span-2"><label className="text-[10px] text-[#d4af37]/70 uppercase tracking-widest">Amount</label><div className="relative group"><DollarSign className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={18} /><input type="number" required placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-700 font-mono" /></div></div>
            <div className="space-y-2"><label className="text-[10px] text-[#d4af37]/70 uppercase tracking-widest">Due Date</label><div className="relative group"><Calendar className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={18} /><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-2 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-700 text-sm [color-scheme:dark]" /></div></div>
            <div className="space-y-2"><label className="text-[10px] text-[#d4af37]/70 uppercase tracking-widest">Contact</label><div className="relative group"><Mail className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={18} /><input type="text" placeholder="Contact Info" value={contact} onChange={(e) => setContact(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-700 text-sm" /></div></div>
          </div>
          <div className="space-y-2"><label className="text-[10px] text-[#d4af37]/70 uppercase tracking-widest">Returns % (Optional)</label><div className="relative group"><Zap className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" size={18} /><input type="number" placeholder="e.g. 10" value={returnsPercentage} onChange={(e) => setReturnsPercentage(e.target.value)} min="0" max="100" step="0.1" className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-700 text-sm font-mono" /></div></div>
          <div className="space-y-2"><label className="text-[10px] text-[#d4af37]/70 uppercase tracking-widest">Notes</label><input type="text" placeholder="e.g. Dinner split, Rent" value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-700 text-sm" /></div>
          <button type="submit" className="w-full mt-4 py-3 bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] flex justify-center items-center gap-2"><Check size={18} /> Confirm Entry</button>
        </form>
      </div>
    </div>
  );
};

// --- Updated Transaction Card with Reminder Icon ---
const TransactionCard = ({ item, onClick, onSettle, onDelete, onRemind }: any) => {
  const { formatCurrency: formatMoney } = usePreferences();
  const isCredit = item.type === 'credit';
  const urgent = isDueSoon(item.dueDate) && !item.cleared;
  const overdue = isOverdue(item.dueDate) && !item.cleared;

  return (
    <div onClick={() => onClick(item)}
      className={`group relative flex items-center justify-between p-4 mb-3 rounded-xl border backdrop-blur-md transition-all duration-300 hover:translate-x-1 cursor-pointer ${overdue ? 'bg-red-900/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : urgent ? 'bg-[#d4af37]/10 border-[#d4af37]/40 shadow-[0_0_10px_rgba(212,175,55,0.1)]' : isCredit ? 'bg-emerald-900/5 border-emerald-500/20 hover:bg-emerald-900/10 hover:border-emerald-500/40' : 'bg-red-900/5 border-red-500/20 hover:bg-red-900/10 hover:border-red-500/40'}`}>

      <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${overdue ? 'bg-red-600' : urgent ? 'bg-[#d4af37]' : isCredit ? 'bg-emerald-500' : 'bg-red-500'}`} />
      <div className="flex items-center gap-4 pl-3 flex-1">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {isCredit ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-medium truncate">{item.name}</h3>
            {urgent && <span className="text-[10px] bg-[#d4af37] text-black px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Due Soon</span>}
            {overdue && <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Overdue</span>}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            {item.dueDate ? (<span className={`flex items-center gap-1 ${urgent || overdue ? 'text-orange-300' : ''}`}><Clock size={10} /> {new Date(item.dueDate).toLocaleDateString()}</span>) : (<span>{item.note || 'No details'}</span>)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 pl-4">
        <span className={`font-mono font-bold text-lg whitespace-nowrap ${isCredit ? 'text-emerald-400' : 'text-red-400'}`}>{isCredit ? '+' : '-'}{formatMoney(item.amount)}</span>
        <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {isCredit && (
            <button onClick={(e) => { e.stopPropagation(); onRemind(item); }} title="Send Royal Decree"
              className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-white hover:text-blue-400 transition-colors">
              <Scroll size={16} />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onSettle(item); }} title="Settle Up"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white hover:text-[#d4af37] transition-colors">
            <Check size={16} />
          </button>
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

function AppContent() {
  const {
    formatCurrency: formatMoney,
    enableVisceralSatisfaction
  } = usePreferences();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
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

  useEffect(() => {
    const initAuth = async () => {
      try {
        if ((window as any).__initial_auth_token) {
          await signInWithCustomToken(auth, (window as any).__initial_auth_token);
        }
      } catch (e) { console.error("Initial Auth failed", e); }
    };
    initAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) { setHasEntered(true); } else { setHasEntered(false); }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user || !hasEntered) return;
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      setTransactions(data);
    }, (error) => console.error("Error fetching transactions:", error));
    return () => unsubscribe();
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
      const score = getUrgencyScore(t);
      if (score > highestScore) { highestScore = score; priorityTransaction = t; }
    });
    return priorityTransaction ? { transaction: priorityTransaction, score: highestScore } : null;
  }, [transactions]);

  const addTransaction = async (transaction: any) => {
    if (!user) return;
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'), transaction);
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', id));
  };

  const settleTransaction = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', id));
  };

  const addPayment = async (transactionId: string, payment: { amount: number; date: number; note?: string }) => {
    if (!user) return;
    const transactionRef = doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', transactionId);
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    const newPayments = [...(transaction.payments || []), { id: Date.now().toString(), ...payment }];
    const { updateDoc } = await import('firebase/firestore');
    await updateDoc(transactionRef, { payments: newPayments });
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
    try { await signOut(auth); setTransactions([]); setHasEntered(false); }
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

  if (!user) return <AuthScreen onEnter={() => setHasEntered(true)} />;

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

      <div className="relative z-10 min-w-[1000px] max-w-7xl mx-auto px-6 py-6 min-h-screen flex flex-col">
        <header className="flex flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#d4af37] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              <Shield className="text-black" size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#fbf5b7]">SOVEREIGN</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] leading-none">{user?.email || 'Anonymous Access'} ({user?.uid.slice(0, 8)}...)</p>
            </div>
          </div>
          <div className="flex flex-row gap-4 items-center w-auto">
            <div className="w-48">
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

        <div className="flex-1 flex gap-4">

          <div className="flex flex-col w-52 shrink-0 gap-3">
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

      <AddModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={addTransaction} />      {selectedTransaction && <DetailModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} onSettle={handleSettleVisuals} onDelete={deleteTransaction} onAddPayment={setPaymentTransaction} />}      <ReminderModal isOpen={!!reminderItem} onClose={() => setReminderItem(null)} transaction={reminderItem} />

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
      <AppContent />
    </PreferencesProvider>
  );
}
