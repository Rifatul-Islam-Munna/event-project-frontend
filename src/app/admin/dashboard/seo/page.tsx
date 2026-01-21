"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Tags, X, Save, Sparkles } from "lucide-react";
import {
  getVendorCategory,
  createVendorCategory,
  updateVendorCategory,
  deleteVendorCategory,
  VendorCategory,
} from "@/actions/vendor-category-actions";
import { toast } from "sonner";

export default function VendorCategoryPage() {
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<VendorCategory | null>(
    null,
  );

  // Form state
  const [categoryInput, setCategoryInput] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch vendor category
  const { data, isLoading, isError } = useQuery({
    queryKey: ["vendor-category"],
    queryFn: getVendorCategory,
  });
  console.log("data->", data?.data?.category);
  const vendorCategory = data?.data as VendorCategory | undefined;

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (payload: { category: string[] }) =>
      createVendorCategory(payload),
    onSuccess: (response) => {
      if (response?.data) {
        toast.success("Categories created successfully");
        queryClient.invalidateQueries({ queryKey: ["vendor-category"] });
        closeCreateModal();
      } else {
        toast.error(response?.error?.message || "Failed to create categories");
      }
    },
    onError: () => {
      toast.error("Failed to create categories");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { category: string[] };
    }) => updateVendorCategory(id, payload),
    onSuccess: (response) => {
      if (response?.data) {
        toast.success("Categories updated successfully");
        queryClient.invalidateQueries({ queryKey: ["vendor-category"] });
        closeEditModal();
      } else {
        toast.error(response?.error?.message || "Failed to update categories");
      }
    },
    onError: () => {
      toast.error("Failed to update categories");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVendorCategory(id),
    onSuccess: (response) => {
      if (response?.data) {
        toast.success("Categories deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["vendor-category"] });
      } else {
        toast.error(response?.error?.message || "Failed to delete categories");
      }
    },
    onError: () => {
      toast.error("Failed to delete categories");
    },
  });

  // Handlers
  const handleAddCategory = () => {
    const trimmed = categoryInput.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      setCategoryInput("");
    } else if (categories.includes(trimmed)) {
      toast.error("Category already exists");
    }
  };

  const handleRemoveCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (categories.length === 0) {
      toast.error("Please add at least one category");
      return;
    }
    createMutation.mutate({ category: categories });
  };

  const handleUpdate = () => {
    if (!currentCategory || categories.length === 0) {
      toast.error("Please add at least one category");
      return;
    }
    updateMutation.mutate({
      id: currentCategory._id,
      payload: { category: categories },
    });
  };

  const handleDelete = () => {
    if (!vendorCategory) return;
    if (!confirm("Are you sure you want to delete all vendor categories?"))
      return;
    deleteMutation.mutate(vendorCategory._id);
  };

  const openCreateModal = () => {
    setCategories([]);
    setCategoryInput("");
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setCategories([]);
    setCategoryInput("");
  };

  const openEditModal = () => {
    if (vendorCategory) {
      setCurrentCategory(vendorCategory);
      setCategories([...vendorCategory.category]);
      setCategoryInput("");
      setIsEditModalOpen(true);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentCategory(null);
    setCategories([]);
    setCategoryInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCategory();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      {/* Header Section */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-lime-500 to-lime-600 shadow-lg shadow-lime-500/30">
                <Tags className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Vendor Categories
                </h1>
                <p className="text-sm text-slate-600">
                  Manage vendor category options for your platform
                </p>
              </div>
            </div>
            {!vendorCategory && !isLoading && (
              <Button
                onClick={openCreateModal}
                size="lg"
                className="bg-lime-600 hover:bg-lime-700 text-white shadow-lg shadow-lime-500/30 h-11"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Categories
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Categories
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {vendorCategory?.category.length || 0}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-lime-100 flex items-center justify-center">
                  <Tags className="h-7 w-7 text-lime-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Status</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {vendorCategory ? "Active" : "Not Set"}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                  <div
                    className={`h-3 w-3 rounded-full ${vendorCategory ? "bg-green-500 animate-pulse" : "bg-slate-400"}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Last Updated
                  </p>
                  <p className="text-lg font-bold text-slate-900 mt-2">
                    {vendorCategory
                      ? new Date(vendorCategory.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Display Card */}
        <Card className="border-slate-200 bg-white shadow-md">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  Current Categories
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Vendor category options available in the system
                </p>
              </div>
              {vendorCategory && (
                <div className="flex gap-2">
                  <Button
                    onClick={openEditModal}
                    size="sm"
                    className="bg-lime-600 hover:bg-lime-700 text-white"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={handleDelete}
                    variant="destructive"
                    size="sm"
                    disabled={deleteMutation.isPending}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12">
                <div className="w-12 h-12 border-3 border-lime-200 border-t-lime-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-600 font-medium">
                  Loading categories...
                </p>
              </div>
            ) : isError || !vendorCategory ? (
              <div className="text-center p-12">
                <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Tags className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No Categories Set
                </h3>
                <p className="text-slate-600 mb-6">
                  Create your first set of vendor categories to get started
                </p>
                <Button
                  onClick={openCreateModal}
                  className="bg-lime-600 hover:bg-lime-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Categories
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {vendorCategory.category.map((cat, index) => (
                  <Badge
                    key={index}
                    className="px-4 py-2 text-sm font-medium bg-lime-100 text-lime-700 hover:bg-lime-200 border-lime-200"
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[540px] border-slate-200">
          <DialogHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-lime-100 flex items-center justify-center">
                <Plus className="h-5 w-5 text-lime-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-slate-900">
                  Create Vendor Categories
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  Add categories for vendor classification
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Input Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">
                Add Category
              </label>
              <div className="flex gap-2">
                <Input
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., Catering, Photography..."
                  className="flex-1 h-11 border-slate-300 focus:border-lime-500 focus:ring-lime-500/20"
                />
                <Button
                  onClick={handleAddCategory}
                  type="button"
                  className="bg-lime-600 hover:bg-lime-700 text-white h-11"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Categories List */}
            {categories.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">
                  Categories ({categories.length})
                </label>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 max-h-[200px] overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat, index) => (
                      <Badge
                        key={index}
                        className="px-3 py-1.5 text-sm bg-lime-100 text-lime-700 hover:bg-lime-200 border-lime-200 flex items-center gap-2"
                      >
                        {cat}
                        <button
                          onClick={() => handleRemoveCategory(index)}
                          className="hover:text-lime-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="p-4 bg-lime-50 border border-lime-200 rounded-lg">
              <p className="text-sm text-lime-900">
                <strong>Note:</strong> Creating new categories will replace any
                existing categories in the system.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-3 border-t border-slate-100 pt-4">
            <Button
              variant="outline"
              onClick={closeCreateModal}
              className="border-slate-300 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending || categories.length === 0}
              className="bg-lime-600 hover:bg-lime-700 text-white"
            >
              {createMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Create Categories
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[540px] border-slate-200">
          <DialogHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-lime-100 flex items-center justify-center">
                <Edit className="h-5 w-5 text-lime-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-slate-900">
                  Edit Vendor Categories
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  Modify your vendor category list
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Input Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">
                Add Category
              </label>
              <div className="flex gap-2">
                <Input
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., Catering, Photography..."
                  className="flex-1 h-11 border-slate-300 focus:border-lime-500 focus:ring-lime-500/20"
                />
                <Button
                  onClick={handleAddCategory}
                  type="button"
                  className="bg-lime-600 hover:bg-lime-700 text-white h-11"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Categories List */}
            {categories.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">
                  Categories ({categories.length})
                </label>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 max-h-[200px] overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat, index) => (
                      <Badge
                        key={index}
                        className="px-3 py-1.5 text-sm bg-lime-100 text-lime-700 hover:bg-lime-200 border-lime-200 flex items-center gap-2"
                      >
                        {cat}
                        <button
                          onClick={() => handleRemoveCategory(index)}
                          className="hover:text-lime-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3 border-t border-slate-100 pt-4">
            <Button
              variant="outline"
              onClick={closeEditModal}
              className="border-slate-300 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending || categories.length === 0}
              className="bg-lime-600 hover:bg-lime-700 text-white"
            >
              {updateMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Updating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Update Categories
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
