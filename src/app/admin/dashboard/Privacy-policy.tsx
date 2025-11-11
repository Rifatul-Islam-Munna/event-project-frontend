"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCaption,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Shield,
  X,
  List,
} from "lucide-react";
import {
  getAllTermsAndConditions,
  createTermsAndCondition,
  deleteTermsAndCondition,
} from "@/actions/fetch-action";
import { toast } from "sonner";

export default function PrivacyPolicyDashboard() {
  const queryClient = useQueryClient();

  // State management
  const [createModal, setCreateModal] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form states
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<string[]>([""]);

  // Fetch privacy policy with React Query
  const {
    data: privacyResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["privacy-policy"],
    queryFn: () => getAllTermsAndConditions("privacy"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { title: string; items: string[] }) =>
      createTermsAndCondition(data),
    onSuccess: (response) => {
      if (response?.data) {
        toast.success("Privacy section created successfully!");
        setCreateModal(false);
        resetForm();
        queryClient.invalidateQueries({ queryKey: ["privacy-policy"] });
      } else {
        toast.error(
          response?.error?.message || "Failed to create privacy section"
        );
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create privacy section");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTermsAndCondition(id),
    onSuccess: (response) => {
      if (response?.data) {
        toast.success("Privacy section deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["privacy-policy"] });
      } else {
        toast.error(
          response?.error?.message || "Failed to delete privacy section"
        );
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete privacy section");
    },
  });

  // Handle create privacy
  const handleCreate = async () => {
    // Validation
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
      type: "privacy",
    };

    createMutation.mutate(data);
  };

  // Handle delete
  const handleDelete = async (id: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    deleteMutation.mutate(id);
  };

  // Add new item field
  const addItem = () => {
    setItems([...items, ""]);
  };

  // Remove item field
  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  // Update item value
  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  // Reset form
  const resetForm = () => {
    setTitle("");
    setItems([""]);
  };

  // Show message helper
  const showMessage = (type: string, text: string) => {
    setMessage({ type, text });
    if (text) {
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  const privacy = privacyResponse?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200/60 backdrop-blur-sm">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="text-blue-700 font-semibold">Admin Dashboard</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Privacy Policy Management
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Manage privacy policy sections for your platform
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <Alert
            className={`max-w-4xl mx-auto ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription className="text-base">
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Privacy Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-slate-200/60 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-200/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    All Privacy Sections
                  </h2>
                  <p className="text-slate-600">
                    Total sections: {privacy.length}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setCreateModal(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl px-6 py-2 shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Section
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center p-12">
              <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-medium">
                Error loading privacy policy
              </p>
              <p className="text-slate-500 text-sm">{error?.message}</p>
            </div>
          )}

          {/* Table */}
          {!isLoading && !isError && (
            <Table>
              <TableCaption className="p-6 text-slate-500">
                A list of all privacy policy sections.
              </TableCaption>
              <TableHeader>
                <TableRow className="hover:bg-slate-50/50">
                  <TableHead className="font-semibold text-slate-700 w-[50px]">
                    #
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Title
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Items Count
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Items Preview
                  </TableHead>
                  <TableHead className="text-center font-semibold text-slate-700">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {privacy?.map((item: any, index: number) => (
                  <TableRow
                    key={item?._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <TableCell className="font-medium text-slate-600">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-slate-900">{item?.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        <List className="h-3 w-3 mr-1" />
                        {item?.items?.length} items
                      </span>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="space-y-1">
                        {item?.items
                          ?.slice(0, 2)
                          ?.map((subItem: string, idx: number) => (
                            <p
                              key={idx}
                              className="text-sm text-slate-600 truncate"
                            >
                              • {subItem}
                            </p>
                          ))}
                        {item?.items?.length > 2 && (
                          <p className="text-xs text-slate-400 italic">
                            +{item.items.length - 2} more items...
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          onClick={() => handleDelete(item._id, item.title)}
                          variant="destructive"
                          size="sm"
                          className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-1"
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
          )}

          {/* Empty State */}
          {!isLoading && !isError && privacy.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No privacy sections yet
              </h3>
              <p className="text-slate-600 mb-6">
                Get started by creating your first privacy policy section
              </p>
              <Button
                onClick={() => setCreateModal(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Section
              </Button>
            </div>
          )}
        </div>

        {/* Create Modal */}
        <Dialog open={createModal} onOpenChange={setCreateModal}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Plus className="h-6 w-6 text-blue-600" />
                Add New Privacy Section
              </DialogTitle>
              <DialogDescription>
                Create a new section for your privacy policy
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Title Field */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-medium">
                  Section Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Data Collection"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Items Fields */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">
                    Items * (at least 1)
                  </Label>
                  <Button
                    type="button"
                    onClick={addItem}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1">
                        <Textarea
                          placeholder={`Item ${index + 1}`}
                          value={item}
                          onChange={(e) => updateItem(index, e.target.value)}
                          className="min-h-[80px] resize-none"
                          rows={3}
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeItem(index)}
                        variant="outline"
                        size="sm"
                        className="h-10 w-10 p-0 border-red-200 text-red-600 hover:bg-red-50"
                        disabled={items.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Tips:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Keep titles concise and descriptive</li>
                      <li>Each item should be a complete statement</li>
                      <li>Empty items will be automatically removed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setCreateModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
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
    </div>
  );
}
