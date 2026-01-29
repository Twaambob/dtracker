/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react'

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'ZMW' | 'KES' | 'NGN' | 'ZAR'

interface PreferencesContextType {
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
  enableNotifications: boolean
  setEnableNotifications: (enabled: boolean) => void
  enableVisceralSatisfaction: boolean
  setEnableVisceralSatisfaction: (enabled: boolean) => void
  formatCurrency: (amount: number) => string
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

const CURRENCY_LOCALES: Record<CurrencyCode, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  ZMW: 'en-ZM',
  KES: 'en-KE',
  NGN: 'en-NG',
  ZAR: 'en-ZA'
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    return (localStorage.getItem('preferences_currency') as CurrencyCode) || 'USD'
  })

  const [enableNotifications, setEnableNotificationsState] = useState(() => {
    const saved = localStorage.getItem('preferences_notifications')
    return saved !== null ? saved === 'true' : true
  })

  const [enableVisceralSatisfaction, setEnableVisceralSatisfactionState] = useState(() => {
    const saved = localStorage.getItem('preferences_visceral')
    return saved !== null ? saved === 'true' : true
  })

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c)
    localStorage.setItem('preferences_currency', c)
  }

  const setEnableNotifications = (enabled: boolean) => {
    setEnableNotificationsState(enabled)
    localStorage.setItem('preferences_notifications', String(enabled))
  }

  const setEnableVisceralSatisfaction = (enabled: boolean) => {
    setEnableVisceralSatisfactionState(enabled)
    localStorage.setItem('preferences_visceral', String(enabled))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <PreferencesContext.Provider value={{
      currency,
      setCurrency,
      enableNotifications,
      setEnableNotifications,
      enableVisceralSatisfaction,
      setEnableVisceralSatisfaction,
      formatCurrency
    }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider')
  }
  return context
}
