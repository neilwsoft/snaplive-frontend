"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { WaybillInfo } from "@/types/shipping-form"
import { Badge } from "@/components/ui/badge"

interface LogisticsProvider {
  code: string
  name: string
  nameZh: string
  serviceTypes: string[]
}

interface EWaybillPanelProps {
  waybill: WaybillInfo
  onChange: (waybill: WaybillInfo) => void
  providers?: LogisticsProvider[]
}

const DEFAULT_LOGISTICS_PROVIDERS: LogisticsProvider[] = [
  { code: "sf", name: "SF Express", nameZh: "顺丰速运", serviceTypes: ["standard", "express", "same-day"] },
  { code: "ems", name: "EMS", nameZh: "邮政速递", serviceTypes: ["standard", "international"] },
  { code: "yto", name: "YTO Express", nameZh: "圆通速递", serviceTypes: ["standard", "economy"] },
  { code: "zto", name: "ZTO Express", nameZh: "中通快递", serviceTypes: ["standard", "economy"] },
  { code: "sto", name: "STO Express", nameZh: "申通快递", serviceTypes: ["standard", "economy"] },
]

const SERVICE_TYPE_LABELS: Record<string, string> = {
  standard: "Standard Express",
  express: "Express",
  economy: "Economy",
  "same-day": "Same Day",
  international: "International",
}

export function EWaybillPanel({ waybill, onChange, providers }: EWaybillPanelProps) {
  const logisticsProviders = providers?.length ? providers : DEFAULT_LOGISTICS_PROVIDERS

  // Get service types for selected provider
  const selectedProvider = logisticsProviders.find((p) => p.code === waybill.logisticsProvider)
  const availableServiceTypes = selectedProvider?.serviceTypes || ["standard", "express", "economy"]
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-base font-semibold text-[#27272a]">
          E-Waybill 电子运单
        </h2>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-4">
        {/* Logistics Provider */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#64748b] uppercase">
            Logistics Provider
          </Label>
          <Select
            value={waybill.logisticsProvider}
            onValueChange={(value) =>
              onChange({ ...waybill, logisticsProvider: value })
            }
          >
            <SelectTrigger className="h-9 text-slate-900">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {logisticsProviders.map((provider) => (
                <SelectItem key={provider.code} value={provider.code}>
                  {provider.name} {provider.nameZh}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tracking Number */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#64748b] uppercase">
            Tracking Number
          </Label>
          <div className="flex items-center gap-2">
            <Input
              value={waybill.trackingNumber || "Auto-generated"}
              readOnly
              disabled
              className="h-9 bg-[#f8fafc] text-slate-900"
            />
            {waybill.trackingStatus && (
              <Badge
                variant="secondary"
                className="bg-[#dbeafe] text-[#1e40af] text-xs"
              >
                {waybill.trackingStatus}
              </Badge>
            )}
          </div>
        </div>

        {/* LiveHub Order ID */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#64748b] uppercase">
            LiveHub Order ID
          </Label>
          <Input
            value={waybill.liveHubOrderId}
            readOnly
            disabled
            className="h-9 bg-[#f8fafc] text-slate-900"
          />
        </div>

        {/* Marketplace Order ID */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#64748b] uppercase">
            Marketplace Order ID
          </Label>
          <div className="space-y-1">
            <div className="text-xs text-[#64748b]">{waybill.marketplace}</div>
            <Input
              value={waybill.marketplaceOrderId}
              readOnly
              disabled
              className="h-9 bg-[#f8fafc] text-slate-900"
            />
          </div>
        </div>

        {/* Shipping Service Type */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#64748b] uppercase">
            Shipping Service Type
          </Label>
          <Select
            value={waybill.shippingServiceType}
            onValueChange={(value) =>
              onChange({ ...waybill, shippingServiceType: value })
            }
          >
            <SelectTrigger className="h-9 text-slate-900">
              <SelectValue placeholder="Select service type" />
            </SelectTrigger>
            <SelectContent>
              {availableServiceTypes.map((serviceType) => (
                <SelectItem key={serviceType} value={serviceType}>
                  {SERVICE_TYPE_LABELS[serviceType] || serviceType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
