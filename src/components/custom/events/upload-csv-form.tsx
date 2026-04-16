"use client";

import type React from "react";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { updateMultipleGuest } from "@/actions/fetch-action";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GetGuestType } from "@/actions/vendor-category-actions";

type UploadCsvFormProps = {
  onClose: () => void;
  eventId: string;
};

type UploadCsvPayload = {
  file: File;
  guestType?: string;
};

export function UploadCsvForm({ onClose, eventId }: UploadCsvFormProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [selectedGuestType, setSelectedGuestType] =
    useState<string>("from-file");
  const query = useQueryClient();

  const { data: guestTypeData, isLoading: isLoadingGuestTypes } = useQuery({
    queryKey: ["guest-types", eventId],
    queryFn: () => GetGuestType(eventId),
    enabled: !!eventId,
    retry: false,
  });

  const availableTypes = guestTypeData?.data?.type || [];

  const { mutate, isPending } = useMutation({
    mutationKey: ["csv-upload"],
    mutationFn: (payload: UploadCsvPayload) =>
      updateMultipleGuest(
        payload.file,
        eventId,
        payload.guestType === "from-file" ? undefined : payload.guestType,
      ),
    onSuccess: (data) => {
      if (data?.error) {
        return toast.error(data?.error?.message);
      }
      setCsvFile(null);
      setSelectedGuestType("from-file");
      onClose();
      query.refetchQueries({ queryKey: ["get-all-guest"], exact: false });
      return toast.success("Guests imported successfully");
    },
    onError: (error) => {
      return toast.error(error?.message);
    },
  });
  const downloadTemplate = () => {
    // Create CSV content with headers and sample data
    const csvContent = [
      ["name", "email", "phone", "adults", "children", "type"],
      [
        "John Doe",
        "john@example.com",
        "with country code phone number",
        "2",
        "1",
        "Test",
      ],
      ["Jane Smith", "jane@example.com", "with country code", "1", "0", "Test"],
    ]
      .map((row) => row.join(","))
      .join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "guest_list_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Template downloaded successfully");
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!csvFile) {
      return toast.error("Please select a CSV file to upload.");
    }

    mutate({
      file: csvFile,
      guestType: selectedGuestType,
    });
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={downloadTemplate}
          className="mb-2 w-fit"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
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
          {`Please ensure your CSV has columns for 'name', 'email', 'phone', 'adults', and 'children'. The 'type' column is optional.`}
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="bulkGuestType" className="text-foreground">
          Guest Type For All Uploaded Guests
        </Label>
        {isLoadingGuestTypes ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading guest types...
          </div>
        ) : availableTypes.length > 0 ? (
          <>
            <Select
              value={selectedGuestType}
              onValueChange={setSelectedGuestType}
            >
              <SelectTrigger
                id="bulkGuestType"
                className="border-border focus:ring-primary focus:border-primary"
              >
                <SelectValue placeholder="Choose guest type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="from-file">
                  Use CSV type / no fixed type
                </SelectItem>
                {availableTypes.map((guestType: string) => (
                  <SelectItem key={guestType} value={guestType}>
                    {guestType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Selecting a type here will apply it to every guest in this upload
              and override any `type` value inside the CSV file.
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No guest types are set for this event yet. You can still upload the
            file and use the optional `type` column in the CSV.
          </p>
        )}
      </div>
      <DialogFooter className="mt-4">
        <Button
          type="submit"
          className="w-full bg-lime-600 text-primary-foreground hover:bg-lime-700"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
          Upload CSV
        </Button>
      </DialogFooter>
    </form>
  );
}
