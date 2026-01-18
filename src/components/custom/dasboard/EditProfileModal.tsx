"use client";

import { useState, useRef, Dispatch, SetStateAction, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, Eye, EyeOff, User2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { getUserInfo } from "@/actions/auth";
import { useMutation } from "@tanstack/react-query";
import { updateProfileInformation } from "@/actions/profileInformation";
type User = {
  name?: string;
  email?: string;
  password?: string;
  profile?: File; // URL
  thumbnail?: File; // URL
};
interface EditProfileModalProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
}

export function EditProfileModal({
  open,
  onOpenChange,
}: EditProfileModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const getuserInfo = async () => {
    const info = await getUserInfo();

    setFormData({
      name: info.name,
      email: info.email,
      password: "",
    });
    setPreviewImage(info.profile ?? null);
  };
  useEffect(() => {
    getuserInfo();
  }, []);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      setProfileFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const { mutate, isPending: isLoading } = useMutation({
    mutationKey: ["post-profile-thumbnail"],
    mutationFn: (payload: User) => updateProfileInformation(payload),
    onSuccess: async (data) => {
      if (data?.error) return toast.error(data?.error?.message);

      console.log("user-updated-data", data);
      await getuserInfo();
      onOpenChange(false);
      toast.success("Profile updated successfully");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: User = {
      ...(formData.email.trim() && { email: formData.email }),
      ...(formData.name.trim() && { name: formData.name }),
      ...(formData.password.trim() && { password: formData.password }),
      ...(profileFile && { profile: profileFile }),
    };
    mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Edit Profile
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-base pt-1">
            Update your profile information and photo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center gap-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />

              {/* Image Preview */}
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-lime-400 to-lime-600">
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt="Profile preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <User2 className="h-16 w-16 text-white" />
                  </div>
                )}

                {/* Upload Button Overlay */}
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="absolute inset-0 bg-black/40 hover:bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                >
                  <Camera className="h-8 w-8 text-white" />
                </button>
              </div>

              <Button
                type="button"
                onClick={handleImageClick}
                variant="outline"
                size="sm"
                className="border-lime-600 text-lime-700 hover:bg-lime-50"
              >
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-900"
              >
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="h-11 border-gray-300 focus:border-lime-600 focus:ring-lime-600"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-900"
              >
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="h-11 border-gray-300 focus:border-lime-600 focus:ring-lime-600"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-900"
              >
                New Password
                <span className="text-xs font-normal text-gray-500 ml-2">
                  (Leave blank to keep current)
                </span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="h-11 border-gray-300 focus:border-lime-600 focus:ring-lime-600 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1 sm:flex-none border-gray-300 hover:bg-gray-50 h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-none bg-lime-600 hover:bg-lime-700 text-white h-11 px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
