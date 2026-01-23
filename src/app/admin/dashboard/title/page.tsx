"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Trash2,
  Upload,
  Image as ImageIcon,
  Building2,
  Eye,
  FileImage,
  FileText,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DeleteHeader, getHeader, postHeader } from "@/actions/fetch-action";
import Image from "next/image";
import { toast } from "sonner";

export default function HeaderManagementDashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFavicon, setSelectedFavicon] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [faviconPreviewUrl, setFaviconPreviewUrl] = useState(null);

  const isFormValid = title.trim() && selectedFile;

  // Generate preview URLs
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [selectedFile]);

  useEffect(() => {
    if (selectedFavicon) {
      const url = URL.createObjectURL(selectedFavicon);
      setFaviconPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setFaviconPreviewUrl(null);
  }, [selectedFavicon]);

  const { data, isPending, refetch } = useQuery({
    queryKey: ["header"],
    queryFn: () => getHeader(),
  });

  const handleFileChange = (e, type = "logo") => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
        "image/svg+xml",
        "image/x-icon",
        "image/vnd.microsoft.icon",
      ];
      if (validTypes.includes(file.type)) {
        if (type === "favicon") {
          setSelectedFavicon(file);
        } else {
          setSelectedFile(file);
        }
      } else {
        toast.error("Please select a valid image file");
        if (type === "favicon") {
          setSelectedFavicon(null);
        } else {
          setSelectedFile(null);
        }
      }
    }
  };

  const { mutate, isPending: isUploading } = useMutation({
    mutationKey: ["upload"],
    mutationFn: (payload: FormData) => postHeader(payload),
    onSuccess: (data) => {
      if (data?.data) {
        toast.success("Header updated successfully");
        refetch();
        resetForm();
      } else {
        toast.error("Failed to update header");
      }
    },
  });

  const { mutate: DeleteTitle, isPending: isDeletePending } = useMutation({
    mutationKey: ["delete-header"],
    mutationFn: (payload: string) => DeleteHeader(payload),
    onSuccess: (data) => {
      if (data?.data) {
        toast.success("Header deleted successfully");
        refetch();
      } else {
        toast.error("Failed to delete header");
      }
    },
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", selectedFile);
    if (selectedFavicon) {
      formData.append("favicon", selectedFavicon);
    }
    mutate(formData);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (
      !confirm(
        "Are you sure you want to delete the header content? This action cannot be undone.",
      )
    ) {
      return;
    }
    DeleteTitle(id);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedFile(null);
    setSelectedFavicon(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      {/* Header Section */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-lime-500 to-lime-600 shadow-lg shadow-lime-500/30">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Header & Branding
              </h1>
              <p className="text-sm text-slate-600">
                Manage your website logo, favicon, and company information
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <Card className="border-slate-200 bg-white shadow-md h-fit">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-lime-100 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-lime-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-900">
                    Update Header Content
                  </CardTitle>
                  <p className="text-sm text-slate-600 mt-1">
                    Upload your branding assets and company details
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              <form onSubmit={handleUpload} className="space-y-6">
                {/* Company Title */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-600" />
                    Company Name *
                  </Label>
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Acme Corporation"
                    className="h-11 border-slate-300 focus:border-lime-500 focus:ring-lime-500/20"
                    required
                  />
                  <p className="text-xs text-slate-500">
                    Appears next to your logo in the header
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-600" />
                    Company Description
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of your company..."
                    className="min-h-[100px] resize-none border-slate-300 focus:border-lime-500 focus:ring-lime-500/20"
                    rows={4}
                  />
                  <p className="text-xs text-slate-500">
                    Optional tagline or company description (max 200 characters)
                  </p>
                </div>

                {/* Company Logo */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-slate-600" />
                    Company Logo *
                  </Label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-lime-400 rounded-lg p-6 transition-colors duration-200 bg-slate-50/50">
                    <Input
                      type="file"
                      onChange={(e) => handleFileChange(e, "logo")}
                      accept="image/jpeg,image/png,image/jpg,image/webp,image/svg+xml"
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-lime-100 file:text-lime-700 hover:file:bg-lime-200 cursor-pointer"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    PNG, SVG recommended • Max 2MB • Square or landscape
                  </p>

                  {/* Logo Preview */}
                  {selectedFile && previewUrl && (
                    <div className="p-4 bg-lime-50 border border-lime-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-lg bg-lime-500 flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-lime-900 text-sm truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-lime-700">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="relative w-full h-24 bg-white rounded-lg overflow-hidden border border-lime-200">
                        <img
                          src={previewUrl}
                          alt="Logo preview"
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Favicon */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <FileImage className="h-4 w-4 text-slate-600" />
                    Favicon (Optional)
                  </Label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-lime-400 rounded-lg p-6 transition-colors duration-200 bg-slate-50/50">
                    <Input
                      type="file"
                      onChange={(e) => handleFileChange(e, "favicon")}
                      accept="image/x-icon,image/png,image/vnd.microsoft.icon,image/svg+xml"
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    ICO or PNG • 32x32 or 64x64 pixels recommended
                  </p>

                  {/* Favicon Preview */}
                  {selectedFavicon && faviconPreviewUrl && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden border-2 border-blue-200 flex items-center justify-center">
                          <img
                            src={faviconPreviewUrl}
                            alt="Favicon preview"
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-blue-900 text-sm truncate">
                            {selectedFavicon.name}
                          </p>
                          <p className="text-xs text-blue-700">
                            {(selectedFavicon.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-lime-600 hover:bg-lime-700 text-white h-12 text-base font-semibold shadow-lg shadow-lime-500/30"
                  disabled={isUploading || !isFormValid}
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Updating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Update Header Content
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Preview & Tips */}
          <div className="space-y-6">
            {/* Live Preview */}
            <Card className="border-slate-200 bg-white shadow-md">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-lime-100 flex items-center justify-center">
                    <Eye className="h-5 w-5 text-lime-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900">
                      Current Header
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      Live preview of your header content
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                {isPending ? (
                  <div className="flex flex-col items-center justify-center p-12">
                    <div className="w-12 h-12 border-3 border-lime-200 border-t-lime-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading...</p>
                  </div>
                ) : data?.data ? (
                  <div className="space-y-6">
                    {/* Header Preview */}
                    <div className="p-6 bg-slate-50 rounded-lg border-2 border-slate-200">
                      <div className="flex items-center gap-4 mb-4">
                        {data?.data?.faviconUrl && (
                          <div className="w-8 h-8 rounded overflow-hidden bg-white border border-slate-200">
                            <Image
                              src={data.data.faviconUrl}
                              alt="Favicon"
                              width={32}
                              height={32}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
                          <Image
                            src={data.data.imageUrl}
                            alt={data.data.title}
                            width={48}
                            height={48}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-lg text-slate-900">
                            {data.data.title}
                          </p>
                          {data.data.description && (
                            <p className="text-sm text-slate-600 mt-1">
                              {data.data.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600 font-medium mb-1">
                            Company
                          </p>
                          <p className="text-slate-900">{data.data.title}</p>
                        </div>
                        <div>
                          <p className="text-slate-600 font-medium mb-1">
                            Last Updated
                          </p>
                          <p className="text-slate-900">
                            {new Date(
                              data.data.createdAt || Date.now(),
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(data.data._id)}
                      disabled={isDeletePending}
                      className="w-full bg-red-500 hover:bg-red-600 h-11"
                    >
                      {isDeletePending ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Deleting...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          Remove Header Content
                        </div>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-12">
                    <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <Building2 className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No Header Content
                    </h3>
                    <p className="text-slate-600">
                      Upload your company logo to get started
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card className="border-lime-200 bg-gradient-to-br from-lime-50 to-lime-100/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-lime-500 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-lime-900">
                    Best Practices
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-lime-800">
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 font-bold mt-0.5">•</span>
                    <span>Use high-quality PNG or SVG for logos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 font-bold mt-0.5">•</span>
                    <span>Keep file sizes under 2MB for fast loading</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 font-bold mt-0.5">•</span>
                    <span>Favicon should be 32x32 or 64x64 pixels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 font-bold mt-0.5">•</span>
                    <span>Use clear, concise company names</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 font-bold mt-0.5">•</span>
                    <span>Description helps with SEO and branding</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
