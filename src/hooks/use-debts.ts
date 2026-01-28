import { useLocalStorage } from "./use-local-storage"
import type { Debt, Payment } from "@/types"
import { useEffect } from "react"

export function useDebts() {
  const [debts, setDebts] = useLocalStorage<Debt[]>("dtracker_debts", [])

  // Migration: add type and party fields to legacy debts
  // Run migration once on mount
  useEffect(() => {
    const needsMigration = debts.some((debt) => !debt.type || !debt.party)
    if (needsMigration) {
      setDebts((prev) =>
        prev.map((debt) => {
          const lender = (debt as Record<string, unknown>)['lender'];
          return {
            ...debt,
            type: debt.type || 'creditor',
            party: debt.party || (typeof lender === 'string' ? lender : 'Unknown'),
          }
        })
      )
    }
  }, [debts, setDebts])

  const addDebt = (debt: Omit<Debt, "id" | "createdAt" | "updatedAt" | "payments" | "remainingAmount" | "status">) => {
    const newDebt: Debt = {
      ...debt,
      id: crypto.randomUUID(),
      remainingAmount: debt.totalAmount,
      status: 'active',
      payments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setDebts((prev) => [...prev, newDebt])
  }

  const updateDebt = (id: string, updates: Partial<Debt>) => {
    setDebts((prev) =>
      prev.map((debt) =>
        debt.id === id ? { ...debt, ...updates, updatedAt: new Date().toISOString() } : debt
      )
    )
  }

  const deleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((debt) => debt.id !== id))
  }

  const addPayment = (debtId: string, amount: number, note?: string) => {
    setDebts((prev) =>
      prev.map((debt) => {
        if (debt.id !== debtId) return debt

        const newPayment: Payment = {
          id: crypto.randomUUID(),
          debtId,
          amount,
          date: new Date().toISOString(),
          note,
        }

        const newRemaining = debt.remainingAmount - amount
        const newStatus = newRemaining <= 0 ? 'paid' : 'active'

        return {
          ...debt,
          remainingAmount: Math.max(0, newRemaining),
          status: newStatus,
          payments: [...debt.payments, newPayment],
          updatedAt: new Date().toISOString(),
        }
      })
    )
  }

  // Helper functions
  const getCreditors = () => debts.filter((debt) => debt.type === 'creditor')
  const getDebtors = () => debts.filter((debt) => debt.type === 'debtor')

  const getDueDebts = (days: number = 7) => {
    const now = new Date()
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

    return debts.filter((debt) => {
      if (!debt.dueDate || debt.status === 'paid') return false
      const dueDate = new Date(debt.dueDate)
      return dueDate >= now && dueDate <= futureDate
    })
  }

  return {
    debts,
    addDebt,
    updateDebt,
    deleteDebt,
    addPayment,
    getCreditors,
    getDebtors,
    getDueDebts,
  }
}
