import { useState, useMemo } from "react"
import { OrderProductDetail, FulfillmentStatus } from "@/types/order-detail"
import { ProductOrderRow } from "./product-order-row"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProductsOrderedPanelProps {
  products: OrderProductDetail[]
  onStatusChange: (productId: string, status: FulfillmentStatus) => void
}

export function ProductsOrderedPanel({
  products,
  onStatusChange,
}: ProductsOrderedPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Filter products based on search and filter
  const filteredProducts = useMemo(() => {
    let filtered = products

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((product) => product.fulfillmentStatus === filterStatus)
    }

    return filtered
  }, [products, searchQuery, filterStatus])

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-base font-semibold text-[#27272a]">Products Ordered</h2>
      </div>

      {/* Search and Filter Bar */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
          <Input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-white border-slate-200 text-sm"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-slate-200 text-sm font-normal"
            >
              Filter Orders
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => setFilterStatus("all")}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("pick")}>
              Pick
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("pack")}>
              Pack
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("ship")}>
              Ship
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-[#f8fafc]">
              <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase w-12">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase">
                SKU
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase">
                Image
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase">
                Product Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase">
                Qty. Bought
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase">
                Pick | Pack | Ship
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#94a3b8]">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product, index) => (
                <ProductOrderRow
                  key={product.id}
                  product={product}
                  index={index + 1}
                  onStatusChange={onStatusChange}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
