"use client";
import { useState, type FormEvent } from "react";
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
import { Badge } from "@/components/ui/badge";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Crown,
  AlertCircle,
  CheckCircle,
  UserPlus,
  Shield,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  createDashboardUser,
  deleteUSer,
  getAllThePlans,
  getAllUser,
  postAdminSub,
} from "@/actions/fetch-action";
import { toast } from "sonner";

const accountTypeMeta = {
  admin: {
    label: "Admin",
    className: "border-amber-200 bg-amber-100 text-amber-800",
  },
  user: {
    label: "User",
    className: "border-blue-200 bg-blue-100 text-blue-800",
  },
  editor: {
    label: "Editor",
    className: "border-violet-200 bg-violet-100 text-violet-800",
  },
} as const;

type CreateAccountFormState = {
  name: string;
  email: string;
  password: string;
  type: "admin" | "user";
};

type DashboardUser = {
  _id: string;
  name: string;
  email: string;
  type: "user" | "admin" | "editor";
  plan?: string;
  createdAt?: string;
};

type SubscriptionPlan = {
  _id: string;
  title: string;
  priceCents: number;
};

type PaginatedUsersData = {
  data: DashboardUser[];
  totalPages: number;
  totalDocs: number;
  currentPage: number;
};

const createAccountDefaults: CreateAccountFormState = {
  name: "",
  email: "",
  password: "",
  type: "admin",
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, isLoading }) => {
  const getPageNumbers = () => {
    const pages: number[] = [];
    const showPages = 5; // Show 5 page numbers at most

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
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-slate-600">
        Page {currentPage} of {totalPages}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          className="h-8 w-8 p-0"
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
            className="h-8 w-8 p-0"
          >
            {pageNum}
          </Button>
        ))}

        {totalPages > 5 && currentPage < totalPages - 2 && (
          <>
            <MoreHorizontal className="h-4 w-4 text-slate-400" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={isLoading}
              className="h-8 w-8 p-0"
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
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default function UserManagementDashboard() {
  const queryClient = useQueryClient();

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [userTypeFilter, setUserTypeFilter] = useState<
    "all" | "admin" | "user"
  >("all");
  const [createAccountModal, setCreateAccountModal] = useState(false);
  const [subscriptionModal, setSubscriptionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DashboardUser | null>(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [createAccountForm, setCreateAccountForm] =
    useState<CreateAccountFormState>(createAccountDefaults);

  // Form states
  const [subscriptionType, setSubscriptionType] = useState("");
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const { data: subscriptionTypes = [] } = useQuery<SubscriptionPlan[]>({
    queryKey: ["plans"],
    queryFn: async () => {
      const result = await getAllThePlans();
      console.log("getAllThePlans result:", result);
      if (result.error) {
        throw new Error(result.error.message || "Failed to load plans");
      }
      const plansData = result.data;
      console.log("plansData raw:", plansData);
      if (Array.isArray(plansData)) {
        return plansData;
      }
      if (plansData && typeof plansData === 'object' && Array.isArray(plansData.data)) {
        return plansData.data;
      }
      console.log("plansData returning empty array, unexpected format");
      return [];
    },
  });

  // Fetch users with React Query
  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery<PaginatedUsersData>({
    queryKey: ["users", currentPage, userTypeFilter],
    queryFn: async () => {
      const result = await getAllUser(
        currentPage,
        10,
        userTypeFilter === "all" ? undefined : userTypeFilter,
      );
      if (result.error) {
        throw new Error(result.error.message || "Failed to load users");
      }

      return (
        result.data ?? {
          data: [],
          totalPages: 1,
          totalDocs: 0,
          currentPage,
        }
      );
    },

    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createAccountMutation = useMutation({
    mutationFn: async (payload: CreateAccountFormState) => {
      const result = await createDashboardUser(payload);
      if (result.error) {
        throw new Error(result.error.message || "Failed to create account");
      }

      return result.data;
    },
    onSuccess: (_, variables) => {
      showMessage(
        "success",
        `${variables.type === "admin" ? "Admin" : "User"} account created successfully!`,
      );
      setCreateAccountModal(false);
      resetCreateAccountForm();
      setCurrentPage(1);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (mutationError) => {
      showMessage("error", mutationError.message);
    },
  });

  // Add subscription mutation
  const addSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionData: Record<string, unknown>) => {
      const result = await postAdminSub(subscriptionData);
      if (result.error) {
        throw new Error(result.error.message || "Failed to add subscription");
      }

      return result.data;
    },
    onSuccess: () => {
      showMessage("success", "Subscription added successfully!");
      setSubscriptionModal(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (mutationError) => {
      showMessage("error", mutationError.message);
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const result = await deleteUSer(userId);
      if (result.error) {
        throw new Error(result.error.message || "Failed to delete user");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      return toast.success("User deleted successfully");
    },
    onError: (mutationError) => {
      showMessage("error", mutationError.message);
    },
  });

  // Handle add subscription
  const handleAddSubscription = async () => {
    if (!selectedUser || !subscriptionType || !endDate) {
      showMessage("error", "Please fill in all required fields");
      return;
    }

    // Validate end date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (endDate < today) {
      showMessage("error", "End date cannot be in the past");
      return;
    }

    const subscriptionData = {
      userId: selectedUser._id as string,
      subscriptionType: subscriptionType,
      startedDate: new Date().toISOString().split("T")[0],
      endDate: format(endDate, "yyyy-MM-dd"),
    };
    console.log("subscription-data->", subscriptionData);

    addSubscriptionMutation.mutate(subscriptionData);
  };

  const handleCreateAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = createAccountForm.name.trim();
    const email = createAccountForm.email.trim().toLowerCase();

    if (!name || !email || !createAccountForm.password) {
      showMessage("error", "Please fill in all required fields");
      return;
    }

    if (createAccountForm.password.length < 6) {
      showMessage("error", "Password must be at least 6 characters");
      return;
    }

    createAccountMutation.mutate({
      ...createAccountForm,
      name,
      email,
    });
  };

  // Handle delete user
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

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleFilterChange = (value: "all" | "admin" | "user") => {
    setUserTypeFilter(value);
    setCurrentPage(1);
  };

  const handleCreateAccountModalChange = (open: boolean) => {
    setCreateAccountModal(open);
    if (!open) {
      resetCreateAccountForm();
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedUser(null);
    setSubscriptionType("");
    setEndDate(undefined);
  };

  const resetCreateAccountForm = () => {
    setCreateAccountForm(createAccountDefaults);
  };

  // Show message helper
  const showMessage = (type, text) => {
    setMessage({ type, text });
    if (text) {
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Get subscription type name
  const getSubscriptionTypeName = (typeId) => {
    const type = Array.isArray(subscriptionTypes) ? subscriptionTypes.find((t) => t._id === typeId) : undefined;
    return type ? type.title : "Unknown Plan";
  };

  const getAccountBadgeClassName = (type = "user") => {
    return (
      accountTypeMeta[type as keyof typeof accountTypeMeta]?.className ||
      accountTypeMeta.user.className
    );
  };

  const getAccountLabel = (type = "user") => {
    return (
      accountTypeMeta[type as keyof typeof accountTypeMeta]?.label ||
      accountTypeMeta.user.label
    );
  };

  const users = usersData?.data || [];
  const totalPages = usersData?.totalPages || 1;
  const totalDocs = usersData?.totalDocs || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-lime-100 to-lime-100 border border-lime-200/60 backdrop-blur-sm">
            <Shield className="h-5 w-5 text-lime-600" />
            <span className="text-lime-700 font-semibold">Admin Dashboard</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-lime-600 to-lime-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Manage admins, users, subscriptions, and account permissions
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <Alert
            className={`max-w-4xl mx-auto ${
              message.type === "success"
                ? "bg-lime-50 border-lime-200 text-lime-800"
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

        {/* Users Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-slate-200/60 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-200/60">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lime-500 to-lime-600 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    All Accounts
                  </h2>
                  <p className="text-slate-600">
                    Matching accounts: {totalDocs}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="w-full sm:w-[180px]">
                  <Select
                    value={userTypeFilter}
                    onValueChange={handleFilterChange}
                  >
                    <SelectTrigger className="border-slate-300 bg-white">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All accounts</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                      <SelectItem value="user">Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => setCreateAccountModal(true)}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center p-12">
              <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-medium">Error loading accounts</p>
              <p className="text-slate-500 text-sm">{error?.message}</p>
            </div>
          )}

          {/* Table */}
          {!isLoading && !error && (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-slate-50/50">
                    <TableHead className="font-semibold text-slate-700">
                      Name
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Email
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Type
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Subscription
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Joined
                    </TableHead>
                    <TableHead className="text-center font-semibold text-slate-700">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-10 text-center text-slate-500"
                      >
                        No{" "}
                        {userTypeFilter === "all"
                          ? "accounts"
                          : `${userTypeFilter} accounts`}{" "}
                        found.
                      </TableCell>
                    </TableRow>
                  )}

                  {users.map((user) => (
                    <TableRow
                      key={user._id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-semibold",
                            getAccountBadgeClassName(user.type),
                          )}
                        >
                          {getAccountLabel(user.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.plan ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-lime-100 text-lime-800">
                            <Crown className="h-3 w-3 mr-1" />
                            {getSubscriptionTypeName(user.plan)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                            No Plan
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          {user.type === "user" ? (
                            <Button
                              onClick={() => {
                                setSelectedUser(user);
                                setSubscriptionModal(true);
                              }}
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-1"
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Add Plan
                            </Button>
                          ) : (
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-semibold",
                                getAccountBadgeClassName(user.type),
                              )}
                            >
                              {getAccountLabel(user.type)} account
                            </Badge>
                          )}
                          <Button
                            onClick={() =>
                              handleDeleteUser(user._id, user.name)
                            }
                            variant="destructive"
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-1"
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

              {/* Pagination Component */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            </>
          )}
        </div>

        <Dialog
          open={createAccountModal}
          onOpenChange={handleCreateAccountModalChange}
        >
          <DialogContent className="sm:max-w-[520px]">
            <form onSubmit={handleCreateAccount}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Shield className="h-6 w-6 text-slate-800" />
                  Create Account
                </DialogTitle>
                <DialogDescription>
                  Add another admin or user directly from the dashboard.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label htmlFor="create-account-name">Full Name *</Label>
                  <Input
                    id="create-account-name"
                    value={createAccountForm.name}
                    onChange={(event) =>
                      setCreateAccountForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Enter full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-account-email">Email *</Label>
                  <Input
                    id="create-account-email"
                    type="email"
                    value={createAccountForm.email}
                    onChange={(event) =>
                      setCreateAccountForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-account-password">Password *</Label>
                  <Input
                    id="create-account-password"
                    type="password"
                    value={createAccountForm.password}
                    onChange={(event) =>
                      setCreateAccountForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    placeholder="Minimum 6 characters"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Account Type *</Label>
                  <Select
                    value={createAccountForm.type}
                    onValueChange={(value: "admin" | "user") =>
                      setCreateAccountForm((current) => ({
                        ...current,
                        type: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCreateAccountModalChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createAccountMutation.isPending}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                >
                  {createAccountMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </div>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      {createAccountForm.type === "admin"
                        ? "Create Admin"
                        : "Create User"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Subscription Modal */}
        <Dialog
          open={subscriptionModal}
          onOpenChange={(open) => {
            setSubscriptionModal(open);
            if (!open) {
              resetForm();
            }
          }}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <UserPlus className="h-6 w-6 text-blue-600" />
                Add Subscription
              </DialogTitle>
              <DialogDescription>
                Add a subscription plan for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* User Info */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
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
                <Label
                  htmlFor="subscription-type"
                  className="text-base font-medium"
                >
                  Subscription Plan *
                </Label>
                <Select
                  value={subscriptionType}
                  onValueChange={setSubscriptionType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subscription plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(subscriptionTypes) && subscriptionTypes.map((type) => (
                      <SelectItem key={type._id} value={type._id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{type?.title}</span>
                          <span className="text-sm text-slate-500 ml-4">
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
                <Label className="text-base font-medium">End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground",
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
                  <PopoverContent className="w-auto p-0">
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
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Start Date:</strong> Today (
                  {format(new Date(), "PPP")})
                </p>
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSubscriptionModal(false);
                  resetForm();
                }}
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
                className="bg-blue-600 hover:bg-blue-700"
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
    </div>
  );
}
