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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Pencil,
  MessageSquare,
  Mail,
  Phone,
  CreditCard,
  Package,
  Euro,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  getAllAddOns,
  createAddOn,
  updateAddOn,
  deleteAddOn,
} from "@/actions/vendor-category-actions";

// ─── Types ───────────────────────────────────────────────────────────────────
enum AddOnType {
  message = "message",
  whatsapp = "whatsapp",
  email = "email",
  flushCard = "flushCard",
}

interface AddOn {
  _id: string;
  type: AddOnType;
  numberMessage: number;
  message: string;
  flushCardCoupon: string;
  price: number; // ← NEW
  createdAt: string;
}

interface FormState {
  type: string;
  numberMessage: string;
  message: string;
  flushCardCoupon: string;
  price: string; // ← NEW
}

const defaultForm: FormState = {
  type: "",
  numberMessage: "",
  message: "",
  flushCardCoupon: "",
  price: "", // ← NEW
};

// ─── Type Config ──────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  AddOnType,
  { label: string; icon: React.ElementType; badge: string; iconBg: string }
> = {
  [AddOnType.message]: {
    label: "Message",
    icon: MessageSquare,
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    iconBg: "bg-blue-100 text-blue-600",
  },
  [AddOnType.whatsapp]: {
    label: "WhatsApp",
    icon: Phone,
    badge: "bg-green-100 text-green-700 border-green-200",
    iconBg: "bg-green-100 text-green-600",
  },
  [AddOnType.email]: {
    label: "Email",
    icon: Mail,
    badge: "bg-purple-100 text-purple-700 border-purple-200",
    iconBg: "bg-purple-100 text-purple-600",
  },
  [AddOnType.flushCard]: {
    label: "Flush Card",
    icon: CreditCard,
    badge: "bg-orange-100 text-orange-700 border-orange-200",
    iconBg: "bg-orange-100 text-orange-600",
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AddOnManagement() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState<AddOn | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);

  const {
    data: addOnsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["add-ons"],
    queryFn: () => getAllAddOns(),
    staleTime: 5 * 60 * 1000,
  });

  const addOns: AddOn[] = addOnsData?.data ?? [];

  // ── CREATE ────────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => createAddOn(payload),
    onSuccess: (data) => {
      if (data?.data) {
        toast.success("Add-on created successfully!");
        queryClient.invalidateQueries({ queryKey: ["add-ons"] });
        closeModal();
        return;
      }
      toast.error(data?.error?.message || "Failed to create add-on");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to create add-on"),
  });

  // ── UPDATE ────────────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (payload: any) => updateAddOn(payload),
    onSuccess: (data) => {
      if (data?.data) {
        toast.success("Add-on updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["add-ons"] });
        closeModal();
        return;
      }
      toast.error(data?.error?.message || "Failed to update add-on");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update add-on"),
  });

  // ── DELETE ────────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAddOn(id),
    onSuccess: (data) => {
      if (data?.data) {
        toast.success("Add-on deleted successfully!");
        queryClient.invalidateQueries({ queryKey: ["add-ons"] });
        return;
      }
      toast.error("Failed to delete add-on");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to delete add-on"),
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const setField = (key: keyof FormState, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setEditingAddOn(null);
    setForm(defaultForm);
    setIsModalOpen(true);
  };

  const openEdit = (addOn: AddOn) => {
    setEditingAddOn(addOn);
    setForm({
      type: addOn.type,
      numberMessage:
        addOn.numberMessage != null ? String(addOn.numberMessage) : "",
      message: addOn.message ?? "",
      flushCardCoupon: addOn.flushCardCoupon ?? "",
      price: addOn.price != null ? String(addOn.price) : "", // ← NEW
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAddOn(null);
    setForm(defaultForm);
  };

  const isFlushCard = form.type === AddOnType.flushCard;
  const isMessageType = form.type && form.type !== AddOnType.flushCard;

  const handleSubmit = () => {
    if (!form.type) {
      toast.error("Please select an add-on type");
      return;
    }
    // price is required for ALL types
    if (!form.price || Number(form.price) < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const payload: Record<string, unknown> = {
      type: form.type,
      price: Number(form.price), // ← always included
      ...(form.message.trim() && { message: form.message.trim() }), // optional for all
    };

    if (isFlushCard) {
      if (!form.flushCardCoupon.trim()) {
        toast.error("Please enter a flush card coupon code");
        return;
      }
      payload.flushCardCoupon = form.flushCardCoupon.toUpperCase().trim();
    } else {
      if (!form.numberMessage) {
        toast.error("Please enter the number of messages");
        return;
      }
      payload.numberMessage = Number(form.numberMessage);
    }

    if (editingAddOn) {
      updateMutation.mutate({ id: editingAddOn._id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (addOn: AddOn) => {
    if (
      !confirm(
        `Delete "${TYPE_CONFIG[addOn.type]?.label}" add-on? This cannot be undone.`,
      )
    )
      return;
    deleteMutation.mutate(addOn._id);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const stats = [
    {
      label: "Message",
      type: AddOnType.message,
      icon: MessageSquare,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "WhatsApp",
      type: AddOnType.whatsapp,
      icon: Phone,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Email",
      type: AddOnType.email,
      icon: Mail,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Flush Card",
      type: AddOnType.flushCard,
      icon: CreditCard,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      {/* ── Header ── */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-lime-500 to-lime-600 shadow-lg shadow-lime-500/30">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Add-On Management
                </h1>
                <p className="text-sm text-slate-600">
                  Manage message, WhatsApp, email & flush card add-ons
                </p>
              </div>
            </div>
            <Button
              onClick={openCreate}
              className="bg-lime-600 hover:bg-lime-700 text-white shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" /> New Add-On
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* ── Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map(({ label, type, icon: Icon, color }) => (
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
                      {addOns.filter((a) => a.type === type).length}
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

        {/* ── Table Card ── */}
        <Card className="border-slate-200 bg-white shadow-md">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  All Add-Ons
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  {addOns.length} add-on{addOns.length !== 1 ? "s" : ""}{" "}
                  configured
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
                <p className="text-slate-600 font-medium">Loading add-ons...</p>
              </div>
            )}

            {isError && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-red-600 font-semibold text-lg mb-2">
                  Error loading add-ons
                </p>
                <p className="text-slate-500 text-sm">
                  {(error as Error)?.message}
                </p>
              </div>
            )}

            {!isLoading && !isError && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-slate-200">
                      {[
                        "Type",
                        "Price", // ← NEW
                        "No. of Messages",
                        "Message Content",
                        "Flush Card Coupon",
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
                    {addOns.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-16 text-slate-500"
                        >
                          <Package className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                          No add-ons yet. Create your first one!
                        </TableCell>
                      </TableRow>
                    ) : (
                      addOns.map((addOn, index) => {
                        const config = TYPE_CONFIG[addOn.type];
                        const Icon = config?.icon ?? Package;
                        return (
                          <TableRow
                            key={addOn._id}
                            className={cn(
                              "hover:bg-slate-50 transition-colors border-b border-slate-100",
                              index === addOns.length - 1 && "border-b-0",
                            )}
                          >
                            {/* Type */}
                            <TableCell className="py-4">
                              <Badge
                                className={cn(
                                  "text-xs font-medium border",
                                  config?.badge,
                                )}
                              >
                                <Icon className="h-3 w-3 mr-1 inline" />
                                {config?.label ?? addOn.type}
                              </Badge>
                            </TableCell>

                            {/* Price ← NEW */}
                            <TableCell className="py-4">
                              <span className="inline-flex items-center gap-1 font-bold text-slate-900 bg-lime-50 border border-lime-200 px-2.5 py-1 rounded-lg text-sm">
                                <Euro className="h-3.5 w-3.5 text-lime-600" />
                                {addOn.price != null
                                  ? addOn.price.toFixed(2)
                                  : "—"}
                              </span>
                            </TableCell>

                            {/* Number of Messages */}
                            <TableCell className="py-4 font-semibold text-slate-900">
                              {addOn.numberMessage != null
                                ? addOn.numberMessage
                                : "—"}
                            </TableCell>

                            {/* Message */}
                            <TableCell className="py-4 text-slate-600 max-w-[200px]">
                              {addOn.message ? (
                                <span
                                  className="truncate block"
                                  title={addOn.message}
                                >
                                  {addOn.message}
                                </span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </TableCell>

                            {/* Flush Card Coupon */}
                            <TableCell className="py-4">
                              {addOn.flushCardCoupon ? (
                                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded text-sm tracking-wider">
                                  {addOn.flushCardCoupon}
                                </span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="py-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => openEdit(addOn)}
                                  size="sm"
                                  variant="outline"
                                  className="h-9 w-9 p-0 border-slate-300 hover:bg-slate-100"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDelete(addOn)}
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
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Modal ── */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent className="sm:max-w-[500px] border-slate-200 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-lime-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-lime-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-slate-900">
                  {editingAddOn ? "Edit Add-On" : "Create Add-On"}
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  {editingAddOn
                    ? `Editing: ${TYPE_CONFIG[editingAddOn.type]?.label}`
                    : "Fill in the details for your new add-on"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Type Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900">
                Add-On Type *
              </Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...defaultForm, type: v })}
              >
                <SelectTrigger className="h-11 border-slate-300">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AddOnType.message}>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-500" />{" "}
                      Message
                    </div>
                  </SelectItem>
                  <SelectItem value={AddOnType.whatsapp}>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-500" /> WhatsApp
                    </div>
                  </SelectItem>
                  <SelectItem value={AddOnType.email}>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-purple-500" /> Email
                    </div>
                  </SelectItem>
                  <SelectItem value={AddOnType.flushCard}>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-orange-500" /> Flush
                      Card
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ── Price — shown for ALL types ── */}
            {form.type && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">
                  Price *{" "}
                  <span className="text-slate-400 font-normal">(€)</span>
                </Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) => setField("price", e.target.value)}
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                    className="h-11 pl-9 border-slate-300 focus-visible:ring-lime-500"
                  />
                </div>
              </div>
            )}

            {/* ── Flush Card fields ── */}
            {isFlushCard && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-900">
                    Flush Card Coupon *
                  </Label>
                  <Input
                    value={form.flushCardCoupon}
                    onChange={(e) =>
                      setField("flushCardCoupon", e.target.value.toUpperCase())
                    }
                    placeholder="e.g. FLUSH2025"
                    className="h-11 font-mono uppercase border-slate-300 focus-visible:ring-lime-500"
                  />
                </div>

                {/* message optional for flushCard too */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-900">
                    Message{" "}
                    <span className="text-slate-400 font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setField("message", e.target.value)}
                    placeholder="Add a note about this flush card add-on..."
                    rows={3}
                    className="border-slate-300 focus-visible:ring-lime-500 resize-none"
                  />
                </div>
              </>
            )}

            {/* ── Message / WhatsApp / Email fields ── */}
            {isMessageType && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-900">
                    Number of Messages *
                  </Label>
                  <Input
                    type="number"
                    value={form.numberMessage}
                    onChange={(e) => setField("numberMessage", e.target.value)}
                    placeholder="e.g. 100"
                    min={1}
                    className="h-11 border-slate-300 focus-visible:ring-lime-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-900">
                    Message Content{" "}
                    <span className="text-slate-400 font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setField("message", e.target.value)}
                    placeholder="Enter the message content..."
                    rows={3}
                    className="border-slate-300 focus-visible:ring-lime-500 resize-none"
                  />
                </div>
              </>
            )}
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
              disabled={isSaving || !form.type}
              className="bg-lime-600 hover:bg-lime-700 text-white min-w-[140px]"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {editingAddOn ? "Updating..." : "Creating..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {editingAddOn ? (
                    <>
                      <Pencil className="h-4 w-4" /> Update Add-On
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> Create Add-On
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
