"use client"

import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useLocale } from "@/lib/locale-context"

interface OrderDetailHeaderProps {
  currentStep: number
  onStepClick?: (step: number) => void
}

const STEP_KEYS = [
  "orders.detail.steps.newPending",
  "orders.detail.steps.shippingForm",
  "orders.detail.steps.readyToShip",
] as const

export function OrderDetailHeader({ currentStep, onStepClick }: OrderDetailHeaderProps) {
  const router = useRouter()
  const { t } = useLocale()

  return (
    <div className="flex h-[72px] items-center justify-between px-6 backdrop-blur-md backdrop-filter bg-[rgba(248,250,252,0.72)] border-b border-slate-200">
      {/* Left: Back button and Breadcrumb */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/orders")}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => router.push("/dashboard/orders")}
            className="text-[#94a3b8] hover:text-[#27272a] transition-colors"
          >
            {t("orders.detail.breadcrumb.orderManagement")}
          </button>
          <span className="text-[#cbd5e1]">/</span>
          <span className="text-[#27272a] font-medium">
            {t("orders.detail.breadcrumb.orderProcessing")}
          </span>
        </div>
      </div>

      {/* Right: Step Tabs */}
      <div className="flex items-center">
        {STEP_KEYS.map((key, index) => {
          const stepNumber = index + 1
          const isActive = currentStep === stepNumber
          const isCompleted = currentStep > stepNumber
          const isClickable = isCompleted || isActive

          return (
            <div key={key} className="flex items-center">
              {/* Separator */}
              {index > 0 && (
                <span className="text-[#cbd5e1] text-sm mx-3 select-none">&gt;</span>
              )}

              {/* Step Tab */}
              <button
                onClick={() => isClickable && onStepClick?.(stepNumber)}
                disabled={!isClickable}
                className={`h-9 px-4 py-0 rounded-[6px] text-sm font-normal transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? "border border-[#27272a] bg-white text-[#27272a]"
                    : isCompleted
                      ? "border border-slate-200 bg-white text-[#27272a] hover:border-slate-300 cursor-pointer"
                      : "border border-slate-200 bg-white text-[#94a3b8] cursor-default"
                }`}
              >
                <span className={isActive ? "font-semibold" : ""}>{stepNumber}</span>
                <span>{t(key)}</span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
