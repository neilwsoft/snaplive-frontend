"use client"

import { useLocale } from "@/lib/locale-context"
import { OrderDetail } from "@/types/order-detail"
import { GoodsDetails, ShipperInfo, RecipientInfo, WaybillInfo, LogisticsNotes } from "@/types/shipping-form"
import { OrderStatusBadge } from "./order-status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Package, Truck, User, CreditCard, Box } from "lucide-react"
import { format } from "date-fns"

interface ReadyToShipPanelProps {
  order: OrderDetail
  goodsDetails: GoodsDetails
  shipper: ShipperInfo
  recipient: RecipientInfo
  waybill: WaybillInfo
  notes: LogisticsNotes
}

export function ReadyToShipPanel({
  order,
  goodsDetails,
  shipper,
  recipient,
  waybill,
  notes,
}: ReadyToShipPanelProps) {
  const { t } = useLocale()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const paymentMethodLabels: Record<string, string> = {
    "seller-pays": "Seller Pays",
    "buyer-pays": "Buyer Pays",
    "cod": "Cash on Delivery",
  }

  return (
    <div className="grid grid-cols-[1fr_1fr_1fr] gap-6">
      {/* Column 1: Order Items + Customer Info */}
      <div className="space-y-6">
        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <Package className="h-4 w-4 text-[#64748b]" />
            <h2 className="text-base font-semibold text-[#27272a]">
              {t("orders.detail.readyToShip.orderItems")}
            </h2>
          </div>
          <div className="px-6 py-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-2 text-left text-xs font-medium text-[#64748b] uppercase">
                    {t("orders.detail.readyToShip.item")}
                  </th>
                  <th className="pb-2 text-right text-xs font-medium text-[#64748b] uppercase">
                    {t("orders.detail.readyToShip.qty")}
                  </th>
                  <th className="pb-2 text-right text-xs font-medium text-[#64748b] uppercase">
                    {t("orders.detail.readyToShip.status")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.products.map((product) => (
                  <tr key={product.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-3">
                      <div className="text-sm text-[#27272a] font-medium">{product.name}</div>
                      <div className="text-xs text-[#94a3b8]">{product.sku}</div>
                    </td>
                    <td className="py-3 text-right text-sm text-[#27272a]">
                      {product.quantity} {product.unit}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        product.fulfillmentStatus === "ship"
                          ? "bg-green-50 text-green-700"
                          : product.fulfillmentStatus === "pack"
                            ? "bg-blue-50 text-blue-700"
                            : product.fulfillmentStatus === "pick"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-50 text-slate-500"
                      }`}>
                        {product.fulfillmentStatus || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <User className="h-4 w-4 text-[#64748b]" />
            <h2 className="text-base font-semibold text-[#27272a]">
              {t("orders.detail.customerInfo")}
            </h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={order.customer.avatarUrl} alt={order.customer.name} />
                <AvatarFallback className="bg-gradient-to-br from-[#1c398e] to-[#27c840] text-white text-xs">
                  {getInitials(order.customer.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-[#27272a] font-medium">{order.customer.name}</span>
            </div>
            <div className="text-sm text-[#64748b]">{order.customer.contactNumber}</div>
            <div className="text-sm text-[#64748b]">{order.customer.email}</div>
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-[#27272a]">
              {t("orders.detail.transactionHistory")}
            </h2>
          </div>
          <div className="px-6 py-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-[#64748b]">{t("orders.detail.totalAmount")}</span>
              <span className="text-sm font-semibold text-[#27272a]">
                {order.currency} {order.totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#64748b]">{t("orders.detail.readyToShip.status")}</span>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#64748b]">{t("orders.detail.orderDate")}</span>
              <span className="text-sm text-[#27272a]">
                {format(order.timeOrdered, "yyyy-MM-dd HH:mm")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Column 2: Shipping Details */}
      <div className="space-y-6">
        {/* Shipper */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <Truck className="h-4 w-4 text-[#64748b]" />
            <h2 className="text-base font-semibold text-[#27272a]">
              {t("orders.detail.readyToShip.shipper")}
            </h2>
          </div>
          <div className="px-6 py-4 space-y-3">
            <div className="text-sm font-medium text-[#27272a]">{shipper.name || "—"}</div>
            <div className="text-sm text-[#64748b]">{shipper.contactNumber || "—"}</div>
            {shipper.email && (
              <div className="text-sm text-[#64748b]">{shipper.email}</div>
            )}
            <div className="text-sm text-[#64748b]">{shipper.dispatchAddress || "—"}</div>
          </div>
        </div>

        {/* Recipient */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <User className="h-4 w-4 text-[#64748b]" />
            <h2 className="text-base font-semibold text-[#27272a]">
              {t("orders.detail.readyToShip.recipient")}
            </h2>
          </div>
          <div className="px-6 py-4 space-y-3">
            <div className="text-sm font-medium text-[#27272a]">{recipient.name || "—"}</div>
            <div className="text-sm text-[#64748b]">{recipient.contactNumber || "—"}</div>
            {recipient.email && (
              <div className="text-sm text-[#64748b]">{recipient.email}</div>
            )}
            <div className="text-sm text-[#64748b]">{recipient.dispatchAddress || "—"}</div>
          </div>
        </div>
      </div>

      {/* Column 3: Logistics + Goods + Payment */}
      <div className="space-y-6">
        {/* Logistics */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <Truck className="h-4 w-4 text-[#64748b]" />
            <h2 className="text-base font-semibold text-[#27272a]">
              {t("orders.detail.readyToShip.logistics")}
            </h2>
          </div>
          <div className="px-6 py-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-[#64748b]">{t("orders.detail.readyToShip.logistics")}</span>
              <span className="text-sm text-[#27272a]">{waybill.logisticsProvider || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#64748b]">{t("orders.detail.readyToShip.serviceType")}</span>
              <span className="text-sm text-[#27272a]">{waybill.shippingServiceType || "—"}</span>
            </div>
            {waybill.trackingNumber && (
              <div className="flex justify-between">
                <span className="text-sm text-[#64748b]">{t("orders.detail.readyToShip.trackingNumber")}</span>
                <span className="text-sm text-[#27272a]">{waybill.trackingNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Goods Info */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <Box className="h-4 w-4 text-[#64748b]" />
            <h2 className="text-base font-semibold text-[#27272a]">
              {t("orders.detail.readyToShip.goodsInfo")}
            </h2>
          </div>
          <div className="px-6 py-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-[#64748b]">{t("orders.detail.readyToShip.grossWeight")}</span>
              <span className="text-sm text-[#27272a]">{goodsDetails.grossWeight} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#64748b]">{t("orders.detail.readyToShip.packages")}</span>
              <span className="text-sm text-[#27272a]">{goodsDetails.numberOfPackages}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#64748b]">{t("orders.detail.readyToShip.totalQty")}</span>
              <span className="text-sm text-[#27272a]">{goodsDetails.totalQuantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#64748b]">{t("orders.detail.readyToShip.declaredValue")}</span>
              <span className="text-sm text-[#27272a]">
                {goodsDetails.currency} {goodsDetails.totalDeclaredValue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment & Notes */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[#64748b]" />
            <h2 className="text-base font-semibold text-[#27272a]">
              {t("orders.detail.readyToShip.paymentNotes")}
            </h2>
          </div>
          <div className="px-6 py-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-[#64748b]">{t("orders.detail.readyToShip.paymentMethod")}</span>
              <span className="text-sm text-[#27272a]">
                {paymentMethodLabels[notes.paymentMethod] || notes.paymentMethod}
              </span>
            </div>
            <div>
              <span className="text-sm text-[#64748b] block mb-1">{t("orders.detail.readyToShip.deliveryInstructions")}</span>
              <span className="text-sm text-[#27272a]">
                {notes.deliveryInstructions || t("orders.detail.readyToShip.noInstructions")}
              </span>
            </div>
            <div>
              <span className="text-sm text-[#64748b] block mb-1">{t("orders.detail.readyToShip.remarks")}</span>
              <span className="text-sm text-[#27272a]">
                {notes.remarksInsurance || t("orders.detail.readyToShip.noRemarks")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
