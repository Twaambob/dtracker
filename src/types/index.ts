export interface Payment {
  id: string
  debtId: string
  amount: number
  date: string
  note?: string
}

export interface Debt {
  id: string
  type: 'creditor' | 'debtor' // creditor = money you owe, debtor = money owed to you
  name: string
  party: string // The other party (creditor/supplier or debtor/customer)
  totalAmount: number
  remainingAmount: number
  interestRate?: number
  dueDate?: string
  status: 'active' | 'paid'
  payments: Payment[]
  createdAt: string
  updatedAt: string
}

export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semiannually' | 'annually'

export type RecurringCategory = 'salary' | 'rent' | 'utilities' | 'subscription' | 'insurance' | 'loan' | 'other'

export interface RecurringTransaction {
  id: string
  user_id: string
  type: 'credit' | 'debt'
  name: string
  amount: number
  frequency: RecurringFrequency
  start_date: string
  next_due_date: string
  category: RecurringCategory
  note?: string
  contact?: string
  active: boolean
  created_at: string
  updated_at: string
  last_generated_date?: string
  auto_create_transaction?: boolean
}

