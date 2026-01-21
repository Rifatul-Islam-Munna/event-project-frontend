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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  X,
  List,
  ScrollText,
  FileCheck,
} from "lucide-react";
import {
  getAllTermsAndConditions,
  createTermsAndCondition,
  deleteTermsAndCondition,
} from "@/actions/fetch-action";
import { toast } from "sonner";

export default function TermsAndConditionsDashboard() {
  const queryClient = useQueryClient();

  const [createModal, setCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<string[]>([""]);

  const {
    data: termsResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["terms-and-conditions"],
    queryFn: () => getAllTermsAndConditions("terms"),
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data: { title: string; items: string[] }) =>
      createTermsAndCondition(data),
    onSuccess: (response) => {
      if (response?.data) {
        toast.success("Terms section created successfully!");
        setCreateModal(false);
        resetForm();
        queryClient.invalidateQueries({ queryKey: ["terms-and-conditions"] });
      } else {
        toast.error(
          response?.error?.message || "Failed to create terms section",
        );
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create terms section");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTermsAndCondition(id),
    onSuccess: (response) => {
      if (response?.data) {
        toast.success("Terms section deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["terms-and-conditions"] });
      } else {
        toast.error(
          response?.error?.message || "Failed to delete terms section",
        );
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete terms section");
    },
  });

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    const filteredItems = items.filter((item) => item.trim() !== "");
    if (filteredItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    const data = {
      title: title.trim(),
      items: filteredItems,
      type: "terms",
    };

    createMutation.mutate(data);
  };

  const handleDelete = async (id: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      )
    ) {
      return;
    }
    deleteMutation.mutate(id);
  };

  const addItem = () => {
    setItems([...items, ""]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const resetForm = () => {
    setTitle("");
    setItems([""]);
  };

  const terms = termsResponse?.data || [];
  const totalItems = terms.reduce(
    (acc: number, term: any) => acc + (term?.items?.length || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      {/* Header Section */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-lime-500 to-lime-600 shadow-lg shadow-lime-500/30">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Terms & Conditions
                </h1>
                <p className="text-sm text-slate-600">
                  Manage legal terms and conditions sections
                </p>
              </div>
            </div>
            <Button
              onClick={() => setCreateModal(true)}
              size="lg"
              className="bg-lime-600 hover:bg-lime-700 text-white shadow-lg shadow-lime-500/30 h-11"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Section
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Sections
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {terms.length}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                  <ScrollText className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Items
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {totalItems}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-lime-100 flex items-center justify-center">
                  <List className="h-7 w-7 text-lime-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Avg. Items/Section
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {terms.length > 0
                      ? Math.round(totalItems / terms.length)
                      : 0}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center">
                  <FileCheck className="h-7 w-7 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Terms Table Card */}
        <Card className="border-slate-200 bg-white shadow-md">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  All Terms Sections
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Manage legal documentation sections
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lime-50 border border-lime-200">
                <div className="h-2 w-2 rounded-full bg-lime-500 animate-pulse" />
                <span className="text-sm font-medium text-lime-700">
                  {terms.length} Active
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center p-12">
                <div className="w-12 h-12 border-3 border-lime-200 border-t-lime-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-600 font-medium">Loading terms...</p>
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-red-600 font-semibold text-lg mb-2">
                  Error loading terms
                </p>
                <p className="text-slate-500 text-sm">{error?.message}</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && terms.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No terms sections yet
                </h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  Get started by creating your first terms and conditions
                  section
                </p>
                <Button
                  onClick={() => setCreateModal(true)}
                  className="bg-lime-600 hover:bg-lime-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Section
                </Button>
              </div>
            )}

            {/* Table */}
            {!isLoading && !isError && terms.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-slate-200">
                      <TableHead className="font-semibold text-slate-700 h-12 w-[60px]">
                        #
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 h-12">
                        Section Title
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 h-12">
                        Items
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 h-12">
                        Preview
                      </TableHead>
                      <TableHead className="text-center font-semibold text-slate-700 h-12">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {terms?.map((term: any, index: number) => (
                      <TableRow
                        key={term?._id}
                        className="hover:bg-slate-50 transition-colors border-b border-slate-100"
                      >
                        <TableCell className="font-medium text-slate-600 py-4">
                          {index + 1}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-lime-500 to-lime-600 flex items-center justify-center shadow-sm">
                              <FileText className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-medium text-slate-900">
                              {term?.title}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge className="bg-lime-100 text-lime-700 hover:bg-lime-200 border-lime-200">
                            <List className="h-3 w-3 mr-1" />
                            {term?.items?.length} items
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md py-4">
                          <div className="space-y-1.5">
                            {term?.items
                              ?.slice(0, 2)
                              ?.map((item: string, idx: number) => (
                                <p
                                  key={idx}
                                  className="text-sm text-slate-600 truncate flex items-start gap-2"
                                >
                                  <span className="text-lime-600 font-bold">
                                    •
                                  </span>
                                  <span className="flex-1">{item}</span>
                                </p>
                              ))}
                            {term?.items?.length > 2 && (
                              <p className="text-xs text-slate-500 italic pl-4">
                                +{term.items.length - 2} more...
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center justify-center">
                            <Button
                              onClick={() => handleDelete(term._id, term.title)}
                              variant="destructive"
                              size="sm"
                              className="bg-red-500 hover:bg-red-600 h-9"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Dialog open={createModal} onOpenChange={setCreateModal}>
        <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto border-slate-200">
          <DialogHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-lime-100 flex items-center justify-center">
                <Plus className="h-5 w-5 text-lime-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-slate-900">
                  Add New Terms Section
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  Create a new section for your terms and conditions
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Title Field */}
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-medium text-slate-900"
              >
                Section Title *
              </Label>
              <Input
                id="title"
                placeholder="e.g., Account Registration, User Responsibilities"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 border-slate-300 focus:border-lime-500 focus:ring-lime-500/20"
              />
            </div>

            {/* Items Fields */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-900">
                  Terms Items * (minimum 1 required)
                </Label>
                <Button
                  type="button"
                  onClick={addItem}
                  size="sm"
                  className="bg-lime-600 hover:bg-lime-700 text-white h-9"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <div className="relative">
                        <Textarea
                          placeholder={`Term item ${index + 1}...`}
                          value={item}
                          onChange={(e) => updateItem(index, e.target.value)}
                          className="min-h-[90px] resize-none border-slate-300 focus:border-lime-500 focus:ring-lime-500/20 pr-12"
                          rows={3}
                        />
                        <div className="absolute top-2 right-2 text-xs text-slate-400">
                          {index + 1}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeItem(index)}
                      variant="outline"
                      size="sm"
                      className="h-10 w-10 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                      disabled={items.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-lime-50 border border-lime-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-lime-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-lime-900">
                  <p className="font-semibold mb-2">Best Practices:</p>
                  <ul className="space-y-1 text-lime-800">
                    <li className="flex items-start gap-2">
                      <span className="text-lime-600 font-bold">•</span>
                      <span>Keep section titles clear and descriptive</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-lime-600 font-bold">•</span>
                      <span>Each item should be a complete statement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-lime-600 font-bold">•</span>
                      <span>Empty items will be automatically removed</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 border-t border-slate-100 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setCreateModal(false);
                resetForm();
              }}
              className="border-slate-300 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="bg-lime-600 hover:bg-lime-700 text-white"
            >
              {createMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Create Section
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
