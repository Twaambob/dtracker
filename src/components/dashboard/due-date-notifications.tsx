import { useDebts } from "@/hooks/use-debts"
import { usePreferences } from "@/context/preferences-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Clock } from "lucide-react"
import type { Debt } from "@/types"

export function DueDateNotifications() {
  const { getDueDebts } = useDebts()

  const { formatCurrency } = usePreferences()

  const dueToday = getDueDebts(1)
  const dueThisWeek = getDueDebts(7).filter((debt) => !dueToday.includes(debt))

  if (dueToday.length === 0 && dueThisWeek.length === 0) {
    return null
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    return `${diffDays} days`
  }

  const renderDebtItem = (debt: Debt, urgent = false) => {
    const isCreditor = debt.type === 'creditor'
    return (
      <div
        key={debt.id}
        className={`flex items-center justify-between p-3 rounded-lg border ${urgent
          ? 'border-destructive bg-destructive/5'
          : 'border-border bg-muted/30'
          }`}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${isCreditor ? 'text-destructive' : 'text-primary'}`}>
              {isCreditor ? '↑ You Owe' : '↓ They Owe'}
            </span>
            <span className="text-sm">{debt.party}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">{debt.name}</div>
        </div>
        <div className="text-right">
          <div className="font-semibold">{formatCurrency(debt.remainingAmount)}</div>
          <div className={`text-xs ${urgent ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
            {debt.dueDate && formatDate(debt.dueDate)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {dueToday.length > 0 && (
        <Card className="border-destructive">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-lg text-destructive">Due Today</CardTitle>
            </div>
            <CardDescription>Payments requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {dueToday.map((debt) => renderDebtItem(debt, true))}
          </CardContent>
        </Card>
      )}

      {dueThisWeek.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Due This Week</CardTitle>
            </div>
            <CardDescription>Upcoming payments in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {dueThisWeek.map((debt) => renderDebtItem(debt))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
