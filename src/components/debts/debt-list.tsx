import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useDebts } from "@/hooks/use-debts"
import { usePreferences } from "@/context/preferences-context"
import type { Debt } from "@/types"
import { Trash2, Wallet, TrendingDown, TrendingUp, AlertCircle } from "lucide-react"
import { useState } from "react"

export function DebtList() {
  const { debts, deleteDebt } = useDebts()
  const [filter, setFilter] = useState<'all' | 'creditor' | 'debtor'>('all')

  const { formatCurrency } = usePreferences()

  const calculateProgress = (debt: Debt) => {
    if (debt.totalAmount === 0) return 100
    return ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100
  }

  const isDueSoon = (debt: Debt) => {
    if (!debt.dueDate || debt.status === 'paid') return false
    const dueDate = new Date(debt.dueDate)
    const now = new Date()
    const diffTime = dueDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 7
  }

  // Filter and sort
  const filteredDebts = debts.filter(debt =>
    filter === 'all' || debt.type === filter
  )
  const sortedDebts = [...filteredDebts].sort((a, b) => b.remainingAmount - a.remainingAmount)

  if (debts.length === 0) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No transactions recorded. Add one to get started!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({debts.length})
        </Button>
        <Button
          variant={filter === 'creditor' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('creditor')}
        >
          <TrendingDown className="h-4 w-4 mr-1" />
          I Owe ({debts.filter(d => d.type === 'creditor').length})
        </Button>
        <Button
          variant={filter === 'debtor' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('debtor')}
        >
          <TrendingUp className="h-4 w-4 mr-1" />
          They Owe ({debts.filter(d => d.type === 'debtor').length})
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 lg:col-span-4">
        {sortedDebts.map((debt) => {
          const dueSoon = isDueSoon(debt)
          const isCreditor = debt.type === 'creditor'

          return (
            <Card
              key={debt.id}
              className={`flex flex-col justify-between ${dueSoon ? 'border-destructive' : ''}`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  {isCreditor ? (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-primary" />
                  )}
                  <CardTitle className="text-base font-semibold">{debt.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {dueSoon && <AlertCircle className="h-4 w-4 text-destructive" />}
                  <span className={`text-xs px-2 py-1 rounded-full ${debt.status === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                    {debt.status.toUpperCase()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{debt.party}</span>
                    <span className="font-mono">{formatCurrency(debt.remainingAmount)} left</span>
                  </div>
                  {debt.dueDate && (
                    <div className={`text-xs mb-2 ${dueSoon ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                      Due: {new Date(debt.dueDate).toLocaleDateString()}
                    </div>
                  )}
                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ease-in-out ${isCreditor ? 'bg-destructive' : 'bg-primary'}`}
                      style={{ width: `${calculateProgress(debt)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{calculateProgress(debt).toFixed(0)}% paid</span>
                    <span>Total: {formatCurrency(debt.totalAmount)}</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button size="sm" variant="outline" onClick={() => deleteDebt(debt.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm">
                    <Wallet className="mr-2 h-4 w-4" /> Pay
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
