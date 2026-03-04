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
import { ShipperInfo } from "@/types/shipping-form"

interface ConsignorPanelProps {
  shipper: ShipperInfo
  savedShippers?: ShipperInfo[]
  onChange: (shipper: ShipperInfo) => void
}

export function ConsignorPanel({
  shipper,
  savedShippers = [],
  onChange,
}: ConsignorPanelProps) {
  const handleShipperSelect = (shipperId: string) => {
    if (shipperId === "new") {
      onChange({
        name: "",
        contactNumber: "",
        email: "",
        dispatchAddress: "",
      })
    } else {
      const selectedShipper = savedShippers.find((s) => s.id === shipperId)
      if (selectedShipper) {
        onChange(selectedShipper)
      }
    }
  }

  // Check if a saved shipper is selected
  const isSavedShipper = !!shipper.id

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-base font-semibold text-[#27272a]">
          Consignor (Shipper) 发货人
        </h2>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-4">
        {/* Shipper Name Dropdown */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#64748b] uppercase">
            Shipper Name
          </Label>
          <Select
            value={shipper.id || "new"}
            onValueChange={handleShipperSelect}
          >
            <SelectTrigger className="h-9 text-slate-900">
              <SelectValue placeholder="Select shipper" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">+ New Shipper</SelectItem>
              {savedShippers.map((s) => (
                <SelectItem key={s.id} value={s.id!}>
                  {s.label || s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!shipper.id && (
            <Input
              value={shipper.name || ""}
              onChange={(e) => onChange({ ...shipper, name: e.target.value })}
              placeholder="Enter shipper name"
              className="h-9 mt-2 text-slate-900"
            />
          )}
          {isSavedShipper && (
            <div className="mt-2 text-sm font-medium text-[#27272a]">
              {shipper.name}
            </div>
          )}
        </div>

        {/* Contact Number */}
        <div className="space-y-2">
          <Label
            htmlFor="shipper-contact"
            className="text-xs font-medium text-[#64748b] uppercase"
          >
            Contact Number
          </Label>
          <Input
            id="shipper-contact"
            type="tel"
            value={shipper.contactNumber || ""}
            onChange={(e) =>
              onChange({ ...shipper, contactNumber: e.target.value })
            }
            placeholder="+86 138 1234 5678"
            className={`h-9 text-slate-900 ${isSavedShipper ? 'bg-slate-50' : ''}`}
            readOnly={isSavedShipper}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label
            htmlFor="shipper-email"
            className="text-xs font-medium text-[#64748b] uppercase"
          >
            Email
          </Label>
          <Input
            id="shipper-email"
            type="email"
            value={shipper.email || ""}
            onChange={(e) => onChange({ ...shipper, email: e.target.value })}
            placeholder="shipper@example.com"
            className={`h-9 text-slate-900 ${isSavedShipper ? 'bg-slate-50' : ''}`}
            readOnly={isSavedShipper}
          />
        </div>

        {/* Dispatch Address */}
        <div className="space-y-2">
          <Label
            htmlFor="shipper-address"
            className="text-xs font-medium text-[#64748b] uppercase"
          >
            Dispatch Address
          </Label>
          <Textarea
            id="shipper-address"
            value={shipper.dispatchAddress || ""}
            onChange={(e) =>
              onChange({ ...shipper, dispatchAddress: e.target.value })
            }
            placeholder="Enter dispatch address"
            rows={4}
            className={`resize-none text-slate-900 ${isSavedShipper ? 'bg-slate-50' : ''}`}
            readOnly={isSavedShipper}
          />
        </div>
      </div>
    </div>
  )
}
