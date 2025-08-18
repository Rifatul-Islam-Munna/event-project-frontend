"use client";

import type React from "react";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { updateMultipleGuest } from "@/actions/fetch-action";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

type UploadCsvFormProps = {
  onClose: () => void;
};

export function UploadCsvForm({ onClose }: UploadCsvFormProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const pathName = usePathname();
  const query = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationKey: ["csv-upload"],
    mutationFn: (payload: File) =>
      updateMultipleGuest(payload, pathName?.split("/")?.pop() as string),
    onSuccess: (data) => {
      if (data?.error) {
        return toast.error(data?.error?.message);
      }
      setCsvFile(null);
      onClose();
      query.refetchQueries({ queryKey: ["get-all-guest"], exact: false });
      return toast.success("Guests imported successfully");
    },
    onError: (error) => {
      return toast.error(error?.message);
    },
  });
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!csvFile) {
      return toast.error("Please select a CSV file to upload.");
    }

    mutate(csvFile);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="csvFile" className="text-foreground">
          Upload Guest List CSV{" "}
          <span className=" text-xs text-gray-700">
            (support: .csv,.xlsx, .xls)
          </span>
        </Label>
        <Input
          id="csvFile"
          type="file"
          accept="
    .csv,
    .tsv,
    .xlsx,
    .xls,
    .xlsm,
    .xlsb,
    .ods,
    application/vnd.ms-excel,
    application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  "
          onChange={(e) =>
            setCsvFile(e.target.files ? e.target.files[0] : null)
          }
          required
          className="border-border focus:ring-primary focus:border-primary file:text-primary file:bg-muted file:border-border file:hover:bg-muted/80"
        />
        <p className="text-sm text-muted-foreground">
          {`Please ensure your CSV has columns for 'name', 'email', 'phone',`}
        </p>
      </div>
      <DialogFooter className="mt-4">
        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
          Upload CSV
        </Button>
      </DialogFooter>
    </form>
  );
}
