import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Clock, AlertCircle } from "lucide-react"
import { useDebts } from "@/hooks/use-debts"
import { usePreferences } from "@/context/preferences-context"

export function OverviewCards() {
  const { getCreditors, getDebtors, getDueDebts } = useDebts()

  const creditors = getCreditors()
  const debtors = getDebtors()
  const dueDebts = getDueDebts(7)

  const totalOwed = creditors.reduce((sum, debt) => sum + debt.remainingAmount, 0)
  const totalToCollect = debtors.reduce((sum, debt) => sum + debt.remainingAmount, 0)
  const dueSoonAmount = dueDebts.reduce((sum, debt) => sum + debt.remainingAmount, 0)

  const { formatCurrency } = usePreferences()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">You Owe</CardTitle>
          <TrendingDown className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{formatCurrency(totalOwed)}</div>
          <p className="text-xs text-muted-foreground">
            {creditors.length} creditor{creditors.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Owed to You</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{formatCurrency(totalToCollect)}</div>
          <p className="text-xs text-muted-foreground">
            {debtors.length} debtor{debtors.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Position</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${totalToCollect - totalOwed >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {formatCurrency(totalToCollect - totalOwed)}
          </div>
          <p className="text-xs text-muted-foreground">
            {totalToCollect - totalOwed >= 0 ? 'Positive balance' : 'Negative balance'}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(dueSoonAmount)}</div>
          <p className="text-xs text-muted-foreground">
            {dueDebts.length} payment{dueDebts.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
