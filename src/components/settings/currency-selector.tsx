import { usePreferences } from '@/context/preferences-context'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function CurrencySelector() {
  const { currency, setCurrency } = usePreferences()

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Currency
      </label>
      <Select value={currency} onValueChange={(value: string) => setCurrency(value as import('@/context/preferences-context').CurrencyCode)}>
        <SelectTrigger className="w-full bg-black/50 border-white/10 text-white focus:ring-[#d4af37]">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent className="text-white bg-black/70">
          <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
          <SelectItem value="ZMW">ZMW (ZK) - Zambian Kwacha</SelectItem>
          <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
          <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
          <SelectItem value="KES">KES (KSh) - Kenyan Shilling</SelectItem>
          <SelectItem value="NGN">NGN (₦) - Nigerian Naira</SelectItem>
          <SelectItem value="ZAR">ZAR (R) - South African Rand</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-[10px] text-muted-foreground">
        Select your preferred display currency for all transactions.
      </p>
    </div>
  )
}
