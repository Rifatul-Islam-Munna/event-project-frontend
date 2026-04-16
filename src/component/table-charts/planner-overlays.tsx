"use client";

import { useState, type CSSProperties } from "react";
import { ChevronDown, Database, FileText, Loader2, Pencil, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";

interface PlannerActionBarProps {
  pendingChanges: number;
  guestCount: number;
  unassignedGuestCount: number;
  isPdfDownloading: boolean;
  onSave: () => void;
  onDownloadPdf: () => void;
}

export function PlannerActionBar({
  pendingChanges,
  guestCount,
  unassignedGuestCount,
  isPdfDownloading,
  onSave,
  onDownloadPdf,
}: PlannerActionBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasPendingChanges = pendingChanges > 0;
  const plannerStatusLabel = isPdfDownloading
    ? "Preparing PDF..."
    : hasPendingChanges
      ? `${pendingChanges} pending`
      : "All saved";
  const plannerStatusSubLabel = isPdfDownloading
    ? "Rendering a sharper seating plan with names and logo"
    : `${guestCount} guests | ${unassignedGuestCount} open`;

  return (
    <div className="pointer-events-none absolute inset-x-4 top-4 z-20 flex justify-center md:justify-end">
      <Collapsible
        open={isExpanded}
        onOpenChange={setIsExpanded}
        className="pointer-events-auto w-full max-w-[360px]"
      >
        <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/92 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.4)] backdrop-blur">
          <div className="flex items-center gap-1.5 p-1.5">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-slate-100/85 px-2.5 py-2">
              <Badge
                variant="secondary"
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  hasPendingChanges
                    ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {hasPendingChanges ? pendingChanges : "OK"}
              </Badge>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-900">
                  {plannerStatusLabel}
                </p>
                <p className="truncate text-[10px] text-slate-500">
                  {plannerStatusSubLabel}
                </p>
              </div>
            </div>

            <Button
              onClick={onSave}
              variant="secondary"
              disabled={!hasPendingChanges}
              className="h-10 rounded-2xl border border-slate-200 bg-white/90 px-2.5 text-slate-900 hover:bg-slate-50"
            >
              <Database className="h-4 w-4" />
              <span className="hidden md:inline">Save</span>
            </Button>

            <Button
              onClick={onDownloadPdf}
              disabled={isPdfDownloading}
              variant="outline"
              className="h-10 rounded-2xl border-emerald-200 bg-emerald-50/80 px-2.5 text-emerald-800 hover:bg-emerald-100"
            >
              {isPdfDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              <span className="hidden md:inline">
                {isPdfDownloading ? "Generating..." : "PDF"}
              </span>
            </Button>

            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-2xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label={
                  isExpanded
                    ? "Collapse planner actions"
                    : "Expand planner actions"
                }
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="overflow-hidden border-t border-slate-200/80 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="grid grid-cols-3 gap-1.5 p-1.5 pt-2">
              <div className="rounded-2xl bg-emerald-50 px-2.5 py-2">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Guests
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">
                  {guestCount}
                </p>
              </div>
              <div className="rounded-2xl bg-amber-50 px-2.5 py-2">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                  Open
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">
                  {unassignedGuestCount}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-100 px-2.5 py-2">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Pending
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">
                  {pendingChanges}
                </p>
              </div>
            </div>
            <div className="px-2.5 pb-2.5 text-[10px] text-slate-500">
              Save only runs when there are pending changes. PDF export does not
              change saved planner data.
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}

export function PlannerExportOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-white/28 backdrop-blur-[2px]">
      <div className="flex max-w-sm items-center gap-4 rounded-3xl border border-white/80 bg-white/95 px-5 py-4 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.4)]">
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Generating high-resolution PDF
          </p>
          <p className="text-xs text-slate-500">
            Please wait while we sharpen names, layout, and logo.
          </p>
        </div>
      </div>
    </div>
  );
}

interface PlannerSelectionActionsProps {
  label: string;
  style: CSSProperties;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function PlannerSelectionActions({
  label,
  style,
  canEdit,
  onEdit,
  onDelete,
}: PlannerSelectionActionsProps) {
  return (
    <div className="absolute z-30" style={style}>
      <div className="flex items-center gap-1 rounded-full border border-white/70 bg-white/95 p-1 shadow-lg backdrop-blur">
        <span className="max-w-40 truncate px-2 text-xs font-medium text-slate-700">
          {label}
        </span>
        {canEdit ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-100"
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-red-600 hover:bg-red-50"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface PlannerViewportControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
}

export function PlannerViewportControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onFit,
}: PlannerViewportControlsProps) {
  const zoomLabel = `${Math.round(zoom * 100)}%`;

  return (
    <div className="absolute bottom-4 left-1/2 z-20 flex w-[min(92vw,340px)] -translate-x-1/2 items-center justify-between rounded-3xl border border-white/70 bg-white/92 p-2 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.4)] backdrop-blur md:left-4 md:w-auto md:translate-x-0">
      <div className="px-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Zoom
        </p>
        <p className="text-sm font-semibold text-slate-900">{zoomLabel}</p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-2xl text-slate-700 hover:bg-slate-100"
          onClick={onZoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-2xl text-slate-700 hover:bg-slate-100"
          onClick={onZoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="rounded-2xl border-slate-200 bg-white px-4 text-slate-700 hover:bg-slate-50"
          onClick={onFit}
        >
          Fit View
        </Button>
      </div>
    </div>
  );
}

export function PlannerEmptyState() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
      <div className="max-w-sm rounded-3xl border border-dashed border-slate-300 bg-white/72 p-6 text-center shadow-lg backdrop-blur">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Start Planning
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">
          Add your first table or drag in decor
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Use the sidebar to create layout pieces, then drag guests directly onto
          seats.
        </p>
      </div>
    </div>
  );
}

export function PlannerLoadingSkeleton() {
  return (
    <div className="absolute inset-0 z-50 flex overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef6f2_100%)]">
      <div className="hidden h-full w-full max-w-[360px] shrink-0 border-r border-slate-200/80 bg-white/80 p-4 md:flex">
        <div className="flex w-full flex-col gap-4">
          <Skeleton className="h-20 rounded-3xl" />
          <Skeleton className="h-36 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="flex-1 rounded-3xl" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Skeleton className="h-11 w-11 rounded-2xl" />
          <Skeleton className="h-12 w-[min(360px,60vw)] rounded-3xl" />
        </div>

        <div className="relative flex-1 overflow-hidden rounded-[32px] border border-white/70 bg-white/65 p-4 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)]">
          <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-[1.6fr_0.9fr]">
            <Skeleton className="h-full min-h-[320px] rounded-[28px]" />
            <div className="hidden flex-col gap-4 md:flex">
              <Skeleton className="h-28 rounded-[28px]" />
              <Skeleton className="h-28 rounded-[28px]" />
              <Skeleton className="flex-1 rounded-[28px]" />
            </div>
          </div>

          <div className="absolute bottom-4 left-4 flex gap-3">
            <Skeleton className="h-12 w-36 rounded-3xl" />
            <Skeleton className="hidden h-24 w-36 rounded-3xl md:block" />
          </div>
        </div>
      </div>
    </div>
  );
}
