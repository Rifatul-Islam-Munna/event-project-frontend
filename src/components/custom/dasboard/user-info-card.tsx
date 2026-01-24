"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User2,
  ShieldCheck,
  Crown,
  Camera,
  Edit2,
  LayoutTemplate,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { getUserInfo } from "@/actions/auth";
import { User } from "@/@types/user-types";
import Link from "next/link";
import { format, parseISO, isAfter } from "date-fns";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { updateProfileInformation } from "@/actions/profileInformation";
import { toast } from "sonner";
import { EditProfileModal } from "./EditProfileModal";

export function UserInfoCard() {
  const [user, setUser] = useState<User | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const getuserInfo = async () => {
    const info = await getUserInfo();
    setUser(info);
    const savedImage = localStorage.getItem(`user-profile-${info?.id}`);
    if (savedImage) {
      setProfileImage(savedImage);
    }
  };
  useEffect(() => {
    getuserInfo();
  }, []);

  const isSubscriptionActive = user?.subscription?.endDate
    ? isAfter(new Date(user.subscription.endDate), new Date())
    : false;

  const formattedDate = user?.subscription?.endDate
    ? format(parseISO(user.subscription.endDate), "d MMMM, yyyy")
    : null;

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const { mutate, isPending } = useMutation({
    mutationKey: ["post-profile-thumbnail"],
    mutationFn: (file: File) => updateProfileInformation({ thumbnail: file }),
    onSuccess: async (data) => {
      if (data?.error) return toast.error(data?.error?.message);

      console.log("user-updated-data", data);
      await getuserInfo();
    },
  });
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      mutate(file);
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  console.log("user-info", user);

  return (
    <Card className="border border-gray-200 shadow-none border-none bg-white overflow-hidden w-full">
      <EditProfileModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Profile Image */}
          <div className="relative w-full md:w-80 h-64 bg-gradient-to-br from-lime-400 to-lime-600 flex-shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />

            {user?.thumbnail ? (
              <Image
                src={user?.thumbnail}
                alt={user?.name || "User"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                  <User2 className="h-16 w-16 text-white" />
                </div>
              </div>
            )}

            {/* Change Photo Button */}
            <Button
              onClick={handleImageClick}
              size="sm"
              className="absolute top-4 left-4 bg-gray-900/60 hover:bg-gray-900/80 text-white backdrop-blur-sm border-0"
            >
              <Camera className="h-4 w-4 mr-2" />
              Change
            </Button>
          </div>

          {/* Right Side - User Info */}
          <div className="flex-1 flex flex-col justify-between p-6 md:px-6">
            {/* Top Section - Name & Edit */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {user?.name}
                </h2>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
              <Button
                size="sm"
                className="bg-lime-600 hover:bg-lime-700 text-white ml-4"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>

            {/* Subscription Info */}
            {user?.subscription?.endDate && (
              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-sm text-gray-600">
                    {isSubscriptionActive ? "Active until" : "Expired on"}
                  </span>
                  <span className="text-base font-semibold text-gray-900">
                    {formattedDate}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      isSubscriptionActive ? "bg-lime-600" : "bg-red-500"
                    }`}
                    style={{
                      width: isSubscriptionActive ? "100%" : "0%",
                    }}
                  />
                </div>

                {/* Renew Button */}
                {!isSubscriptionActive && (
                  <Link href="/#pricing">
                    <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white h-10">
                      <Crown className="h-4 w-4 mr-2" />
                      Renew Subscription
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* Bottom Section - Account Info */}
            <div className="space-y-2">
              {/* Account Type & Plan */}
              <div className="flex items-center justify-between text-sm py-2 border-t border-gray-200">
                <span className="text-gray-600">Account</span>
                <span className="font-medium text-gray-900">
                  {user?.type && (
                    <span className="capitalize">{user.type}</span>
                  )}
                  {/* {user?.subscription?.plan && (
                    <span className="text-lime-700 ml-2">
                      · {user.subscription.plan}
                    </span>
                  )} */}
                </span>
              </div>

              <div className=" w-full flex justify-between items-center gap-1">
                {/* Admin Dashboard */}
                {user?.type === "admin" && (
                  <Link href="/admin/dashboard/subscription" className="block">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-fit justify-start text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 h-9"
                    >
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                {user?.plan?.permissions?.includes("event.template") && (
                  <Link href={"/dashboard/template"}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-fit justify-start text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 h-9"
                    >
                      <LayoutTemplate className="h-4 w-4 mr-2" />
                      Explore Templates
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
