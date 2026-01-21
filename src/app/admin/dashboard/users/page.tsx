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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Crown,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  UserCircle,
  TrendingUp,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  deleteUSer,
  getAllThePlans,
  getAllUser,
  postAdminSub,
} from "@/actions/fetch-action";
import { toast } from "sonner";

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, isLoading }) => {
  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50/50">
      <div className="text-sm font-medium text-slate-600">
        Page <span className="text-slate-900">{currentPage}</span> of{" "}
        <span className="text-slate-900">{totalPages}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          className="h-9 w-9 p-0 border-slate-300 hover:bg-slate-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getPageNumbers().map((pageNum) => (
          <Button
            key={pageNum}
            variant={currentPage === pageNum ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(pageNum)}
            disabled={isLoading}
            className={cn(
              "h-9 w-9 p-0",
              currentPage === pageNum
                ? "bg-lime-600 hover:bg-lime-700 text-white border-lime-600"
                : "border-slate-300 hover:bg-slate-100",
            )}
          >
            {pageNum}
          </Button>
        ))}

        {totalPages > 5 && currentPage < totalPages - 2 && (
          <>
            <MoreHorizontal className="h-4 w-4 text-slate-400 mx-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={isLoading}
              className="h-9 w-9 p-0 border-slate-300 hover:bg-slate-100"
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          className="h-9 w-9 p-0 border-slate-300 hover:bg-slate-100"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default function UserManagementDashboard() {
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [subscriptionModal, setSubscriptionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [subscriptionType, setSubscriptionType] = useState("");
  const [endDate, setEndDate] = useState();

  const { data: subscriptionTypes } = useQuery({
    queryKey: ["plans"],
    queryFn: () => getAllThePlans(),
  });

  const {
    data: usersData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["users", currentPage],
    queryFn: () => getAllUser(currentPage, 10),
    staleTime: 5 * 60 * 1000,
  });

  const addSubscriptionMutation = useMutation({
    mutationFn: (subscriptionData: Record<string, unknown>) =>
      postAdminSub(subscriptionData),
    onSuccess: () => {
      toast.success("Subscription added successfully!");
      setSubscriptionModal(false);
      resetForm();
      queryClient.invalidateQueries(["users"]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add subscription");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteUSer(userId),
    onSuccess: (data) => {
      if (data?.data) {
        queryClient.invalidateQueries(["users"]);
        return toast.success("User deleted successfully");
      }
      return toast.error("User deletion failed");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  const handleAddSubscription = async () => {
    if (!selectedUser || !subscriptionType || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (endDate < today) {
      toast.error("End date cannot be in the past");
      return;
    }

    const subscriptionData = {
      userId: selectedUser._id as string,
      subscriptionType: subscriptionType,
      startedDate: new Date().toISOString().split("T")[0],
      endDate: format(endDate, "yyyy-MM-dd"),
    };

    addSubscriptionMutation.mutate(subscriptionData);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (
      !confirm(
        `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }
    deleteUserMutation.mutate(userId);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const resetForm = () => {
    setSelectedUser(null);
    setSubscriptionType("");
    setEndDate(undefined);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getSubscriptionTypeName = (typeId) => {
    const type = subscriptionTypes?.data?.find((t) => t._id === typeId);
    return type ? type.title : "Unknown Plan";
  };

  const users = usersData?.data?.data || [];
  const totalPages = usersData?.data?.totalPages || 1;
  const totalDocs = usersData?.data?.totalDocs || 0;
  const activeSubscriptions = users.filter((u) => u.plan).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      {/* Header Section */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-lime-500 to-lime-600 shadow-lg shadow-lime-500/30">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                User Management
              </h1>
              <p className="text-sm text-slate-600">
                Manage users, subscriptions, and account permissions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {totalDocs}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Active Subscriptions
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {activeSubscriptions}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-lime-100 flex items-center justify-center">
                  <Crown className="h-7 w-7 text-lime-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Free Users
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {totalDocs - activeSubscriptions}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center">
                  <UserCircle className="h-7 w-7 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Current Page
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {currentPage} / {totalPages}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="h-7 w-7 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table Card */}
        <Card className="border-slate-200 bg-white shadow-md">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  All Users
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Showing {users.length} of {totalDocs} users
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lime-50 border border-lime-200">
                <div className="h-2 w-2 rounded-full bg-lime-500 animate-pulse" />
                <span className="text-sm font-medium text-lime-700">
                  Live Data
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center p-12">
                <div className="w-12 h-12 border-3 border-lime-200 border-t-lime-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-600 font-medium">Loading users...</p>
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-red-600 font-semibold text-lg mb-2">
                  Error loading users
                </p>
                <p className="text-slate-500 text-sm">{error?.message}</p>
              </div>
            )}

            {/* Table */}
            {!isLoading && !isError && (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-slate-200">
                        <TableHead className="font-semibold text-slate-700 h-12">
                          User
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 h-12">
                          Email
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 h-12">
                          Subscription
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 h-12">
                          Joined
                        </TableHead>
                        <TableHead className="text-center font-semibold text-slate-700 h-12">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user, index) => (
                        <TableRow
                          key={user._id}
                          className={cn(
                            "hover:bg-slate-50 transition-colors border-b border-slate-100",
                            index === users.length - 1 && "border-b-0",
                          )}
                        >
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lime-500 to-lime-600 flex items-center justify-center text-white font-semibold shadow-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-slate-900">
                                {user.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600 py-4">
                            {user.email}
                          </TableCell>
                          <TableCell className="py-4">
                            {user.plan ? (
                              <Badge className="bg-lime-100 text-lime-700 hover:bg-lime-200 border-lime-200">
                                <Crown className="h-3 w-3 mr-1" />
                                {getSubscriptionTypeName(user.plan)}
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="bg-slate-100 text-slate-600 hover:bg-slate-200"
                              >
                                Free
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-600 py-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-slate-400" />
                              {formatDate(user.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setSubscriptionModal(true);
                                }}
                                size="sm"
                                className="bg-lime-600 hover:bg-lime-700 text-white h-9"
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Add Plan
                              </Button>
                              <Button
                                onClick={() =>
                                  handleDeleteUser(user._id, user.name)
                                }
                                variant="destructive"
                                size="sm"
                                className="bg-red-500 hover:bg-red-600 h-9"
                                disabled={deleteUserMutation.isPending}
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

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  isLoading={isLoading}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Subscription Modal */}
      <Dialog open={subscriptionModal} onOpenChange={setSubscriptionModal}>
        <DialogContent className="sm:max-w-[540px] border-slate-200">
          <DialogHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-lime-100 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-lime-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-slate-900">
                  Add Subscription
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  Assign a subscription plan to {selectedUser?.name}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* User Info Card */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lime-500 to-lime-600 flex items-center justify-center text-white font-semibold shadow-sm">
                  {selectedUser?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {selectedUser?.name}
                  </p>
                  <p className="text-sm text-slate-600">
                    {selectedUser?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Subscription Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900">
                Subscription Plan *
              </Label>
              <Select
                value={subscriptionType}
                onValueChange={setSubscriptionType}
              >
                <SelectTrigger className="h-11 border-slate-300 focus:border-lime-500 focus:ring-lime-500/20">
                  <SelectValue placeholder="Select a subscription plan" />
                </SelectTrigger>
                <SelectContent>
                  {subscriptionTypes?.data?.map((type) => (
                    <SelectItem key={type._id} value={type._id}>
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{type?.title}</span>
                        <span className="text-sm text-lime-600 font-semibold ml-4">
                          ${type?.priceCents / 100}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-900">
                End Date *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-11 justify-start text-left font-normal border-slate-300 hover:bg-slate-50",
                      !endDate && "text-slate-500",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, "PPP")
                    ) : (
                      <span>Pick an end date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Start Date Info */}
            <div className="p-4 bg-lime-50 rounded-lg border border-lime-200">
              <div className="flex items-start gap-2">
                <CalendarIcon className="h-4 w-4 text-lime-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-lime-900">
                    Start Date
                  </p>
                  <p className="text-sm text-lime-700 mt-0.5">
                    Today - {format(new Date(), "PPP")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 border-t border-slate-100 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSubscriptionModal(false);
                resetForm();
              }}
              className="border-slate-300 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSubscription}
              disabled={
                !subscriptionType ||
                !endDate ||
                addSubscriptionMutation.isPending
              }
              className="bg-lime-600 hover:bg-lime-700 text-white"
            >
              {addSubscriptionMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Subscription
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
