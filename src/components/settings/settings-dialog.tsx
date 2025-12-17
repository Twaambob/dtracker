import { X, Settings, Bell, Zap } from 'lucide-react'
import { usePreferences } from '@/context/preferences-context'
import { CurrencySelector } from './currency-selector'

interface SettingsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const {
    enableNotifications,
    setEnableNotifications,
    enableVisceralSatisfaction,
    setEnableVisceralSatisfaction
  } = usePreferences()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#1a1a1a] border border-[#d4af37]/30 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#d4af37]/10 bg-gradient-to-r from-[#1a1a1a] to-[#252525]">
          <h2 className="text-xl font-bold text-[#d4af37] font-serif tracking-wide flex items-center gap-2">
            <Settings size={20} /> Preferences
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">

          {/* Section: General */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#d4af37] uppercase tracking-widest border-b border-white/5 pb-2">
              General
            </h3>
            <CurrencySelector />
          </div>

          {/* Section: Experience */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#d4af37] uppercase tracking-widest border-b border-white/5 pb-2">
              Experience
            </h3>

            {/* Toggle: Visceral Satisfaction */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Zap size={14} className="text-[#d4af37]" /> Visceral Satisfaction
                </label>
                <p className="text-[10px] text-muted-foreground mr-4">
                  Enable particle effects and explosions for settled debts.
                </p>
              </div>
              <button
                onClick={() => setEnableVisceralSatisfaction(!enableVisceralSatisfaction)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:ring-offset-2 focus:ring-offset-[#1a1a1a] ${enableVisceralSatisfaction ? 'bg-[#d4af37]' : 'bg-white/10'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enableVisceralSatisfaction ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>

            {/* Toggle: Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Bell size={14} className="text-[#d4af37]" /> Due Date Alerts
                </label>
                <p className="text-[10px] text-muted-foreground mr-4">
                  Show badges and alerts for upcoming and overdue debts.
                </p>
              </div>
              <button
                onClick={() => setEnableNotifications(!enableNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:ring-offset-2 focus:ring-offset-[#1a1a1a] ${enableNotifications ? 'bg-[#d4af37]' : 'bg-white/10'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enableNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
