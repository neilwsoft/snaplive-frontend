"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import { OrderDetailHeader } from "@/components/orders/order-detail-header"
import { ProductsOrderedPanel } from "@/components/orders/products-ordered-panel"
import { CustomerShippingPanel } from "@/components/orders/customer-shipping-panel"
import { TransactionHistoryPanel } from "@/components/orders/transaction-history-panel"
import { OrderDetailFooter } from "@/components/orders/order-detail-footer"
import { GoodsDetailsPanel } from "@/components/orders/goods-details-panel"
import { ConsignorPanel } from "@/components/orders/consignor-panel"
import { ConsigneePanel } from "@/components/orders/consignee-panel"
import { EWaybillPanel } from "@/components/orders/e-waybill-panel"
import { PaymentLogisticsNotesPanel } from "@/components/orders/payment-logistics-notes-panel"
import { ReadyToShipPanel } from "@/components/orders/ready-to-ship-panel"
import { useOrderDetail, useUpdateOrder, useUpdateProcessingStep } from "@/lib/hooks/useOrders"
import { useShippers, useRecipients, useLogisticsProviders, useProcessOrder } from "@/lib/hooks/useShipping"
import { transformAddressToFrontend } from "@/lib/api/shipping"
import { OrderDetail, FulfillmentStatus } from "@/types/order-detail"
import {
  GoodsDetails,
  ShipperInfo,
  RecipientInfo,
  WaybillInfo,
  LogisticsNotes,
} from "@/types/shipping-form"
import { OrderStatus } from "@/lib/api/orders"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageProps {
  params: Promise<{ orderId: string }>
}

export default function OrderDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [localOrderDetail, setLocalOrderDetail] = useState<OrderDetail | null>(null)
  const [processing, setProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  // Fetch order detail from API
  const { data: orderDetail, isLoading, error, refetch } = useOrderDetail(resolvedParams.orderId)

  // Fetch shipping data from API
  const { data: shippersData } = useShippers()
  const { data: recipientsData } = useRecipients()
  const { data: providersData } = useLogisticsProviders()

  // Transform saved addresses for the panels
  const savedShippers = shippersData?.items?.map((addr) => ({
    id: addr._id,
    label: addr.label || addr.name,
    ...transformAddressToFrontend(addr),
  })) || []

  const savedRecipients = recipientsData?.items?.map((addr) => ({
    id: addr._id,
    label: addr.label || addr.name,
    ...transformAddressToFrontend(addr),
  })) || []

  const logisticsProviders = providersData?.providers?.map((p) => ({
    code: p.code,
    name: p.name,
    nameZh: p.name_zh,
    serviceTypes: p.service_types,
  })) || []

  // Mutations
  const updateOrder = useUpdateOrder()
  const updateProcessingStep = useUpdateProcessingStep()
  const processOrderMutation = useProcessOrder()

  // Sync API data to local state for editing
  useEffect(() => {
    if (orderDetail) {
      setLocalOrderDetail(orderDetail)
      setCurrentStep(orderDetail.processingStep || 1)

      // Initialize goods details
      setGoodsDetails({
        products: orderDetail.products.map((p) => ({
          name: p.name,
          description: p.sku ?? "",
        })),
        totalQuantity: orderDetail.products.reduce((sum, p) => sum + p.quantity, 0),
        totalDeclaredValue: orderDetail.totalAmount,
        currency: orderDetail.currency,
        grossWeight: 0,
        numberOfPackages: 1,
      })

      // Initialize waybill info
      setWaybill({
        logisticsProvider: "",
        liveHubOrderId: orderDetail.liveSimulcastId,
        marketplaceOrderId: orderDetail.orderId,
        marketplace: orderDetail.marketplaceSource,
        shippingServiceType: "standard",
      })

      // Initialize recipient from customer
      setRecipient({
        name: orderDetail.customer.name,
        contactNumber: orderDetail.customer.contactNumber,
        email: orderDetail.customer.email,
        dispatchAddress: orderDetail.customer.address,
      })
    }
  }, [orderDetail])

  // Shipping form state
  const [goodsDetails, setGoodsDetails] = useState<GoodsDetails>({
    products: [],
    totalQuantity: 0,
    totalDeclaredValue: 0,
    currency: "CNY",
    grossWeight: 0,
    numberOfPackages: 1,
  })

  const [shipper, setShipper] = useState<ShipperInfo>({
    name: "",
    contactNumber: "",
    email: "",
    dispatchAddress: "",
  })

  const [recipient, setRecipient] = useState<RecipientInfo>({
    name: "",
    contactNumber: "",
    email: "",
    dispatchAddress: "",
  })

  const [waybill, setWaybill] = useState<WaybillInfo>({
    logisticsProvider: "",
    liveHubOrderId: "",
    marketplaceOrderId: "",
    marketplace: "",
    shippingServiceType: "standard",
  })

  const [notes, setNotes] = useState<LogisticsNotes>({
    paymentMethod: "seller-pays",
    deliveryInstructions: "",
    remarksInsurance: "",
  })

  // Handle product status change
  const handleStatusChange = (productId: string, status: FulfillmentStatus) => {
    if (!localOrderDetail) return

    setLocalOrderDetail({
      ...localOrderDetail,
      products: localOrderDetail.products.map((product) =>
        product.id === productId
          ? { ...product, fulfillmentStatus: status }
          : product
      ),
    })
  }

  // Handle reset based on current step
  const handleReset = () => {
    if (!localOrderDetail) return

    if (currentStep === 1) {
      if (window.confirm("Are you sure you want to reset all product statuses?")) {
        setLocalOrderDetail({
          ...localOrderDetail,
          products: localOrderDetail.products.map((product) => ({
            ...product,
            fulfillmentStatus: null,
          })),
        })
        toast.success("Product statuses reset")
      }
    } else if (currentStep === 2) {
      if (window.confirm("Are you sure you want to reset the shipping form?")) {
        setShipper({ name: "", contactNumber: "", email: "", dispatchAddress: "" })
        setRecipient({
          name: localOrderDetail.customer.name,
          contactNumber: localOrderDetail.customer.contactNumber,
          email: localOrderDetail.customer.email,
          dispatchAddress: localOrderDetail.customer.address,
        })
        setWaybill({
          logisticsProvider: "",
          liveHubOrderId: localOrderDetail.liveSimulcastId,
          marketplaceOrderId: localOrderDetail.orderId,
          marketplace: localOrderDetail.marketplaceSource,
          shippingServiceType: "standard",
        })
        setNotes({ paymentMethod: "seller-pays", deliveryInstructions: "", remarksInsurance: "" })
        setGoodsDetails((prev) => ({ ...prev, grossWeight: 0, numberOfPackages: 1 }))
        toast.success("Shipping form reset")
      }
    }
  }

  // Handle step 1 -> step 2 (New-Pending -> Shipping Form)
  const handleStep1ToStep2 = async () => {
    if (!localOrderDetail) return

    // Check if all products have a status (show warning but allow proceeding)
    const allProductsHaveStatus = localOrderDetail.products.every(
      (product) => product.fulfillmentStatus !== null
    )

    if (!allProductsHaveStatus) {
      toast.warning("Some products don't have a fulfillment status selected")
    }

    setProcessing(true)
    try {
      // Update order processing step via API
      await updateProcessingStep.mutateAsync({
        orderId: localOrderDetail.id,
        step: 2,
        data: {
          items: localOrderDetail.products.map((p) => ({
            product_id: p.id,
            product_name: { en: p.name, ko: p.name },
            quantity: p.quantity,
            unit_price: 0,
            subtotal: 0,
            sku: p.sku,
            image_url: p.imageUrl,
            unit: p.unit,
            fulfillment_status: p.fulfillmentStatus,
          })),
        },
      })

      toast.success("Moving to shipping form...")
      setTimeout(() => {
        setCurrentStep(2)
      }, 300)
    } catch {
      toast.error("Failed to process order")
    } finally {
      setProcessing(false)
    }
  }

  // Handle step 2 -> step 3 (Shipping Form -> Ready to Ship)
  const handleStep2ToStep3 = async () => {
    if (!localOrderDetail) return

    // Validate required fields
    if (!shipper.name || !shipper.contactNumber || !shipper.dispatchAddress) {
      toast.error("Please fill in all shipper information")
      return
    }

    if (!recipient.name || !recipient.contactNumber || !recipient.dispatchAddress) {
      toast.error("Please fill in all recipient information")
      return
    }

    if (!waybill.logisticsProvider) {
      toast.error("Please select a logistics provider")
      return
    }

    if (goodsDetails.grossWeight <= 0) {
      toast.error("Please enter a valid gross weight")
      return
    }

    if (goodsDetails.numberOfPackages < 1) {
      toast.error("Please enter a valid number of packages")
      return
    }

    setProcessing(true)
    try {
      await updateProcessingStep.mutateAsync({
        orderId: localOrderDetail.id,
        step: 3,
        data: {
          items: localOrderDetail.products.map((p) => ({
            product_id: p.id,
            product_name: { en: p.name, ko: p.name },
            quantity: p.quantity,
            unit_price: 0,
            subtotal: 0,
            sku: p.sku,
            image_url: p.imageUrl,
            unit: p.unit,
            fulfillment_status: p.fulfillmentStatus,
          })),
        },
      })

      toast.success("Moving to ready to ship...")
      setTimeout(() => {
        setCurrentStep(3)
      }, 300)
    } catch {
      toast.error("Failed to process order")
    } finally {
      setProcessing(false)
    }
  }

  // Handle final order submission (step 3)
  const handleFinalSubmit = async () => {
    if (!localOrderDetail) return

    setProcessing(true)
    try {
      // Process order with full shipping details
      await processOrderMutation.mutateAsync({
        orderId: localOrderDetail.id,
        data: {
          goods_details: {
            products: goodsDetails.products,
            total_quantity: goodsDetails.totalQuantity,
            total_declared_value: goodsDetails.totalDeclaredValue,
            currency: goodsDetails.currency,
            gross_weight: goodsDetails.grossWeight,
            number_of_packages: goodsDetails.numberOfPackages,
          },
          shipper: {
            name: shipper.name,
            contact_number: shipper.contactNumber,
            email: shipper.email,
            dispatch_address: shipper.dispatchAddress,
          },
          recipient: {
            name: recipient.name,
            contact_number: recipient.contactNumber,
            email: recipient.email,
            dispatch_address: recipient.dispatchAddress,
          },
          waybill: {
            logistics_provider: waybill.logisticsProvider,
            live_hub_order_id: waybill.liveHubOrderId,
            marketplace_order_id: waybill.marketplaceOrderId,
            marketplace: waybill.marketplace,
            shipping_service_type: waybill.shippingServiceType,
          },
          notes: {
            payment_method: notes.paymentMethod,
            delivery_instructions: notes.deliveryInstructions,
            remarks_insurance: notes.remarksInsurance,
          },
        },
      })

      setTimeout(() => {
        router.push("/dashboard/orders")
      }, 1000)
    } catch {
      toast.error("Failed to process order")
    } finally {
      setProcessing(false)
    }
  }

  // Handle the process/next button based on current step
  const handleProcessOrder = () => {
    if (currentStep === 1) return handleStep1ToStep2()
    if (currentStep === 2) return handleStep2ToStep3()
    return handleFinalSubmit()
  }

  // Handle clicking a step tab to navigate back
  const handleStepClick = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f1f5f9]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#94a3b8]" />
          <p className="text-sm text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f1f5f9]">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-red-600">Failed to load order details</p>
          <div className="flex gap-2">
            <Button onClick={() => refetch()} variant="outline">
              Retry
            </Button>
            <Button onClick={() => router.push("/dashboard/orders")} variant="outline">
              Back to Orders
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Order not found
  if (!localOrderDetail) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f1f5f9]">
        <div className="flex flex-col items-center gap-4">
          <p className="text-[#94a3b8]">Order not found</p>
          <Button onClick={() => router.push("/dashboard/orders")} variant="outline">
            Back to Orders
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#f1f5f9]">
      {/* Header */}
      <OrderDetailHeader
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {currentStep === 1 ? (
          // Step 1: New-Pending - Product Status Selection
          <div className="grid grid-cols-[1fr_auto_auto] gap-6">
            {/* Left Column - Products Ordered */}
            <div className="min-w-0">
              <ProductsOrderedPanel
                products={localOrderDetail.products}
                onStatusChange={handleStatusChange}
              />
            </div>

            {/* Middle Column - Customer & Shipping */}
            <div className="w-[280px]">
              <CustomerShippingPanel customer={localOrderDetail.customer} />
            </div>

            {/* Right Column - Transaction History */}
            <div className="w-[280px]">
              <TransactionHistoryPanel order={localOrderDetail} />
            </div>
          </div>
        ) : currentStep === 2 ? (
          // Step 2: Shipping Form
          <div className="grid grid-cols-[1fr_1fr_1fr_1.2fr] gap-6">
            {/* Column 1 - Goods Details */}
            <GoodsDetailsPanel
              goods={goodsDetails}
              onGrossWeightChange={(weight) =>
                setGoodsDetails({ ...goodsDetails, grossWeight: weight })
              }
              onPackagesChange={(packages) =>
                setGoodsDetails({ ...goodsDetails, numberOfPackages: packages })
              }
            />

            {/* Column 2 - Consignor (Shipper) */}
            <ConsignorPanel
              shipper={shipper}
              savedShippers={savedShippers}
              onChange={setShipper}
            />

            {/* Column 3 - Consignee (Recipient) */}
            <ConsigneePanel
              recipient={recipient}
              savedRecipients={savedRecipients}
              onChange={setRecipient}
            />

            {/* Column 4 - E-Waybill + Payment & Notes */}
            <div className="space-y-6">
              <EWaybillPanel waybill={waybill} onChange={setWaybill} providers={logisticsProviders} />
              <PaymentLogisticsNotesPanel notes={notes} onChange={setNotes} />
            </div>
          </div>
        ) : (
          // Step 3: Ready to Ship - Summary
          <ReadyToShipPanel
            order={localOrderDetail}
            goodsDetails={goodsDetails}
            shipper={shipper}
            recipient={recipient}
            waybill={waybill}
            notes={notes}
          />
        )}
      </div>

      {/* Footer */}
      <OrderDetailFooter
        currentStep={currentStep}
        totalSteps={3}
        onReset={handleReset}
        onProcessOrder={handleProcessOrder}
        processing={processing}
        disabled={false}
      />
    </div>
  )
}
