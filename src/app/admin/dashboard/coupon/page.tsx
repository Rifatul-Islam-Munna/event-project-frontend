"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Trash2,
  Pencil,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Percent,
  TicketPercent,
  Clock,
  Tag,
  ShieldOff,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ✅ 4 direct functions — same pattern as getAllUser, deleteUSer etc.
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "@/actions/vendor-category-actions";

// ─── Types ──────────────────────────────────────────────────────────────────
enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FLAT = "FLAT",
}

interface Coupon {
  _id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount: number | null;
  minOrderAmount: number;
  expiresAt: string;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

interface FormState {
  code: string;
  discountType: string;
  discountValue: string;
  maxDiscount: string;
  minOrderAmount: string;
  expiresAt: Date | undefined;
  usageLimit: string;
  isActive: boolean;
}

const defaultForm: FormState = {
  code: "",
  discountType: "",
  discountValue: "",
  maxDiscount: "",
  minOrderAmount: "",
  expiresAt: undefined,
  usageLimit: "",
  isActive: true,
};

// ─── Pagination ──────────────────────────────────────────────────────────────
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  isLoading: boolean;
}) {
  const getPageNumbers = () => {
    const pages: number[] = [];
    const showPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);
    if (endPage - startPage + 1 < showPages)
      startPage = Math.max(1, endPage - showPages + 1);
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50/50">
      <div className="text-sm font-medium text-slate-600">
        Page <span className="text-slate-900">{currentPage}</span> of{" "}
        <span className="text-slate-900">{totalPages}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          className="h-9 w-9 p-0 border-slate-300 hover:bg-slate-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getPageNumbers().map((p) => (
          <Button
            key={p}
            variant={currentPage === p ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(p)}
            disabled={isLoading}
            className={cn(
              "h-9 w-9 p-0",
              currentPage === p
                ? "bg-lime-600 hover:bg-lime-700 text-white border-lime-600"
                : "border-slate-300 hover:bg-slate-100",
            )}
          >
            {p}
          </Button>
        ))}

        {totalPages > 5 && currentPage < totalPages - 2 && (
          <>
            <MoreHorizontal className="h-4 w-4 text-slate-400 mx-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={isLoading}
              className="h-9 w-9 p-0 border-slate-300 hover:bg-slate-100"
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          className="h-9 w-9 p-0 border-slate-300 hover:bg-slate-100"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CouponManagement() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);

  // ── 1. GET — direct fn, same as getAllUser(currentPage, 10) ───────────────
  const {
    data: couponsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["coupons", currentPage],
    queryFn: () => getAllCoupons(currentPage, 10),
    staleTime: 5 * 60 * 1000,
  });

  const coupons: Coupon[] = couponsData?.data?.data ?? [];
  const totalPages: number = couponsData?.data?.meta?.totalPages ?? 1;
  const total: number = couponsData?.data?.meta?.total ?? 0;
  const activeCount = coupons.filter((c) => c.isActive).length;
  const expiredCount = coupons.filter(
    (c) => new Date(c.expiresAt) < new Date(),
  ).length;

  // ── 2. CREATE — direct fn ─────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => createCoupon(payload),
    onSuccess: (data) => {
      if (data?.data) {
        toast.success("Coupon created successfully!");
        queryClient.invalidateQueries({ queryKey: ["coupons"] });
        closeModal();
        return;
      }
      toast.error(data?.message || "Failed to create coupon");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create coupon");
    },
  });

  // ── 3. UPDATE — direct fn ─────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (payload: any) => updateCoupon(payload),
    onSuccess: (data) => {
      if (data?.data) {
        toast.success("Coupon updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["coupons"] });
        closeModal();
        return;
      }
      toast.error(data?.message || "Failed to update coupon");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update coupon");
    },
  });

  // ── 4. DELETE — direct fn, same as deleteUSer(userId) ────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCoupon(id),
    onSuccess: (data) => {
      if (data?.data) {
        toast.success("Coupon deleted successfully!");
        queryClient.invalidateQueries({ queryKey: ["coupons"] });
        return;
      }
      toast.error("Failed to delete coupon");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete coupon");
    },
  });

  // ── Helpers ──────────────────────────────────────────────────────────────
  const setField = (key: keyof FormState, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setEditingCoupon(null);
    setForm(defaultForm);
    setIsModalOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      maxDiscount: coupon.maxDiscount != null ? String(coupon.maxDiscount) : "",
      minOrderAmount: String(coupon.minOrderAmount ?? 0),
      expiresAt: new Date(coupon.expiresAt),
      usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : "",
      isActive: coupon.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
    setForm(defaultForm);
  };

  const handleSubmit = () => {
    if (
      !form.code ||
      !form.discountType ||
      !form.discountValue ||
      !form.expiresAt
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      code: form.code.toUpperCase().trim(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      ...(form.maxDiscount && { maxDiscount: Number(form.maxDiscount) }),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
      expiresAt: form.expiresAt.toISOString(),
      ...(form.usageLimit && { usageLimit: Number(form.usageLimit) }),
      isActive: form.isActive,
    };

    if (editingCoupon) {
      const payloads = {
        id: editingCoupon._id,
        ...payload,
      };
      // passes id + payload — updateCoupon destructures id out
      updateMutation.mutate(payloads);
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (coupon: Coupon) => {
    if (!confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`))
      return;
    deleteMutation.mutate(coupon._id);
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-lime-500 to-lime-600 shadow-lg shadow-lime-500/30">
                <TicketPercent className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Coupon Management
                </h1>
                <p className="text-sm text-slate-600">
                  Create and manage discount coupons
                </p>
              </div>
            </div>
            <Button
              onClick={openCreate}
              className="bg-lime-600 hover:bg-lime-700 text-white shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Coupon
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Total Coupons",
              value: total,
              icon: Tag,
              color: "bg-blue-100 text-blue-600",
            },
            {
              label: "Active",
              value: activeCount,
              icon: TicketPercent,
              color: "bg-lime-100 text-lime-600",
            },
            {
              label: "Expired",
              value: expiredCount,
              icon: Clock,
              color: "bg-red-100 text-red-600",
            },
            {
              label: "Inactive",
              value: coupons.filter((c) => !c.isActive).length,
              icon: ShieldOff,
              color: "bg-slate-100 text-slate-600",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card
              key={label}
              className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      {label}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      {value}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "h-14 w-14 rounded-full flex items-center justify-center",
                      color,
                    )}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table Card */}
        <Card className="border-slate-200 bg-white shadow-md">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  All Coupons
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Showing {coupons.length} of {total} coupons
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lime-50 border border-lime-200">
                <div className="h-2 w-2 rounded-full bg-lime-500 animate-pulse" />
                <span className="text-sm font-medium text-lime-700">
                  Live Data
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading && (
              <div className="flex flex-col items-center justify-center p-12">
                <div className="w-12 h-12 border-[3px] border-lime-200 border-t-lime-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-600 font-medium">Loading coupons...</p>
              </div>
            )}

            {isError && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Tag className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-red-600 font-semibold text-lg mb-2">
                  Error loading coupons
                </p>
                <p className="text-slate-500 text-sm">
                  {(error as Error)?.message}
                </p>
              </div>
            )}

            {!isLoading && !isError && (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-slate-200">
                        {[
                          "Code",
                          "Type",
                          "Discount",
                          "Min Order",
                          "Expiry",

                          "Status",
                          "Actions",
                        ].map((h) => (
                          <TableHead
                            key={h}
                            className="font-semibold text-slate-700 h-12"
                          >
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coupons.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center py-16 text-slate-500"
                          >
                            <TicketPercent className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                            No coupons yet. Create your first coupon!
                          </TableCell>
                        </TableRow>
                      ) : (
                        coupons.map((coupon, index) => (
                          <TableRow
                            key={coupon._id}
                            className={cn(
                              "hover:bg-slate-50 transition-colors border-b border-slate-100",
                              index === coupons.length - 1 && "border-b-0",
                            )}
                          >
                            <TableCell className="py-4">
                              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded text-sm tracking-wider">
                                {coupon.code}
                              </span>
                            </TableCell>

                            <TableCell className="py-4">
                              <Badge
                                className={cn(
                                  "text-xs font-medium border",
                                  coupon.discountType ===
                                    DiscountType.PERCENTAGE
                                    ? "bg-blue-100 text-blue-700 border-blue-200"
                                    : "bg-orange-100 text-orange-700 border-orange-200",
                                )}
                              >
                                {coupon.discountType ===
                                DiscountType.PERCENTAGE ? (
                                  <Percent className="h-3 w-3 mr-1 inline" />
                                ) : (
                                  <Tag className="h-3 w-3 mr-1 inline" />
                                )}
                                {coupon.discountType}
                              </Badge>
                            </TableCell>

                            <TableCell className="py-4 font-semibold text-slate-900">
                              {coupon.discountType === DiscountType.PERCENTAGE
                                ? `${coupon.discountValue}%${coupon.maxDiscount ? ` (max €${coupon.maxDiscount})` : ""}`
                                : `€${coupon.discountValue} off`}
                            </TableCell>

                            <TableCell className="py-4 text-slate-600">
                              {coupon.minOrderAmount > 0
                                ? `€${coupon.minOrderAmount}`
                                : "—"}
                            </TableCell>

                            <TableCell className="py-4">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                                <span
                                  className={cn(
                                    "text-sm",
                                    isExpired(coupon.expiresAt)
                                      ? "text-red-500 font-medium line-through"
                                      : "text-slate-600",
                                  )}
                                >
                                  {format(
                                    new Date(coupon.expiresAt),
                                    "dd MMM yyyy",
                                  )}
                                </span>
                                {isExpired(coupon.expiresAt) && (
                                  <Badge className="bg-red-100 text-red-600 border-red-200 text-xs shrink-0">
                                    Expired
                                  </Badge>
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="py-4">
                              <Badge
                                className={cn(
                                  "border",
                                  coupon.isActive
                                    ? "bg-lime-100 text-lime-700 border-lime-200"
                                    : "bg-slate-100 text-slate-500 border-slate-200",
                                )}
                              >
                                {coupon.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>

                            <TableCell className="py-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => openEdit(coupon)}
                                  size="sm"
                                  variant="outline"
                                  className="h-9 w-9 p-0 border-slate-300 hover:bg-slate-100"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDelete(coupon)}
                                  variant="destructive"
                                  size="sm"
                                  className="bg-red-500 hover:bg-red-600 h-9 w-9 p-0"
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  isLoading={isLoading}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent className="sm:max-w-[580px] border-slate-200 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-lime-100 flex items-center justify-center">
                <TicketPercent className="h-5 w-5 text-lime-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-slate-900">
                  {editingCoupon ? "Edit Coupon" : "Create Coupon"}
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  {editingCoupon
                    ? `Editing: ${editingCoupon.code}`
                    : "Fill in the details for your new coupon"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">
                  Coupon Code *
                </Label>
                <Input
                  value={form.code}
                  onChange={(e) =>
                    setField("code", e.target.value.toUpperCase())
                  }
                  placeholder="e.g. SAVE20"
                  className="h-11 font-mono uppercase border-slate-300 focus-visible:ring-lime-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">
                  Discount Type *
                </Label>
                <Select
                  value={form.discountType}
                  onValueChange={(v) => {
                    setField("discountType", v);
                    if (v === DiscountType.FLAT) setField("maxDiscount", "");
                  }}
                >
                  <SelectTrigger className="h-11 border-slate-300">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DiscountType.PERCENTAGE}>
                      Percentage (%)
                    </SelectItem>
                    <SelectItem value={DiscountType.FLAT}>
                      Flat Amount ($)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">
                  Discount Value *{" "}
                  <span className="text-slate-500 font-normal">
                    {form.discountType === DiscountType.PERCENTAGE
                      ? "(0–100%)"
                      : "(€)"}
                  </span>
                </Label>
                <Input
                  type="number"
                  value={form.discountValue}
                  onChange={(e) => setField("discountValue", e.target.value)}
                  placeholder={
                    form.discountType === DiscountType.PERCENTAGE ? "20" : "50"
                  }
                  min={0}
                  max={
                    form.discountType === DiscountType.PERCENTAGE
                      ? 100
                      : undefined
                  }
                  className="h-11 border-slate-300 focus-visible:ring-lime-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">
                  Max Discount Cap{" "}
                  <span className="text-slate-500 font-normal">
                    {form.discountType === DiscountType.PERCENTAGE
                      ? "($)"
                      : "(n/a for flat)"}
                  </span>
                </Label>
                <Input
                  type="number"
                  value={form.maxDiscount}
                  onChange={(e) => setField("maxDiscount", e.target.value)}
                  placeholder="e.g. 500"
                  min={0}
                  disabled={form.discountType === DiscountType.FLAT}
                  className="h-11 border-slate-300 focus-visible:ring-lime-500 disabled:opacity-40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">
                  Min Order Amount{" "}
                  <span className="text-slate-500 font-normal">(optional)</span>
                </Label>
                <Input
                  type="number"
                  value={form.minOrderAmount}
                  onChange={(e) => setField("minOrderAmount", e.target.value)}
                  placeholder="0 = no minimum"
                  min={0}
                  className="h-11 border-slate-300 focus-visible:ring-lime-500"
                />
              </div>
              {/*    <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">
                  Usage Limit{" "}
                  <span className="text-slate-500 font-normal">
                    (blank = unlimited)
                  </span>
                </Label>
                <Input
                  type="number"
                  value={form.usageLimit}
                  onChange={(e) => setField("usageLimit", e.target.value)}
                  placeholder="e.g. 100"
                  min={1}
                  className="h-11 border-slate-300 focus-visible:ring-lime-500"
                />
              </div> */}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900">
                Expiry Date *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-11 justify-start text-left font-normal border-slate-300 hover:bg-slate-50",
                      !form.expiresAt && "text-slate-500",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.expiresAt
                      ? format(form.expiresAt, "PPP")
                      : "Pick an expiry date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.expiresAt}
                    onSelect={(d) => setField("expiresAt", d)}
                    disabled={(d) => d < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Active Status
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inactive coupons cannot be applied at checkout
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setField("isActive", v)}
                className="data-[state=checked]:bg-lime-600"
              />
            </div>
          </div>

          <DialogFooter className="gap-3 border-t border-slate-100 pt-4">
            <Button
              variant="outline"
              onClick={closeModal}
              className="border-slate-300 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isSaving ||
                !form.code ||
                !form.discountType ||
                !form.discountValue ||
                !form.expiresAt
              }
              className="bg-lime-600 hover:bg-lime-700 text-white min-w-[140px]"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {editingCoupon ? "Updating..." : "Creating..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {editingCoupon ? (
                    <>
                      <Pencil className="h-4 w-4" /> Update Coupon
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> Create Coupon
                    </>
                  )}
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
