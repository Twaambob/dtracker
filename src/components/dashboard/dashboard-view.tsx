import { useState } from "react"
import { OverviewCards } from "@/components/dashboard/overview-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { DueDateNotifications } from "@/components/dashboard/due-date-notifications"
import { Button } from "@/components/ui/button"
import { useDebts } from "@/hooks/use-debts"
import { Plus } from "lucide-react"
import { DebtList } from "@/components/debts/debt-list"
import { DebtForm } from "@/components/debts/debt-form"

export function DashboardView() {
  const { debts } = useDebts()
  const [showAddDebt, setShowAddDebt] = useState(false)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowAddDebt(!showAddDebt)}>
            <Plus className="mr-2 h-4 w-4" /> {showAddDebt ? "Cancel" : "Add Transaction"}
          </Button>
        </div>
      </div>

      {showAddDebt && (
        <div className="mb-8 border-b pb-8">
          <DebtForm onSuccess={() => setShowAddDebt(false)} onCancel={() => setShowAddDebt(false)} />
        </div>
      )}

      <DueDateNotifications />

      <OverviewCards />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RecentActivity debts={debts} />
        <div className="col-span-4 lg:col-span-4">
          <DebtList />
        </div>
      </div>
    </div>
  )
}
