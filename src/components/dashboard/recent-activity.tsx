import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Debt } from "@/types"
import { usePreferences } from "@/context/preferences-context"
// import { formatDistanceToNow } from "date-fns"
// I'll use standard Intl basic formatting or simple subtraction for "days ago" to avoid extra deps for now,
// or just use raw date. 
// Actually, simple date formatting is fine.

interface RecentActivityProps {
  debts: Debt[]
}

export function RecentActivity({ debts }: RecentActivityProps) {
  const { formatCurrency } = usePreferences()
  // Aggregate recent actions (creation + payments)
  // For MVP, just showing recent debts created is fine, or simple activity logic.
  // Let's create a derived list of "actions".

  const activities = [
    ...debts.map(d => ({
      type: 'Added Debt',
      name: d.name,
      date: d.createdAt,
      amount: d.totalAmount
    })),
    ...debts.flatMap(d => d.payments.map(p => ({
      type: 'Payment',
      name: d.name,
      date: p.date,
      amount: p.amount
    })))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest financial movements.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent activity.</p>
          ) : (
            activities.map((activity, i) => (
              <div key={i} className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{activity.type}: {activity.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.date).toLocaleDateString()}
                  </p>
                </div>
                <div className={`ml-auto font-medium ${activity.type === 'Payment' ? 'text-green-500' : 'text-red-500'}`}>
                  {activity.type === 'Payment' ? '+' : '-'}
                  {formatCurrency(activity.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
