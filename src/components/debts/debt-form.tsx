import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useDebts } from "@/hooks/use-debts"
import type { Debt } from "@/types"

interface DebtFormProps {
  onCancel?: () => void
  onSuccess?: () => void
}

export function DebtForm({ onCancel, onSuccess }: DebtFormProps) {
  const { addDebt } = useDebts()
  const [type, setType] = useState<Debt['type']>('creditor')
  const [name, setName] = useState("")
  const [party, setParty] = useState("")
  const [amount, setAmount] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [interestRate, setInterestRate] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !amount || !party) return

    addDebt({
      type,
      name,
      party,
      totalAmount: parseFloat(amount),
      dueDate: dueDate || undefined,
      interestRate: interestRate ? parseFloat(interestRate) : undefined,
    })

    setName("")
    setParty("")
    setAmount("")
    setDueDate("")
    setInterestRate("")

    onSuccess?.()
  }

  const isCreditor = type === 'creditor'
  const partyLabel = isCreditor ? "Creditor/Supplier" : "Debtor/Customer"
  const partyPlaceholder = isCreditor ? "e.g. Supplier XYZ, Bank" : "e.g. John's Shop, Customer ABC"
  const nameLabel = isCreditor ? "Payment Description" : "Sale/Invoice Description"
  const namePlaceholder = isCreditor ? "e.g. Stock purchase, Rent" : "e.g. Invoice #123, Order ABC"

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Add Transaction</CardTitle>
        <CardDescription>Track money you owe or money owed to you.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Transaction Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Transaction Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('creditor')}
                className={`p-3 rounded-lg border-2 transition-all ${type === 'creditor'
                  ? 'border-destructive bg-destructive/10 text-destructive'
                  : 'border-border hover:border-muted-foreground'
                  }`}
              >
                <div className="text-sm font-semibold">I Owe</div>
                <div className="text-xs opacity-70">Money to pay</div>
              </button>
              <button
                type="button"
                onClick={() => setType('debtor')}
                className={`p-3 rounded-lg border-2 transition-all ${type === 'debtor'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-muted-foreground'
                  }`}
              >
                <div className="text-sm font-semibold">They Owe Me</div>
                <div className="text-xs opacity-70">Money to collect</div>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">{nameLabel}</label>
            <Input
              id="name"
              placeholder={namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="party" className="text-sm font-medium">{partyLabel}</label>
            <Input
              id="party"
              placeholder={partyPlaceholder}
              value={party}
              onChange={(e) => setParty(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">Total Amount</label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="interest" className="text-sm font-medium">Interest Rate (%)</label>
              <Input
                id="interest"
                type="number"
                placeholder="Optional"
                min="0"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="duedate" className="text-sm font-medium">
              Due Date
            </label>
            <Input
              id="duedate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Add Transaction</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
