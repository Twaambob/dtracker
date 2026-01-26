import type { RecurringTransaction, RecurringFrequency } from '@/types'

/**
 * Calculate the next due date based on frequency and current date
 */
export const calculateNextDueDate = (currentDate: Date, frequency: RecurringFrequency): Date => {
    const nextDate = new Date(currentDate)

    switch (frequency) {
        case 'daily':
            nextDate.setDate(nextDate.getDate() + 1)
            break
        case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7)
            break
        case 'biweekly':
            nextDate.setDate(nextDate.getDate() + 14)
            break
        case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1)
            break
        case 'quarterly':
            nextDate.setMonth(nextDate.getMonth() + 3)
            break
        case 'semiannually':
            nextDate.setMonth(nextDate.getMonth() + 6)
            break
        case 'annually':
            nextDate.setFullYear(nextDate.getFullYear() + 1)
            break
    }

    return nextDate
}

/**
 * Check if a recurring transaction should be shown (within 7 days of due date)
 */
export const shouldShowRecurring = (nextDueDate: string): boolean => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dueDate = new Date(nextDueDate)
    dueDate.setHours(0, 0, 0, 0)

    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Show if within 7 days (including today and future 7 days)
    return diffDays >= 0 && diffDays <= 7
}

/**
 * Get recurring transactions that are due soon (within 7 days)
 */
export const getRecurringTransactionsDueSoon = (
    recurringTransactions: RecurringTransaction[]
): RecurringTransaction[] => {
    return recurringTransactions.filter(
        (rt) => rt.active && shouldShowRecurring(rt.next_due_date)
    )
}

/**
 * Get the display name for a frequency
 */
export const getFrequencyLabel = (frequency: RecurringFrequency): string => {
    const labels: Record<RecurringFrequency, string> = {
        daily: 'Daily',
        weekly: 'Weekly',
        biweekly: 'Bi-weekly',
        monthly: 'Monthly',
        quarterly: 'Quarterly',
        semiannually: 'Semi-annually',
        annually: 'Annually'
    }
    return labels[frequency]
}

/**
 * Get category icon name
 */
export const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
        salary: 'Wallet',
        rent: 'Home',
        utilities: 'Zap',
        subscription: 'Repeat',
        insurance: 'Shield',
        loan: 'CreditCard',
        other: 'DollarSign'
    }
    return icons[category] || 'DollarSign'
}
