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

