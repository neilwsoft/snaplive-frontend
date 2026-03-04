import { Button } from "@/components/ui/button"
import { RotateCcw, ArrowRight, Check } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

interface OrderDetailFooterProps {
  currentStep: number
  totalSteps: number
  onReset: () => void
  onProcessOrder: () => void
  processing?: boolean
  disabled?: boolean
}

export function OrderDetailFooter({
  currentStep,
  totalSteps,
  onReset,
  onProcessOrder,
  processing = false,
  disabled = false,
}: OrderDetailFooterProps) {
  const { t } = useLocale()

  const getButtonLabel = () => {
    if (processing) return t("orders.detail.footer.processing")
    if (currentStep === 1) return t("orders.detail.footer.processToShipping")
    if (currentStep === 2) return t("orders.detail.footer.processToReady")
    return t("orders.detail.footer.submitOrder")
  }

  const isFinalStep = currentStep === totalSteps

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-200">
      {/* Reset Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        disabled={processing}
        className="h-10 px-4 border-slate-200 text-sm font-normal"
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        {t("orders.detail.footer.reset")}
      </Button>

      {/* Process Order Button */}
      <Button
        size="sm"
        onClick={onProcessOrder}
        disabled={disabled || processing}
        className="h-10 px-6 bg-[#27272a] text-white hover:bg-[#3f3f46] text-sm font-normal"
      >
        {isFinalStep ? (
          <Check className="mr-2 h-4 w-4" />
        ) : (
          <ArrowRight className="mr-2 h-4 w-4" />
        )}
        {getButtonLabel()}
      </Button>
    </div>
  )
}
