"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, User, Mail, Trash2 } from "lucide-react";
import { EditSubscriptionDialog } from "./edit-subscription-dialog";
import { Subscription } from "@/@types/admin";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSubScribe } from "@/actions/fetch-action";
import { toast } from "sonner";

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  isLoading?: boolean;
  onEdit?: (id: string, startDate: string, endDate: string) => void;
  onDelete?: (id: string) => void;
}

export function SubscriptionTable({
  subscriptions,
  isLoading,
  onEdit,
  onDelete,
}: SubscriptionTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const query = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationKey: ["date-subscription"],
    mutationFn: (id: string) => deleteSubScribe(id),
    onSuccess: (data) => {
      if (data?.data) {
        toast.success("Subscription deleted successfully");
        query.refetchQueries({ queryKey: ["subscriptions"], exact: false });
        return;
      }

      toast.success("Subscription deleted error");
    },
  });
  const DeleteSub = (id: string) => {
    mutate(id);
  };

  const getStatusBadge = (endDate: string) => {
    const isActive = new Date(endDate) >= new Date();
    return (
      <Badge variant={isActive ? "default" : "destructive"}>
        {isActive ? "Active" : "Expired"}
      </Badge>
    );
  };

  const getSubscriptionTypeBadge = (type: string) => {
    const variants = {
      basic: "secondary",
      premium: "default",
      enterprise: "destructive",
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || "secondary"}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Subscription</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-muted-foreground"
              >
                No subscriptions found
              </TableCell>
            </TableRow>
          ) : (
            subscriptions.map((subscription) => (
              <TableRow key={subscription._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {subscription.userId.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {subscription.userId.name}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {subscription.userId.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getSubscriptionTypeBadge(subscription.subscriptionType)}
                </TableCell>
                <TableCell>{getStatusBadge(subscription.endDate)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(subscription.startedDate)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(subscription.endDate)}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(subscription.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && (
                      <EditSubscriptionDialog
                        subscription={subscription}
                        onSave={onEdit}
                      />
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => DeleteSub(subscription._id)}
                      className="text-destructive hover:text-destructive"
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
