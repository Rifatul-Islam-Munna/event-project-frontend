"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Trash2, Edit, Tags, X, Save, Sparkles, Upload, Image as ImageIcon, Building2, Mail, Phone, Globe, Facebook } from "lucide-react";
import {
  getVendorCategory,
  createVendorCategory,
  updateVendorCategory,
  deleteVendorCategory,
  VendorCategory,
  VendorCategoryItem,
  getGlobalVendors,
  createGlobalVendor,
  updateGlobalVendor,
  deleteGlobalVendor,
  GlobalVendor,
} from "@/actions/vendor-category-actions";
import { toast } from "sonner";

interface VendorCategoryWithId extends VendorCategoryItem {
  _id?: string;
}

export default function VendorCategoriesPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState("categories");
  
  // Category state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<VendorCategory | null>(null);
  const [categoryInput, setCategoryInput] = useState("");
  const [categories, setCategories] = useState<VendorCategoryWithId[]>([]);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Global vendor state
  const [isCreateVendorModalOpen, setIsCreateVendorModalOpen] = useState(false);
  const [isEditVendorModalOpen, setIsEditVendorModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<GlobalVendor | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Vendor form state
  const [vendorForm, setVendorForm] = useState({
    name: "",
    shortDescription: "",
    phone: "",
    email: "",
    facebookLink: "",
    website: "",
    category: "",
    logo: "",
  });

  // Fetch vendor category
  const { data: categoryData, isLoading: isCategoryLoading } = useQuery({
    queryKey: ["vendor-category"],
    queryFn: getVendorCategory,
  });
  const vendorCategory = categoryData?.data as VendorCategory | undefined;

  // Fetch global vendors
  const [vendorPage, setVendorPage] = useState(1);
  const { data: vendorsData, isLoading: isVendorsLoading, refetch: refetchVendors } = useQuery({
    queryKey: ["global-vendors", vendorPage, searchQuery],
    queryFn: () => getGlobalVendors(vendorPage, 10, searchQuery || undefined),
  });
  const vendors = vendorsData?.data?.data || [];
  const vendorsTotal = vendorsData?.data?.total || 0;
  const vendorsTotalPages = vendorsData?.data?.totalPages || 1;

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (payload: { category: VendorCategoryItem[] }) =>
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

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { category: VendorCategoryItem[] };
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

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
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

  // Create vendor mutation
  const createVendorMutation = useMutation({
    mutationFn: (payload: any) => createGlobalVendor(payload),
    onSuccess: (response) => {
      if (response?.data) {
        toast.success("Vendor created successfully");
        queryClient.invalidateQueries({ queryKey: ["global-vendors"] });
        closeVendorModal();
      } else {
        toast.error(response?.error?.message || "Failed to create vendor");
      }
    },
    onError: () => {
      toast.error("Failed to create vendor");
    },
  });

  // Update vendor mutation
  const updateVendorMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      updateGlobalVendor(id, payload),
    onSuccess: (response) => {
      if (response?.data) {
        toast.success("Vendor updated successfully");
        queryClient.invalidateQueries({ queryKey: ["global-vendors"] });
        closeVendorModal();
      } else {
        toast.error(response?.error?.message || "Failed to update vendor");
      }
    },
    onError: () => {
      toast.error("Failed to update vendor");
    },
  });

  // Delete vendor mutation
  const deleteVendorMutation = useMutation({
    mutationFn: (id: string) => deleteGlobalVendor(id),
    onSuccess: (response) => {
      if (response?.data) {
        toast.success("Vendor deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["global-vendors"] });
      } else {
        toast.error(response?.error?.message || "Failed to delete vendor");
      }
    },
    onError: () => {
      toast.error("Failed to delete vendor");
    },
  });

  // Handlers
  const handleAddCategory = () => {
    const trimmed = categoryInput.trim();
    if (trimmed) {
      const exists = categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase());
      if (exists) {
        toast.error("Category already exists");
        return;
      }
      setCategories([...categories, { name: trimmed, logo: selectedLogo || undefined }]);
      setCategoryInput("");
      setSelectedLogo(null);
    }
  };

  const handleRemoveCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleEditCategory = (index: number) => {
    const cat = categories[index];
    setCategoryInput(cat.name);
    setSelectedLogo(cat.logo || null);
    setEditingIndex(index);
  };

  const handleUpdateCategory = () => {
    if (editingIndex === null) return;
    const updated = [...categories];
    updated[editingIndex] = { name: categoryInput, logo: selectedLogo || undefined };
    setCategories(updated);
    setCategoryInput("");
    setSelectedLogo(null);
    setEditingIndex(null);
  };

  const handleCreate = () => {
    if (categories.length === 0) {
      toast.error("Please add at least one category");
      return;
    }
    createCategoryMutation.mutate({ category: categories });
  };

  const handleUpdate = () => {
    if (!currentCategory || categories.length === 0) {
      toast.error("Please add at least one category");
      return;
    }
    updateCategoryMutation.mutate({
      id: currentCategory._id,
      payload: { category: categories },
    });
  };

  const handleDelete = () => {
    if (!vendorCategory) return;
    if (!confirm("Are you sure you want to delete all vendor categories?")) return;
    deleteCategoryMutation.mutate(vendorCategory._id);
  };

  const openCreateModal = () => {
    setCategories([]);
    setCategoryInput("");
    setSelectedLogo(null);
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setCategories([]);
    setCategoryInput("");
    setSelectedLogo(null);
  };

  const openEditModal = () => {
    if (vendorCategory) {
      setCurrentCategory(vendorCategory);
      setCategories([...vendorCategory.category]);
      setCategoryInput("");
      setSelectedLogo(null);
      setIsEditModalOpen(true);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentCategory(null);
    setCategories([]);
    setCategoryInput("");
    setSelectedLogo(null);
  };

  const openVendorModal = (vendor?: GlobalVendor) => {
    if (vendor) {
      setSelectedVendor(vendor);
      setVendorForm({
        name: vendor.name,
        shortDescription: vendor.shortDescription || "",
        phone: vendor.phone || "",
        email: vendor.email || "",
        facebookLink: vendor.facebookLink || "",
        website: vendor.website || "",
        category: vendor.category,
        logo: vendor.logo || "",
      });
      setIsEditVendorModalOpen(true);
    } else {
      setSelectedVendor(null);
      setVendorForm({
        name: "",
        shortDescription: "",
        phone: "",
        email: "",
        facebookLink: "",
        website: "",
        category: "",
        logo: "",
      });
      setIsCreateVendorModalOpen(true);
    }
  };

  const closeVendorModal = () => {
    setIsCreateVendorModalOpen(false);
    setIsEditVendorModalOpen(false);
    setSelectedVendor(null);
    setVendorForm({
      name: "",
      shortDescription: "",
      phone: "",
      email: "",
      facebookLink: "",
      website: "",
      category: "",
      logo: "",
    });
  };

  const handleVendorSubmit = () => {
    if (!vendorForm.name || !vendorForm.category) {
      toast.error("Name and category are required");
      return;
    }
    
    if (selectedVendor) {
      updateVendorMutation.mutate({ id: selectedVendor._id, payload: vendorForm });
    } else {
      createVendorMutation.mutate(vendorForm);
    }
  };

  const handleDeleteVendor = (id: string) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return;
    deleteVendorMutation.mutate(id);
  };

  const handleCategoryKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (editingIndex !== null) {
        handleUpdateCategory();
      } else {
        handleAddCategory();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-lime-500 to-lime-600 shadow-lg shadow-lime-500/30">
                <Tags className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Vendor Management
                </h1>
                <p className="text-sm text-slate-600">
                  Manage categories and global vendors for your platform
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200 p-1 h-auto gap-1">
            <TabsTrigger 
              value="categories"
              className="data-[state=active]:bg-lime-600 data-[state=active]:text-white px-6 py-2"
            >
              <Tags className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger 
              value="vendors"
              className="data-[state=active]:bg-lime-600 data-[state=active]:text-white px-6 py-2"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Global Vendors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Categories</p>
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
                    <div className="h-14 w-14 rounded-full bg-lime-100 flex items-center justify-center">
                      <div className={`h-3 w-3 rounded-full ${vendorCategory ? "bg-lime-500 animate-pulse" : "bg-slate-400"}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Last Updated</p>
                      <p className="text-lg font-bold text-slate-900 mt-2">
                        {vendorCategory ? new Date(vendorCategory.updatedAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                      <Sparkles className="h-7 w-7 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                      <Button onClick={openEditModal} size="sm" className="bg-lime-600 hover:bg-lime-700 text-white">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button onClick={handleDelete} variant="destructive" size="sm" disabled={deleteCategoryMutation.isPending} className="bg-red-500 hover:bg-red-600">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-8">
                {isCategoryLoading ? (
                  <div className="flex flex-col items-center justify-center p-12">
                    <div className="w-12 h-12 border-3 border-lime-200 border-t-lime-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading categories...</p>
                  </div>
                ) : !vendorCategory ? (
                  <div className="text-center p-12">
                    <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <Tags className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Categories Set</h3>
                    <p className="text-slate-600 mb-6">Create your first set of vendor categories to get started</p>
                    <Button onClick={openCreateModal} className="bg-lime-600 hover:bg-lime-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Categories
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {vendorCategory.category.map((cat, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-lime-300 transition-colors">
                        {cat.logo ? (
                          <img src={cat.logo} alt={cat.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-lime-100 flex items-center justify-center">
                            <Tags className="h-5 w-5 text-lime-600" />
                          </div>
                        )}
                        <span className="font-medium text-slate-900">{cat.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors" className="mt-8">
            <Card className="border-slate-200 bg-white shadow-md">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900">
                      Global Vendors
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      Manage your global vendor directory
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-[250px] border-slate-300"
                      />
                    </div>
                    <Button onClick={() => openVendorModal()} className="bg-lime-600 hover:bg-lime-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Vendor
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {isVendorsLoading ? (
                  <div className="flex flex-col items-center justify-center p-12">
                    <div className="w-12 h-12 border-3 border-lime-200 border-t-lime-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading vendors...</p>
                  </div>
                ) : vendors.length === 0 ? (
                  <div className="text-center p-12">
                    <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <Building2 className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Vendors Found</h3>
                    <p className="text-slate-600 mb-6">Add your first global vendor to get started</p>
                    <Button onClick={() => openVendorModal()} className="bg-lime-600 hover:bg-lime-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Vendor
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left py-4 px-6 font-semibold text-slate-900">Vendor</th>
                          <th className="text-left py-4 px-6 font-semibold text-slate-900">Category</th>
                          <th className="text-left py-4 px-6 font-semibold text-slate-900">Contact</th>
                          <th className="text-left py-4 px-6 font-semibold text-slate-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {vendors.map((vendor) => (
                          <tr key={vendor._id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                {vendor.logo ? (
                                  <img src={vendor.logo} alt={vendor.name} className="w-10 h-10 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-lime-100 flex items-center justify-center">
                                    <Building2 className="h-5 w-5 text-lime-600" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-slate-900">{vendor.name}</p>
                                  {vendor.shortDescription && (
                                    <p className="text-sm text-slate-500 truncate max-w-[200px]">{vendor.shortDescription}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <Badge className="bg-lime-100 text-lime-700 border-lime-200">{vendor.category}</Badge>
                            </td>
                            <td className="py-4 px-6">
                              <div className="space-y-1">
                                {vendor.email && <p className="text-sm text-slate-600 flex items-center gap-2"><Mail className="h-3 w-3" />{vendor.email}</p>}
                                {vendor.phone && <p className="text-sm text-slate-600 flex items-center gap-2"><Phone className="h-3 w-3" />{vendor.phone}</p>}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => openVendorModal(vendor)} className="border-slate-300 hover:border-lime-600 hover:text-lime-600">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDeleteVendor(vendor._id)} className="border-slate-300 hover:border-red-600 hover:text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {vendors.length > 0 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600">
                      Showing {((vendorPage - 1) * 10) + 1} to {Math.min(vendorPage * 10, vendorsTotal)} of {vendorsTotal} vendors
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={vendorPage === 1} onClick={() => setVendorPage(vendorPage - 1)}>Previous</Button>
                      <Button variant="outline" size="sm" disabled={vendorPage >= vendorsTotalPages} onClick={() => setVendorPage(vendorPage + 1)}>Next</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Category Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[540px] border-slate-200 max-h-[90vh] overflow-y-auto">
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
                  Add categories for vendor classification with optional logos
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900">Category Name</Label>
              <div className="flex gap-2">
                <Input
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  onKeyPress={handleCategoryKeyPress}
                  placeholder="e.g., Catering, Photography..."
                  className="flex-1 h-11 border-slate-300 focus:border-lime-500 focus:ring-lime-500/20"
                />
                <Button
                  onClick={editingIndex !== null ? handleUpdateCategory : handleAddCategory}
                  type="button"
                  className="bg-lime-600 hover:bg-lime-700 text-white h-11"
                >
                  {editingIndex !== null ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900">Category Logo (Optional)</Label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => setSelectedLogo(e.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-slate-300"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
                {selectedLogo && (
                  <div className="relative">
                    <img src={selectedLogo} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
                    <button onClick={() => setSelectedLogo(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {categories.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">Categories ({categories.length})</Label>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 max-h-[200px] overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat, index) => (
                      <Badge key={index} className="px-3 py-1.5 text-sm bg-lime-100 text-lime-700 hover:bg-lime-200 border-lime-200 flex items-center gap-2">
                        {cat.logo && <img src={cat.logo} alt="" className="w-4 h-4 rounded" />}
                        {cat.name}
                        <div className="flex gap-1 ml-1">
                          <button onClick={() => handleEditCategory(index)} className="hover:text-lime-900">
                            <Edit className="h-3 w-3" />
                          </button>
                          <button onClick={() => handleRemoveCategory(index)} className="hover:text-red-600">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-lime-50 border border-lime-200 rounded-lg">
              <p className="text-sm text-lime-900">
                <strong>Note:</strong> Creating new categories will replace any existing categories in the system.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-3 border-t border-slate-100 pt-4">
            <Button variant="outline" onClick={closeCreateModal} className="border-slate-300 hover:bg-slate-100">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createCategoryMutation.isPending || categories.length === 0} className="bg-lime-600 hover:bg-lime-700 text-white">
              {createCategoryMutation.isPending ? "Creating..." : "Create Categories"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[540px] border-slate-200 max-h-[90vh] overflow-y-auto">
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
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900">Category Name</Label>
              <div className="flex gap-2">
                <Input
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  onKeyPress={handleCategoryKeyPress}
                  placeholder="e.g., Catering, Photography..."
                  className="flex-1 h-11 border-slate-300 focus:border-lime-500 focus:ring-lime-500/20"
                />
                <Button
                  onClick={editingIndex !== null ? handleUpdateCategory : handleAddCategory}
                  type="button"
                  className="bg-lime-600 hover:bg-lime-700 text-white h-11"
                >
                  {editingIndex !== null ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900">Category Logo (Optional)</Label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => setSelectedLogo(e.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => logoInputRef.current?.click()}
                  className="border-slate-300"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
                {selectedLogo && (
                  <div className="relative">
                    <img src={selectedLogo} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
                    <button onClick={() => setSelectedLogo(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {categories.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">Categories ({categories.length})</Label>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 max-h-[200px] overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat, index) => (
                      <Badge key={index} className="px-3 py-1.5 text-sm bg-lime-100 text-lime-700 hover:bg-lime-200 border-lime-200 flex items-center gap-2">
                        {cat.logo && <img src={cat.logo} alt="" className="w-4 h-4 rounded" />}
                        {cat.name}
                        <div className="flex gap-1 ml-1">
                          <button onClick={() => handleEditCategory(index)} className="hover:text-lime-900">
                            <Edit className="h-3 w-3" />
                          </button>
                          <button onClick={() => handleRemoveCategory(index)} className="hover:text-red-600">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3 border-t border-slate-100 pt-4">
            <Button variant="outline" onClick={closeEditModal} className="border-slate-300 hover:bg-slate-100">
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateCategoryMutation.isPending || categories.length === 0} className="bg-lime-600 hover:bg-lime-700 text-white">
              {updateCategoryMutation.isPending ? "Updating..." : "Update Categories"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Vendor Modal */}
      <Dialog open={isCreateVendorModalOpen || isEditVendorModalOpen} onOpenChange={(open) => !open && closeVendorModal()}>
        <DialogContent className="sm:max-w-[600px] border-slate-200 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-lime-100 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-lime-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-slate-900">
                  {selectedVendor ? "Edit Vendor" : "Add Global Vendor"}
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  {selectedVendor ? "Update vendor information" : "Add a new vendor to your global directory"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">Vendor Name *</Label>
                <Input
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                  placeholder="Enter vendor name"
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">Category *</Label>
                <Select value={vendorForm.category} onValueChange={(value) => setVendorForm({ ...vendorForm, category: value })}>
                  <SelectTrigger className="border-slate-300">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendorCategory?.category.map((cat, index) => (
                      <SelectItem key={index} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900">Short Description</Label>
              <Textarea
                value={vendorForm.shortDescription}
                onChange={(e) => setVendorForm({ ...vendorForm, shortDescription: e.target.value })}
                placeholder="Brief description of the vendor..."
                className="border-slate-300"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">Phone Number</Label>
                <Input
                  value={vendorForm.phone}
                  onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                  placeholder="Phone number"
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">Email</Label>
                <Input
                  value={vendorForm.email}
                  onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                  placeholder="Email address"
                  type="email"
                  className="border-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">Facebook Link</Label>
                <Input
                  value={vendorForm.facebookLink}
                  onChange={(e) => setVendorForm({ ...vendorForm, facebookLink: e.target.value })}
                  placeholder="Facebook URL (optional)"
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">Website</Label>
                <Input
                  value={vendorForm.website}
                  onChange={(e) => setVendorForm({ ...vendorForm, website: e.target.value })}
                  placeholder="Website URL (optional)"
                  className="border-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900">Vendor Logo (Optional)</Label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="vendor-logo-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => setVendorForm({ ...vendorForm, logo: e.target?.result as string });
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('vendor-logo-upload')?.click()}
                  className="border-slate-300"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
                {vendorForm.logo && (
                  <div className="relative">
                    <img src={vendorForm.logo} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                    <button onClick={() => setVendorForm({ ...vendorForm, logo: "" })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 border-t border-slate-100 pt-4">
            <Button variant="outline" onClick={closeVendorModal} className="border-slate-300 hover:bg-slate-100">
              Cancel
            </Button>
            <Button
              onClick={handleVendorSubmit}
              disabled={createVendorMutation.isPending || updateVendorMutation.isPending || !vendorForm.name || !vendorForm.category}
              className="bg-lime-600 hover:bg-lime-700 text-white"
            >
              {createVendorMutation.isPending || updateVendorMutation.isPending ? "Saving..." : selectedVendor ? "Update Vendor" : "Add Vendor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}