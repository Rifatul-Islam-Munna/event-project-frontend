"use client";

import { type ReactNode, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  ReceiptText,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import type { PurchaseInvoiceRecord } from "@/@types/invoice";
import {
  getAdminPurchaseInvoices,
  updatePurchaseInvoiceSent,
} from "@/actions/fetch-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function AdminInvoicesPage() {
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const {
    data: invoiceData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-purchase-invoices"],
    queryFn: async () => {
      const result = await getAdminPurchaseInvoices();
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result;
    },
  });

  const invoices = invoiceData?.data ?? [];
  const totals = useMemo(() => {
    const sent = invoices.filter((invoice) => invoice.invoiceSent).length;
    const pending = invoices.length - sent;
    const totalRevenueCents = invoices.reduce(
      (sum, invoice) => sum + (invoice.totalPriceCents ?? 0),
      0,
    );

    return { sent, pending, totalRevenueCents };
  }, [invoices]);

  const { mutate, isPending } = useMutation({
    mutationKey: ["update-purchase-invoice-sent"],
    mutationFn: ({
      id,
      invoiceSent,
    }: {
      id: string;
      invoiceSent: boolean;
    }) => updatePurchaseInvoiceSent(id, invoiceSent),
    onMutate: ({ id }) => setUpdatingId(id),
    onSuccess: (result, variables) => {
      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      toast.success(
        variables.invoiceSent
          ? "Invoice marked as sent"
          : "Invoice marked as pending",
      );
      queryClient.invalidateQueries({ queryKey: ["admin-purchase-invoices"] });
    },
    onError: () => {
      toast.error("Invoice status update failed");
    },
    onSettled: () => setUpdatingId(null),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/60">
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-lime-500 to-lime-600 shadow-lg shadow-lime-500/30">
              <ReceiptText className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Invoice Tracking
              </h1>
              <p className="text-sm text-slate-600">
                Review every billed purchase and mark manual invoices as sent.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard
            title="Total Records"
            value={String(invoices.length)}
            hint="Paid purchases saved for invoicing"
            icon={<ReceiptText className="h-6 w-6 text-lime-600" />}
            accent="bg-lime-100"
          />
          <StatCard
            title="Invoices Sent"
            value={String(totals.sent)}
            hint="Marked completed by admin"
            icon={<CheckCircle2 className="h-6 w-6 text-emerald-600" />}
            accent="bg-emerald-100"
          />
          <StatCard
            title="Tracked Revenue"
            value={formatCurrency(totals.totalRevenueCents)}
            hint={`${totals.pending} invoice${totals.pending === 1 ? "" : "s"} still pending`}
            icon={<Clock3 className="h-6 w-6 text-amber-600" />}
            accent="bg-amber-100"
          />
        </div>

        <Card className="border-slate-200 bg-white shadow-md">
          <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-8 py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  Purchase Invoices
                </CardTitle>
                <p className="mt-1 text-sm text-slate-600">
                  Plans and add-ons with buyer billing details collected at
                  checkout.
                </p>
              </div>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-white p-6 animate-pulse"
                  >
                    <div className="h-5 w-40 rounded bg-slate-200" />
                    <div className="mt-3 h-4 w-64 rounded bg-slate-100" />
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <div className="h-36 rounded-xl bg-slate-100" />
                      <div className="h-36 rounded-xl bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/60 px-6 py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
                  <ReceiptText className="h-7 w-7 text-red-500" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Failed to load invoices
                </h2>
                <p className="mt-2 max-w-md text-sm text-slate-600">
                  The admin invoice list could not be loaded right now. Try a
                  refresh to fetch the latest purchase records.
                </p>
                <Button
                  onClick={() => refetch()}
                  className="mt-5 bg-gradient-to-r from-lime-500 to-lime-600 text-white"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            ) : invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/60 px-6 py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-100">
                  <ReceiptText className="h-7 w-7 text-lime-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">
                  No invoice records yet
                </h2>
                <p className="mt-2 max-w-md text-sm text-slate-600">
                  Once users complete a purchase with billing details, it will
                  appear here for manual invoicing.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {invoices.map((invoice) => {
                  const linkedUser =
                    typeof invoice.userId === "object" ? invoice.userId : null;
                  const billingRows = getBillingRows(invoice);

                  return (
                    <Card
                      key={invoice._id}
                      className="overflow-hidden border-slate-200 bg-white shadow-sm"
                    >
                      <CardHeader className="border-b border-slate-100 bg-white px-6 py-5">
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <CardTitle className="text-xl text-slate-900">
                                {invoice.buyerName || "Unnamed buyer"}
                              </CardTitle>
                              <Badge className="bg-lime-100 text-lime-700 border-lime-200">
                                {formatPurchaseType(invoice.purchaseType)}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="border-slate-200 text-slate-600"
                              >
                                {invoice.billingDetails.customerType ===
                                "COMPANY"
                                  ? "Company"
                                  : "Individual"}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                              <span>{invoice.buyerEmail || "No email saved"}</span>
                              <span>
                                Purchased {formatDate(invoice.purchasedAt ?? invoice.createdAt)}
                              </span>
                              <span className="font-semibold text-slate-900">
                                {formatCurrency(invoice.totalPriceCents)}
                              </span>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  Invoice Sent
                                </p>
                                <p className="text-xs text-slate-500">
                                  {invoice.invoiceSentAt
                                    ? `Updated ${formatDate(invoice.invoiceSentAt)}`
                                    : "Not marked yet"}
                                </p>
                              </div>
                              <Switch
                                checked={invoice.invoiceSent}
                                disabled={
                                  isPending && updatingId === invoice._id
                                }
                                onCheckedChange={(checked) =>
                                  mutate({
                                    id: invoice._id,
                                    invoiceSent: checked,
                                  })
                                }
                              />
                              {isPending && updatingId === invoice._id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="space-y-5">
                          <SectionCard
                            title="Purchased Items"
                            icon={<Package className="h-4 w-4 text-lime-600" />}
                          >
                            <div className="space-y-3">
                              {invoice.items.map((item, index) => (
                                <div
                                  key={`${invoice._id}-${item.itemId ?? item.name}-${index}`}
                                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
                                >
                                  <div>
                                    <p className="font-semibold text-slate-900">
                                      {item.name}
                                    </p>
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                      {formatPurchaseType(item.itemType)}
                                    </p>
                                  </div>
                                  <span className="text-sm font-bold text-slate-900">
                                    {formatCurrency(item.priceCents)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </SectionCard>

                          <SectionCard
                            title="Purchase Summary"
                            icon={<ReceiptText className="h-4 w-4 text-lime-600" />}
                          >
                            <SummaryRow
                              label="Coupon"
                              value={invoice.couponCode || "-"}
                            />
                            <SummaryRow
                              label="Linked user"
                              value={
                                linkedUser
                                  ? `${linkedUser.name} (${linkedUser.email})`
                                  : typeof invoice.userId === "string"
                                    ? invoice.userId
                                    : "-"
                              }
                            />
                            <SummaryRow
                              label="Payment intent"
                              value={invoice.paymentIntentId || "-"}
                            />
                            <SummaryRow
                              label="Total"
                              value={formatCurrency(invoice.totalPriceCents)}
                              strong
                            />
                          </SectionCard>
                        </div>

                        <SectionCard
                          title="Billing Details"
                          icon={
                            invoice.billingDetails.customerType === "COMPANY" ? (
                              <Building2 className="h-4 w-4 text-lime-600" />
                            ) : (
                              <UserRound className="h-4 w-4 text-lime-600" />
                            )
                          }
                        >
                          <div className="grid gap-3 sm:grid-cols-2">
                            {billingRows.map((row) => (
                              <div
                                key={`${invoice._id}-${row.label}`}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                              >
                                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  {row.icon}
                                  {row.label}
                                </div>
                                <p className="text-sm font-medium text-slate-900 break-words">
                                  {row.value || "-"}
                                </p>
                              </div>
                            ))}
                          </div>
                        </SectionCard>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  hint,
  icon,
  accent,
}: {
  title: string;
  value: string;
  hint: string;
  icon: ReactNode;
  accent: string;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
            <p className="mt-2 text-xs text-slate-500">{hint}</p>
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${accent}`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-3 last:border-b-0 last:pb-0 first:pt-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span
        className={`text-sm text-right ${strong ? "font-bold text-slate-900" : "font-medium text-slate-800"}`}
      >
        {value}
      </span>
    </div>
  );
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format((cents ?? 0) / 100);
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPurchaseType(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getBillingRows(invoice: PurchaseInvoiceRecord) {
  if (invoice.billingDetails.customerType === "COMPANY") {
    return [
      {
        label: "Company Name",
        value: invoice.billingDetails.company.companyName,
        icon: <Building2 className="h-3.5 w-3.5 text-slate-400" />,
      },
      {
        label: "Business Activity",
        value: invoice.billingDetails.company.businessActivity,
        icon: <Building2 className="h-3.5 w-3.5 text-slate-400" />,
      },
      {
        label: "Address",
        value: invoice.billingDetails.company.address,
        icon: <MapPin className="h-3.5 w-3.5 text-slate-400" />,
      },
      {
        label: "Postal Code",
        value: invoice.billingDetails.company.postalCode,
        icon: <MapPin className="h-3.5 w-3.5 text-slate-400" />,
      },
      {
        label: "VAT",
        value: invoice.billingDetails.company.vat,
        icon: <ReceiptText className="h-3.5 w-3.5 text-slate-400" />,
      },
      {
        label: "Tax Office",
        value: invoice.billingDetails.company.taxOffice,
        icon: <ReceiptText className="h-3.5 w-3.5 text-slate-400" />,
      },
      {
        label: "Email",
        value: invoice.billingDetails.company.email,
        icon: <Mail className="h-3.5 w-3.5 text-slate-400" />,
      },
      {
        label: "Phone Number",
        value: invoice.billingDetails.company.phoneNumber,
        icon: <Phone className="h-3.5 w-3.5 text-slate-400" />,
      },
    ];
  }

  return [
    {
      label: "Name",
      value: invoice.billingDetails.individual.name,
      icon: <UserRound className="h-3.5 w-3.5 text-slate-400" />,
    },
    {
      label: "Surname",
      value: invoice.billingDetails.individual.surname,
      icon: <UserRound className="h-3.5 w-3.5 text-slate-400" />,
    },
    {
      label: "Address",
      value: invoice.billingDetails.individual.address,
      icon: <MapPin className="h-3.5 w-3.5 text-slate-400" />,
    },
    {
      label: "VAT",
      value: invoice.billingDetails.individual.vat,
      icon: <ReceiptText className="h-3.5 w-3.5 text-slate-400" />,
    },
    {
      label: "Email",
      value: invoice.billingDetails.individual.email,
      icon: <Mail className="h-3.5 w-3.5 text-slate-400" />,
    },
    {
      label: "Phone Number",
      value: invoice.billingDetails.individual.phoneNumber,
      icon: <Phone className="h-3.5 w-3.5 text-slate-400" />,
    },
  ];
}
