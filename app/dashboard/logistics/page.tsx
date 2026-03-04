"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Truck, CheckCircle, AlertCircle, Eye, Download, QrCode, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/lib/locale-context";
import { Pagination } from "@/components/ui/pagination";
import {
  getShipments,
  getCarriers,
  getLogisticsStats,
  getTrackingEvents,
  generateQRCode,
  generateLabel,
  seedLogisticsDatabase,
  type Shipment,
  type Carrier,
  type LogisticsStats,
  type ShipmentStatus,
  type TrackingEvent,
  getStatusLabel,
  getStatusColor,
  ShipmentStatus as ShipmentStatusEnum
} from "@/lib/api/logistics";

export default function LogisticsPage() {
  const { locale } = useLocale();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [stats, setStats] = useState<LogisticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [carrierFilter, setCarrierFilter] = useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10);

  // Dialog states
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isQRPreviewOpen, setIsQRPreviewOpen] = useState(false);
  const [isLabelPreviewOpen, setIsLabelPreviewOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [labelUrl, setLabelUrl] = useState<string>("");

  const labels = {
    en: {
      title: "Logistics Management",
      description: "Manage shipments and delivery tracking",
      totalShipments: "Total Shipments",
      pending: "Pending",
      inTransit: "In Transit",
      delivered: "Delivered",
      failed: "Failed",
      addShipment: "Add Shipment",
      seedDatabase: "Seed Database",
      search: "Search by tracking number or order ID...",
      allStatuses: "All Statuses",
      allCarriers: "All Carriers",
      shipmentNumber: "Shipment Number",
      trackingNumber: "Tracking Number",
      carrier: "Carrier",
      status: "Status",
      destination: "Destination",
      createdAt: "Created At",
      actions: "Actions",
      viewTracking: "View Tracking",
      generateQR: "Generate QR",
      downloadLabel: "Download Label",
      edit: "Edit",
      delete: "Delete",
      noShipments: "No shipments found",
      createShipment: "Create Shipment",
      editShipment: "Edit Shipment",
      trackingHistory: "Tracking History",
      cancel: "Cancel",
      save: "Save",
      close: "Close",
      orderId: "Order ID",
      origin: "Origin",
      packageWeight: "Weight (kg)",
      estimatedDelivery: "Estimated Delivery",
      shippingCost: "Shipping Cost",
      qrCodePreview: "QR Code Preview",
      labelPreview: "Shipping Label Preview",
      download: "Download"
    },
    ko: {
      title: "물류 관리",
      description: "배송 및 추적 관리",
      totalShipments: "총 배송",
      pending: "대기중",
      inTransit: "배송중",
      delivered: "배송완료",
      failed: "실패",
      addShipment: "배송 추가",
      seedDatabase: "데이터베이스 시드",
      search: "운송장 번호 또는 주문 ID로 검색...",
      allStatuses: "모든 상태",
      allCarriers: "모든 배송업체",
      shipmentNumber: "배송 번호",
      trackingNumber: "운송장 번호",
      carrier: "배송업체",
      status: "상태",
      destination: "목적지",
      createdAt: "생성일",
      actions: "작업",
      viewTracking: "추적 보기",
      generateQR: "QR 생성",
      downloadLabel: "라벨 다운로드",
      edit: "수정",
      delete: "삭제",
      noShipments: "배송이 없습니다",
      createShipment: "배송 생성",
      editShipment: "배송 수정",
      trackingHistory: "추적 기록",
      cancel: "취소",
      save: "저장",
      close: "닫기",
      orderId: "주문 ID",
      origin: "출발지",
      packageWeight: "무게 (kg)",
      estimatedDelivery: "예상 배송일",
      shippingCost: "배송비",
      qrCodePreview: "QR 코드 미리보기",
      labelPreview: "배송 라벨 미리보기",
      download: "다운로드"
    }
  };

  const t = labels[locale as keyof typeof labels] || labels.en;

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, carrierFilter]);

  useEffect(() => {
    loadStatsAndCarriers();
  }, []);

  const loadStatsAndCarriers = async () => {
    try {
      const [carriersData, statsData] = await Promise.all([
        getCarriers({ is_active: true }),
        getLogisticsStats()
      ]);

      console.log("Loaded carriers:", carriersData);
      console.log("Loaded stats:", statsData);

      // Filter out any carriers without valid _id
      const validCarriers = carriersData.filter(carrier => {
        if (!carrier._id) {
          console.warn("Carrier missing _id:", carrier);
          return false;
        }
        return true;
      });

      setCarriers(validCarriers);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load carriers and stats:", error);
      toast.error("Failed to load logistics data");
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const shipmentsData = await getShipments({
        status: statusFilter !== "all" ? (statusFilter as ShipmentStatus) : undefined,
        carrier_id: carrierFilter !== "all" ? carrierFilter : undefined,
        page: currentPage,
        page_size: pageSize
      });

      console.log("Loaded shipments:", shipmentsData.items);

      // Filter out any shipments without valid _id
      const validShipments = shipmentsData.items.filter(shipment => {
        if (!shipment._id) {
          console.warn("Shipment missing _id:", shipment);
          return false;
        }
        return true;
      });

      setShipments(validShipments);
      setTotalPages(shipmentsData.total_pages);
      setTotalItems(shipmentsData.total);
    } catch (error) {
      console.error("Failed to load shipments:", error);
      toast.error("Failed to load shipments");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    try {
      await seedLogisticsDatabase();
      toast.success("Database seeded successfully");
      await loadStatsAndCarriers();
      setCurrentPage(1);
      loadData();
    } catch (error) {
      console.error("Failed to seed database:", error);
      toast.error("Failed to seed database");
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleCarrierFilterChange = (value: string) => {
    setCarrierFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewTracking = async (shipment: Shipment) => {
    if (!shipment._id) {
      console.error("Shipment ID is undefined:", shipment);
      toast.error("Invalid shipment data");
      return;
    }

    try {
      const events = await getTrackingEvents(shipment._id);
      setTrackingEvents(events.items);
      setSelectedShipment(shipment);
      setIsTrackingOpen(true);
    } catch (error) {
      console.error("Failed to load tracking events:", error);
      toast.error("Failed to load tracking history");
    }
  };

  const handleGenerateQR = async (shipment: Shipment) => {
    if (!shipment._id) {
      console.error("Shipment ID is undefined:", shipment);
      toast.error("Invalid shipment data");
      return;
    }

    try {
      const result = await generateQRCode({ shipment_id: shipment._id });
      setQrCodeUrl(result.qr_code_url);
      setSelectedShipment(shipment);
      setIsQRPreviewOpen(true);
      toast.success("QR code generated successfully");
      loadData();
    } catch (error) {
      console.error("Failed to generate QR code:", error);
      toast.error("Failed to generate QR code");
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl || !selectedShipment) return;

    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `qr-${selectedShipment.shipment_number}.png`;
    link.click();
    toast.success("QR code downloaded");
  };

  const handleGenerateLabel = async (shipment: Shipment) => {
    if (!shipment._id) {
      console.error("Shipment ID is undefined:", shipment);
      toast.error("Invalid shipment data");
      return;
    }

    try {
      const result = await generateLabel({ shipment_id: shipment._id });
      setLabelUrl(result.label_url);
      setSelectedShipment(shipment);
      setIsLabelPreviewOpen(true);
      toast.success("Shipping label generated successfully");
      loadData();
    } catch (error) {
      console.error("Failed to generate label:", error);
      toast.error("Failed to generate shipping label");
    }
  };

  const handleDownloadLabel = () => {
    if (!labelUrl || !selectedShipment) return;

    const link = document.createElement("a");
    link.href = labelUrl;
    link.download = `label-${selectedShipment.shipment_number}.pdf`;
    link.click();
    toast.success("Label downloaded");
  };

  // Client-side search filtering (filters are applied on backend for status and carrier)
  const displayedShipments = shipments.filter((shipment) => {
    if (searchTerm === "") return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      shipment.shipment_number.toLowerCase().includes(searchLower) ||
      shipment.tracking_number?.toLowerCase().includes(searchLower) ||
      shipment.order_id.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: t.title },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
            <p className="text-muted-foreground">{t.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSeedDatabase}>
              {t.seedDatabase}
            </Button>
          </div>
        </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalShipments}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_shipments || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.pending}</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats?.pending_shipments || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.inTransit}</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.in_transit_shipments || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.delivered}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.delivered_shipments || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Shipments</CardTitle>
          <CardDescription>Manage and track all shipments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t.search}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t.allStatuses} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allStatuses}</SelectItem>
                <SelectItem value={ShipmentStatusEnum.PENDING}>{getStatusLabel(ShipmentStatusEnum.PENDING, locale as "en" | "ko")}</SelectItem>
                <SelectItem value={ShipmentStatusEnum.PICKED_UP}>{getStatusLabel(ShipmentStatusEnum.PICKED_UP, locale as "en" | "ko")}</SelectItem>
                <SelectItem value={ShipmentStatusEnum.IN_TRANSIT}>{getStatusLabel(ShipmentStatusEnum.IN_TRANSIT, locale as "en" | "ko")}</SelectItem>
                <SelectItem value={ShipmentStatusEnum.OUT_FOR_DELIVERY}>{getStatusLabel(ShipmentStatusEnum.OUT_FOR_DELIVERY, locale as "en" | "ko")}</SelectItem>
                <SelectItem value={ShipmentStatusEnum.DELIVERED}>{getStatusLabel(ShipmentStatusEnum.DELIVERED, locale as "en" | "ko")}</SelectItem>
                <SelectItem value={ShipmentStatusEnum.FAILED}>{getStatusLabel(ShipmentStatusEnum.FAILED, locale as "en" | "ko")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={carrierFilter} onValueChange={handleCarrierFilterChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t.allCarriers} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allCarriers}</SelectItem>
                {carriers.filter(c => c._id).map((carrier) => (
                  <SelectItem key={carrier._id} value={carrier._id}>
                    {carrier.name[locale as keyof typeof carrier.name] || carrier.name.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Shipments Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.shipmentNumber}</TableHead>
                  <TableHead>{t.trackingNumber}</TableHead>
                  <TableHead>{t.carrier}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.destination}</TableHead>
                  <TableHead>{t.createdAt}</TableHead>
                  <TableHead className="text-right">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedShipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      {t.noShipments}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedShipments.map((shipment) => (
                    <TableRow key={shipment._id || shipment.shipment_number}>
                      <TableCell className="font-medium">{shipment.shipment_number}</TableCell>
                      <TableCell>{shipment.tracking_number || "-"}</TableCell>
                      <TableCell>
                        {shipment.carrier_name?.[locale as keyof typeof shipment.carrier_name] ||
                         shipment.carrier_name?.en || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(shipment.status)}>
                          {getStatusLabel(shipment.status, locale as "en" | "ko")}
                        </Badge>
                      </TableCell>
                      <TableCell>{shipment.destination.city}, {shipment.destination.country}</TableCell>
                      <TableCell>{new Date(shipment.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewTracking(shipment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerateQR(shipment)}
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerateLabel(shipment)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={totalItems}
                itemsPerPage={pageSize}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tracking History Dialog */}
      <Dialog open={isTrackingOpen} onOpenChange={setIsTrackingOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.trackingHistory}</DialogTitle>
            <DialogDescription>
              {selectedShipment && `${t.shipmentNumber}: ${selectedShipment.shipment_number}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {trackingEvents.map((event, index) => (
              <div key={event._id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`h-3 w-3 rounded-full ${index === 0 ? "bg-blue-500" : "bg-gray-300"}`} />
                  {index < trackingEvents.length - 1 && (
                    <div className="h-full w-px bg-gray-300" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(event.status)}>
                      {getStatusLabel(event.status, locale as "en" | "ko")}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(event.event_time).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">
                    {event.description[locale as keyof typeof event.description] || event.description.en}
                  </p>
                  {event.location && (
                    <p className="mt-1 text-sm text-muted-foreground">{event.location}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTrackingOpen(false)}>
              {t.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Preview Dialog */}
      <Dialog open={isQRPreviewOpen} onOpenChange={setIsQRPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.qrCodePreview}</DialogTitle>
            <DialogDescription>
              {selectedShipment && `${t.shipmentNumber}: ${selectedShipment.shipment_number}`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
            {qrCodeUrl && (
              <Image
                src={qrCodeUrl}
                alt="QR Code"
                width={256}
                height={256}
                className="object-contain"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQRPreviewOpen(false)}>
              {t.close}
            </Button>
            <Button onClick={handleDownloadQR}>
              <Download className="h-4 w-4 mr-2" />
              {t.download}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Label Preview Dialog */}
      <Dialog open={isLabelPreviewOpen} onOpenChange={setIsLabelPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{t.labelPreview}</DialogTitle>
            <DialogDescription>
              {selectedShipment && `${t.shipmentNumber}: ${selectedShipment.shipment_number}`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center bg-gray-50 rounded-lg overflow-auto max-h-[60vh]">
            {labelUrl && (
              <iframe
                src={labelUrl}
                className="w-full h-[60vh] border-0"
                title="Shipping Label Preview"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLabelPreviewOpen(false)}>
              {t.close}
            </Button>
            <Button onClick={handleDownloadLabel}>
              <Download className="h-4 w-4 mr-2" />
              {t.download}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
