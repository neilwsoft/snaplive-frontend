import { Customer } from "@/types/order-detail"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface CustomerShippingPanelProps {
  customer: Customer
}

export function CustomerShippingPanel({ customer }: CustomerShippingPanelProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-base font-semibold text-[#27272a]">
          Customer & Shipping Information
        </h2>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Ordered By */}
        <div>
          <label className="text-xs font-medium text-[#64748b] uppercase mb-2 block">
            Ordered by
          </label>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={customer.avatarUrl} alt={customer.name} />
              <AvatarFallback className="bg-gradient-to-br from-[#1c398e] to-[#27c840] text-white text-sm">
                {getInitials(customer.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-[#27272a] font-medium">{customer.name}</span>
          </div>
        </div>

        {/* Contact Number */}
        <div>
          <label className="text-xs font-medium text-[#64748b] uppercase mb-2 block">
            Contact Number
          </label>
          <div className="text-sm text-[#27272a]">{customer.contactNumber}</div>
        </div>

        {/* Email */}
        <div>
          <label className="text-xs font-medium text-[#64748b] uppercase mb-2 block">
            Email
          </label>
          <div className="text-sm text-[#27272a]">{customer.email}</div>
        </div>

        {/* Address */}
        <div>
          <label className="text-xs font-medium text-[#64748b] uppercase mb-2 block">
            Address
          </label>
          <div className="text-sm text-[#27272a]">
            {customer.address || <span className="text-[#94a3b8]">No address provided</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
