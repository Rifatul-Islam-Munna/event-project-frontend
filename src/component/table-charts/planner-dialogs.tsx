"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { EditDialogState, TableType } from "./planner-types";

interface PlannerAddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newTableType: TableType | null;
  venueWidth: number;
  venueHeight: number;
  estimatedCapacity: number;
  newTableLabel: string;
  onLabelChange: (value: string) => void;
  newTableNumSeats: number;
  onNumSeatsChange: (value: number) => void;
  measurementType: string;
  onMeasurementTypeChange: (value: string) => void;
  tableWidthInput: number;
  onTableWidthChange: (value: number) => void;
  tableHeightInput: number;
  onTableHeightChange: (value: number) => void;
  onConfirm: () => void;
}

export function PlannerAddItemDialog({
  open,
  onOpenChange,
  newTableType,
  venueWidth,
  venueHeight,
  estimatedCapacity,
  newTableLabel,
  onLabelChange,
  newTableNumSeats,
  onNumSeatsChange,
  measurementType,
  onMeasurementTypeChange,
  tableWidthInput,
  onTableWidthChange,
  tableHeightInput,
  onTableHeightChange,
  onConfirm,
}: PlannerAddItemDialogProps) {
  const isLine = newTableType?.includes("line");
  const isChairLayout =
    newTableType === "chair-row" || newTableType === "chair-column";
  const hideSeatSlider = newTableType === "circular-single-seat";
  const dialogLabel = isLine
    ? "Line"
    : newTableType
      ? newTableType.charAt(0).toUpperCase() + newTableType.slice(1)
      : "Item";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Add New {dialogLabel}</DialogTitle>
          <DialogDescription>
            {isLine
              ? "Set the divider thickness and length."
              : `Configure an item for ${venueWidth}m x ${venueHeight}m. Estimated capacity: ${estimatedCapacity} tables.`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="tableName">Name</Label>
            <Input
              id="tableName"
              value={newTableLabel}
              onChange={(event) => onLabelChange(event.target.value)}
              placeholder={isLine ? "e.g. Main Divider" : "e.g. Family Table"}
              className="rounded-xl"
            />
          </div>

          {isLine ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="lineThickness">Thickness (px)</Label>
                <Input
                  id="lineThickness"
                  type="number"
                  value={tableWidthInput > 0 ? tableWidthInput : ""}
                  onChange={(event) => onTableWidthChange(Number(event.target.value))}
                  min={1}
                  max={50}
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lineLength">Length (px)</Label>
                <Input
                  id="lineLength"
                  type="number"
                  value={tableHeightInput > 0 ? tableHeightInput : ""}
                  onChange={(event) => onTableHeightChange(Number(event.target.value))}
                  min={20}
                  max={4000}
                  className="rounded-xl"
                />
              </div>
            </div>
          ) : (
            <>
              {!hideSeatSlider ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {isChairLayout ? "Chair count" : "Seat count"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Adjust the initial capacity before placing the item.
                      </p>
                    </div>
                    <span className="text-lg font-semibold text-slate-900">
                      {newTableNumSeats}
                    </span>
                  </div>
                  <Slider
                    id="numSeats"
                    min={newTableType === "rectangular-one-sided" ? 1 : 2}
                    max={20}
                    step={1}
                    value={[newTableNumSeats]}
                    onValueChange={(value) => onNumSeatsChange(value[0])}
                    className="mt-4"
                  />
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr),180px]">
                <div className="grid gap-2">
                  <Label htmlFor="tableWidth">Width</Label>
                  <Input
                    id="tableWidth"
                    value={tableWidthInput > 0 ? tableWidthInput : ""}
                    onChange={(event) => onTableWidthChange(Number(event.target.value))}
                    placeholder="e.g. 2.5"
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Measurement Type</Label>
                  <Select
                    value={measurementType}
                    onValueChange={onMeasurementTypeChange}
                  >
                    <SelectTrigger className="w-full rounded-xl">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ft">ft</SelectItem>
                      <SelectItem value="m">meter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tableHeight">Height</Label>
                <Input
                  id="tableHeight"
                  value={tableHeightInput > 0 ? tableHeightInput : ""}
                  onChange={(event) => onTableHeightChange(Number(event.target.value))}
                  placeholder="e.g. 1.5"
                  className="rounded-xl"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onConfirm} className="rounded-xl">
            Add {isLine ? "Line" : "Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface PlannerEditDialogProps {
  open: boolean;
  editDialogState: EditDialogState | null;
  hideCountField: boolean;
  onOpenChange: (open: boolean) => void;
  onLabelChange: (value: string) => void;
  onCountChange: (value: number) => void;
  onConfirm: () => void;
}

export function PlannerEditDialog({
  open,
  editDialogState,
  hideCountField,
  onOpenChange,
  onLabelChange,
  onCountChange,
  onConfirm,
}: PlannerEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Update the label and, where applicable, the seat count without
            changing the saved payload format.
          </DialogDescription>
        </DialogHeader>

        {editDialogState ? (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="editLabel">Label</Label>
              <Input
                id="editLabel"
                value={editDialogState.label}
                onChange={(event) => onLabelChange(event.target.value)}
                className="rounded-xl"
              />
            </div>

            {!hideCountField ? (
              <div className="grid gap-2">
                <Label htmlFor="editCount">Count</Label>
                <Input
                  id="editCount"
                  type="number"
                  min={1}
                  max={editDialogState.kind === "chairNode" ? 50 : 20}
                  value={editDialogState.seatsOrChairs}
                  onChange={(event) => onCountChange(Number(event.target.value))}
                  className="rounded-xl"
                />
              </div>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          <Button onClick={onConfirm} className="rounded-xl">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
