"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LogisticsNotes } from "@/types/shipping-form"

interface PaymentLogisticsNotesPanelProps {
  notes: LogisticsNotes
  onChange: (notes: LogisticsNotes) => void
}

const PAYMENT_METHODS = [
  { id: "seller-pays", name: "Seller Pays 卖家支付" },
  { id: "buyer-pays", name: "Buyer Pays 买家支付" },
  { id: "cod", name: "Cash on Delivery 货到付款" },
]

export function PaymentLogisticsNotesPanel({
  notes,
  onChange,
}: PaymentLogisticsNotesPanelProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-base font-semibold text-[#27272a]">
          Payment & Logistics Notes
        </h2>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-4">
        {/* Payment Method */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#64748b] uppercase">
            Payment Method
          </Label>
          <Select
            value={notes.paymentMethod}
            onValueChange={(value: "seller-pays" | "buyer-pays" | "cod") =>
              onChange({ ...notes, paymentMethod: value })
            }
          >
            <SelectTrigger className="h-9 text-slate-900">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((method) => (
                <SelectItem key={method.id} value={method.id}>
                  {method.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Delivery Instructions */}
        <div className="space-y-2">
          <Label
            htmlFor="delivery-instructions"
            className="text-xs font-medium text-[#64748b] uppercase"
          >
            Delivery Instructions
          </Label>
          <Textarea
            id="delivery-instructions"
            value={notes.deliveryInstructions}
            onChange={(e) =>
              onChange({ ...notes, deliveryInstructions: e.target.value })
            }
            placeholder="Special delivery instructions..."
            rows={3}
            className="resize-none text-slate-900"
          />
        </div>

        {/* Remarks / Insurance */}
        <div className="space-y-2">
          <Label
            htmlFor="remarks-insurance"
            className="text-xs font-medium text-[#64748b] uppercase"
          >
            Remarks / Insurance
          </Label>
          <Textarea
            id="remarks-insurance"
            value={notes.remarksInsurance}
            onChange={(e) =>
              onChange({ ...notes, remarksInsurance: e.target.value })
            }
            placeholder="Additional remarks or insurance information..."
            rows={3}
            className="resize-none text-slate-900"
          />
        </div>
      </div>
    </div>
  )
}
