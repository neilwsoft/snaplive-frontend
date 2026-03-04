"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RecipientInfo } from "@/types/shipping-form"

interface ConsigneePanelProps {
  recipient: RecipientInfo
  savedRecipients?: RecipientInfo[]
  onChange: (recipient: RecipientInfo) => void
}

export function ConsigneePanel({
  recipient,
  savedRecipients = [],
  onChange,
}: ConsigneePanelProps) {
  const handleRecipientSelect = (recipientId: string) => {
    if (recipientId === "new") {
      onChange({
        name: "",
        contactNumber: "",
        email: "",
        dispatchAddress: "",
      })
    } else {
      const selectedRecipient = savedRecipients.find((r) => r.id === recipientId)
      if (selectedRecipient) {
        onChange(selectedRecipient)
      }
    }
  }

  // Check if a saved recipient is selected
  const isSavedRecipient = !!recipient.id

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-base font-semibold text-[#27272a]">
          Consignee (Recipient) 收货人
        </h2>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-4">
        {/* Recipient Name Dropdown */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#64748b] uppercase">
            Recipient Name
          </Label>
          <Select
            value={recipient.id || "new"}
            onValueChange={handleRecipientSelect}
          >
            <SelectTrigger className="h-9 text-slate-900">
              <SelectValue placeholder="Select recipient" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">+ New Recipient</SelectItem>
              {savedRecipients.map((r) => (
                <SelectItem key={r.id} value={r.id!}>
                  {r.label || r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!recipient.id && (
            <Input
              value={recipient.name || ""}
              onChange={(e) => onChange({ ...recipient, name: e.target.value })}
              placeholder="Enter recipient name"
              className="h-9 mt-2 text-slate-900"
            />
          )}
          {isSavedRecipient && (
            <div className="mt-2 text-sm font-medium text-[#27272a]">
              {recipient.name}
            </div>
          )}
        </div>

        {/* Contact Number */}
        <div className="space-y-2">
          <Label
            htmlFor="recipient-contact"
            className="text-xs font-medium text-[#64748b] uppercase"
          >
            Contact Number
          </Label>
          <Input
            id="recipient-contact"
            type="tel"
            value={recipient.contactNumber || ""}
            onChange={(e) =>
              onChange({ ...recipient, contactNumber: e.target.value })
            }
            placeholder="+86 138 1234 5678"
            className={`h-9 text-slate-900 ${isSavedRecipient ? 'bg-slate-50' : ''}`}
            readOnly={isSavedRecipient}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label
            htmlFor="recipient-email"
            className="text-xs font-medium text-[#64748b] uppercase"
          >
            Email
          </Label>
          <Input
            id="recipient-email"
            type="email"
            value={recipient.email || ""}
            onChange={(e) => onChange({ ...recipient, email: e.target.value })}
            placeholder="recipient@example.com"
            className={`h-9 text-slate-900 ${isSavedRecipient ? 'bg-slate-50' : ''}`}
            readOnly={isSavedRecipient}
          />
        </div>

        {/* Dispatch Address */}
        <div className="space-y-2">
          <Label
            htmlFor="recipient-address"
            className="text-xs font-medium text-[#64748b] uppercase"
          >
            Delivery Address
          </Label>
          <Textarea
            id="recipient-address"
            value={recipient.dispatchAddress || ""}
            onChange={(e) =>
              onChange({ ...recipient, dispatchAddress: e.target.value })
            }
            placeholder="Enter delivery address"
            rows={4}
            className={`resize-none text-slate-900 ${isSavedRecipient ? 'bg-slate-50' : ''}`}
            readOnly={isSavedRecipient}
          />
        </div>
      </div>
    </div>
  )
}
