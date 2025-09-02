"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Trash2,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Settings,
  Eye,
  Building2,
  Sparkles,
  Crown,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DeleteHeader, getHeader, postHeader } from "@/actions/fetch-action";
import Image from "next/image";
import { toast } from "sonner";

export default function HeaderManagementDashboard() {
  // State management
  const [headerData, setHeaderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form validation
  const isFormValid = title.trim() && selectedFile;

  // Fetch existing header data on component mount
  useEffect(() => {
    fetchHeaderData();
  }, []);

  // Generate preview URL when file is selected
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [selectedFile]);

  // Fetch current header data from API
  const fetchHeaderData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/image", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHeaderData(data);
      } else if (response.status === 404) {
        setHeaderData(null);
      }
    } catch (error) {
      console.error("Error fetching header data:", error);
      showMessage("error", "Failed to fetch header data");
    }
    setLoading(false);
  };

  const { data, isPending, refetch } = useQuery({
    queryKey: ["header"],
    queryFn: () => getHeader(),
  });

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
        "image/svg+xml",
      ];
      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
        showMessage("", "");
      } else {
        showMessage(
          "error",
          "Please select a valid image file (JPEG, PNG, WebP, SVG)"
        );
        setSelectedFile(null);
      }
    }
  };

  const { mutate, isPending: isUploading } = useMutation({
    mutationKey: ["upload"],
    mutationFn: (payload: FormData) => postHeader(payload),
    onSuccess: (data) => {
      if (data?.data) {
        toast.success("Image uploaded successfully");
        refetch();
      }
      toast.success("Image uploaded Fail");
    },
  });
  const { mutate: DeleteTitle, isPending: isDeletePending } = useMutation({
    mutationKey: ["upload"],
    mutationFn: (payload: string) => DeleteHeader(payload),
    onSuccess: (data) => {
      if (data?.data) {
        toast.success("Image Delete successfully");
        refetch();
      }
      toast.success("Image Delete Fail");
    },
  });

  // Handle form submission
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", selectedFile);
    mutate(formData);
  };

  // Handle deletion
  const handleDelete = async (id?: string) => {
    if (!id) return;

    DeleteTitle(id);
  };

  // Show message helper

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200/60 backdrop-blur-sm">
            <Crown className="h-5 w-5 text-indigo-600" />
            <span className="text-indigo-700 font-semibold">
              Header Management
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Company Header Settings
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Manage your company logo and branding that appears in the website
            header
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/60 shadow-xl">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                Update Header Content
              </CardTitle>
              <p className="text-slate-600 mt-2">
                Upload your company logo and set the display title for your
                website header
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <form onSubmit={handleUpload} className="space-y-6">
                {/* Company Title Input */}
                <div className="space-y-3">
                  <Label
                    htmlFor="title"
                    className="text-base font-semibold text-slate-700 flex items-center gap-2"
                  >
                    <Building2 className="h-4 w-4" />
                    Company Name *
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your company name..."
                    className="text-lg py-3 px-4 border-2 focus:border-blue-400 rounded-xl"
                    required
                  />
                  <p className="text-sm text-slate-500">
                    This will appear next to your logo in the header
                  </p>
                </div>

                {/* File Upload */}
                <div className="space-y-3">
                  <Label
                    htmlFor="file-input"
                    className="text-base font-semibold text-slate-700 flex items-center gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Company Logo *
                  </Label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl  p-10 transition-colors duration-300">
                    <Input
                      id="file-input"
                      type="file"
                      onChange={handleFileChange}
                      accept="image/jpeg,image/png,image/jpg,image/webp,image/svg+xml"
                      className="w-full  file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
                      required
                    />
                  </div>
                  <p className="text-sm text-slate-500">
                    Recommended: PNG or SVG format, max 2MB, square or landscape
                    aspect ratio
                  </p>
                </div>

                {/* File Preview */}
                {selectedFile && (
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 mb-1">
                          Selected File
                        </h4>
                        <p className="text-blue-700 text-sm">
                          {selectedFile.name}
                        </p>
                        <p className="text-blue-600 text-xs">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    {previewUrl && (
                      <div className="relative w-full h-32 bg-white rounded-lg overflow-hidden border-2 border-white">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold text-lg py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Updating Header...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5" />
                      Update Header Content
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Current Header Preview */}
          <div className="space-y-6">
            {/* Live Preview */}
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/60 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Eye className="h-6 w-6 text-green-600" />
                  Header Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isPending ? (
                  <div className="flex items-center justify-center p-12">
                    <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                ) : data?.data ? (
                  <div className="space-y-4">
                    {/* Preview Header */}
                    <div className="p-6 bg-white rounded-xl border-2 border-slate-200 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                          <Image
                            src={data?.data?.imageUrl}
                            alt={data?.data?.title}
                            className="w-full h-full object-contain"
                            width={100}
                            height={100}
                          />
                        </div>
                        <span className="font-bold text-lg text-slate-900">
                          {data?.data?.title}
                        </span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="text-sm text-slate-600 space-y-1">
                        <p>
                          <span className="font-medium">Company:</span>{" "}
                          {data?.data?.title}
                        </p>
                        <p>
                          <span className="font-medium">Last updated:</span>{" "}
                          {new Date(
                            data?.data?.createdAt || Date.now()
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(data?.data?._id)}
                      disabled={isDeletePending}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl"
                    >
                      {deleting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Removing...
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
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <Building2 className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">
                      No Header Content Set
                    </h3>
                    <p className="text-slate-500">
                      Upload your company logo and set the title to get started.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Best Practices
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    Use high-quality PNG or SVG files for crisp display
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    Keep file size under 2MB for fast loading
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    Square or landscape logos work best
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    Use a memorable, concise company name
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
