"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Pencil, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  getTemplateData,
  deleteTemplateData,
} from "@/actions/profileInformation";
import Image from "next/image";
import { EditTemplateDialog } from "./EditTemplateDialog";
import { toast } from "sonner";

interface Template {
  _id: string;
  imageUrl: string;
  title: string;
  links: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TemplateResponse {
  data: Template[];
  metaData: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

interface TemplatesListProps {
  onEdit?: (template: Template) => void;
  isEdit?: boolean;
  isDelete?: boolean;
}

export function TemplatesList({
  onEdit,
  isEdit,
  isDelete,
}: TemplatesListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const limit = 12;

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["templates", currentPage, limit],
    queryFn: () => getTemplateData(currentPage, limit),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTemplateData(id),
    onSuccess: (response) => {
      if (response.error) {
        toast.error(response.error.message || "Failed to delete template");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template deleted successfully!");
      setDeleteDialogOpen(false);
      setSelectedTemplate(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete template");
    },
  });

  const templates = data?.data?.data || [];
  const metaData = data?.data?.metaData;

  const handleDeleteClick = (template: Template) => {
    setSelectedTemplate(template);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedTemplate) {
      deleteMutation.mutate(selectedTemplate._id);
    }
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    if (!metaData) return [];

    const { page, totalPage } = metaData;
    const pages: (number | string)[] = [];

    if (totalPage <= 7) {
      for (let i = 1; i <= totalPage; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (page > 3) {
        pages.push("ellipsis-start");
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPage - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPage - 2) {
        pages.push("ellipsis-end");
      }

      pages.push(totalPage);
    }

    return pages;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-lime-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load templates</p>
          <p className="text-sm text-gray-500">{(error as Error)?.message}</p>
        </div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">No templates found</p>
          <p className="text-sm text-gray-500 mt-1">
            Create your first template to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((template) => (
            <Card
              key={template._id}
              className="group overflow-hidden border py-0 border-gray-200 hover:border-lime-400 transition-all duration-300 hover:shadow-xl rounded-lg bg-white"
            >
              {/* Image with Hover Overlay */}
              <div className="relative h-40 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <Image
                  src={template.imageUrl ?? ""}
                  alt={template.title ?? ""}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  width={500}
                  height={500}
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <a
                    href={template.links}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-lime-600 hover:bg-lime-700 text-white rounded-md text-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Visit</span>
                  </a>
                </div>

                {/* Badge - Smaller */}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-lime-600/90 backdrop-blur-sm text-white text-[10px] font-semibold rounded-full">
                  Template
                </div>
              </div>

              {/* Card Content - Compact */}
              <div className="p-3 space-y-2">
                {/* Title */}
                <h3 className="font-semibold text-sm line-clamp-1 text-gray-900">
                  {template.title}
                </h3>

                {/* Link */}
                <a
                  href={template.links}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-lime-600 hover:text-lime-700 hover:underline truncate block"
                  onClick={(e) => e.stopPropagation()}
                  title={template.links}
                >
                  {template.links}
                </a>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-1 pt-2 border-t border-gray-100">
                  {!isEdit && <EditTemplateDialog template={template} />}
                  {!isDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-700 text-red-600"
                      onClick={() => handleDeleteClick(template)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {metaData && metaData.totalPage > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                {/* Previous Button */}
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer hover:bg-lime-100 hover:text-lime-700"
                    }
                  />
                </PaginationItem>

                {/* Page Numbers */}
                {generatePageNumbers().map((pageNum, idx) => (
                  <PaginationItem key={idx}>
                    {typeof pageNum === "number" ? (
                      <PaginationLink
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNum);
                        }}
                        isActive={currentPage === pageNum}
                        className={
                          currentPage === pageNum
                            ? "bg-lime-600 text-white hover:bg-lime-700"
                            : "hover:bg-lime-100 hover:text-lime-700 cursor-pointer"
                        }
                      >
                        {pageNum}
                      </PaginationLink>
                    ) : (
                      <PaginationEllipsis />
                    )}
                  </PaginationItem>
                ))}

                {/* Next Button */}
                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < metaData.totalPage) {
                        setCurrentPage(currentPage + 1);
                      }
                    }}
                    className={
                      currentPage === metaData.totalPage
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer hover:bg-lime-100 hover:text-lime-700"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Results Info */}
        {metaData && (
          <div className="text-center text-sm text-gray-600">
            Showing {(metaData.page - 1) * metaData.limit + 1} to{" "}
            {Math.min(metaData.page * metaData.limit, metaData.total)} of{" "}
            {metaData.total} templates
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              template
              <span className="font-semibold text-gray-900">
                {" "}
                "{selectedTemplate?.title}"
              </span>{" "}
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-lime-300 text-lime-700 hover:bg-lime-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
