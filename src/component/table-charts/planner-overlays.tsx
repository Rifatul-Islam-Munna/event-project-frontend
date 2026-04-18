"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  Download,
  Loader2,
  Pencil,
  RotateCw,
  Trash2,
  Users,
  UserX,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const MOTION_CLASS =
  "transition-all duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)]";

interface PlannerActionBarProps {
  pendingChanges: number;
  guestCount: number;
  unassignedGuestCount: number;
  isPdfDownloading: boolean;
  onSave: () => void;
  onDownloadPdf: () => void;
}

function StatusChip({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="inline-flex h-8 items-center gap-1.5 rounded-full bg-slate-100/85 px-3 text-[12px] font-medium text-slate-700">
      {icon}
      <span>{label}</span>
    </div>
  );
}

export function PlannerActionBar({
  pendingChanges,
  guestCount,
  unassignedGuestCount,
  isPdfDownloading,
  onSave,
  onDownloadPdf,
}: PlannerActionBarProps) {
  const hasPendingChanges = pendingChanges > 0;

  return (
    <div className="pointer-events-none absolute right-4 top-4 z-20 flex justify-end">
      <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2 rounded-2xl border border-slate-900/10 bg-white/96 p-2 shadow-sm backdrop-blur">
        <StatusChip
          icon={<Users className="h-3.5 w-3.5 text-slate-500" />}
          label={`${guestCount} guests`}
        />
        <StatusChip
          icon={<UserX className="h-3.5 w-3.5 text-slate-500" />}
          label={`${unassignedGuestCount} unassigned`}
        />
        {hasPendingChanges ? (
          <StatusChip
            icon={<span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
            label={`${pendingChanges} pending`}
          />
        ) : null}

        <Button
          type="button"
          variant="ghost"
          className={`h-8 gap-1.5 rounded-md px-2.5 text-[13px] text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${MOTION_CLASS}`}
          onClick={onDownloadPdf}
          disabled={isPdfDownloading}
        >
          {isPdfDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>{isPdfDownloading ? "Exporting" : "PDF"}</span>
        </Button>

        <Button
          type="button"
          className={`h-8 rounded-md bg-emerald-700 px-3 text-[13px] font-medium text-white shadow-none hover:bg-emerald-800 disabled:bg-emerald-300 ${MOTION_CLASS}`}
          onClick={onSave}
          disabled={!hasPendingChanges}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

export function PlannerExportOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-white/30 backdrop-blur-[2px]">
      <div className="flex max-w-sm items-center gap-3 rounded-2xl border border-slate-900/10 bg-white/96 px-4 py-3 shadow-md">
        <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Generating seating PDF
          </p>
          <p className="text-xs text-slate-500">
            Sharpening layout, names, and venue details.
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
  canRotate?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRotate?: () => void;
}

function ToolbarIconButton({
  label,
  className,
  children,
  onClick,
}: {
  label: string;
  className: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={`flex h-7 w-7 items-center justify-center rounded-full ${className} ${MOTION_CLASS}`}
      >
        {children}
      </button>
      <div className="pointer-events-none absolute left-full top-1/2 z-10 ml-2 -translate-y-1/2 rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-sm group-hover:opacity-100">
        {label}
      </div>
    </div>
  );
}

export function PlannerSelectionActions({
  label,
  style,
  canEdit,
  canRotate = false,
  onEdit,
  onDelete,
  onRotate,
}: PlannerSelectionActionsProps) {
  return (
    <div className="absolute z-30" style={style}>
      <div className="flex flex-col gap-1 rounded-full border border-slate-900/10 bg-white/96 p-1.5 shadow-md backdrop-blur">
        {canEdit ? (
          <ToolbarIconButton
            label={`Edit ${label}`}
            className="text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            onClick={onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
          </ToolbarIconButton>
        ) : null}
        {canRotate && onRotate ? (
          <ToolbarIconButton
            label={`Rotate ${label}`}
            className="text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            onClick={onRotate}
          >
            <RotateCw className="h-3.5 w-3.5" />
          </ToolbarIconButton>
        ) : null}
        <ToolbarIconButton
          label={`Delete ${label}`}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </ToolbarIconButton>
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
    <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 rounded-2xl border border-slate-900/10 bg-white/96 p-1.5 shadow-sm backdrop-blur">
      <div className="px-2.5 text-[12px] font-medium text-slate-600">
        {zoomLabel}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`h-8 w-8 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${MOTION_CLASS}`}
        onClick={onZoomOut}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`h-8 w-8 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${MOTION_CLASS}`}
        onClick={onZoomIn}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        className={`h-8 rounded-md px-2.5 text-[12px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${MOTION_CLASS}`}
        onClick={onFit}
      >
        Fit
      </Button>
    </div>
  );
}

export function PlannerEmptyState() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
      <div className="max-w-sm rounded-2xl border border-dashed border-slate-900/10 bg-white/90 p-6 text-center shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Start Planning
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">
          Add tables or room elements
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Use the left panel to place tables, drag guests into seats, and save
          the final layout.
        </p>
      </div>
    </div>
  );
}

export function PlannerLoadingSkeleton() {
  return (
    <div className="absolute inset-0 z-50 flex overflow-hidden bg-slate-50">
      <div className="hidden h-full w-full max-w-[340px] shrink-0 border-r border-slate-900/10 bg-white p-4 md:flex">
        <div className="flex w-full flex-col gap-4">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="flex-1 rounded-xl" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-10 w-[min(420px,65vw)] rounded-xl" />
        </div>

        <div className="relative flex-1 overflow-hidden rounded-[24px] border border-slate-900/10 bg-white p-4">
          <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-[1.7fr_0.7fr]">
            <Skeleton className="h-full min-h-[320px] rounded-[20px]" />
            <div className="hidden flex-col gap-4 md:flex">
              <Skeleton className="h-20 rounded-[20px]" />
              <Skeleton className="h-20 rounded-[20px]" />
              <Skeleton className="flex-1 rounded-[20px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
