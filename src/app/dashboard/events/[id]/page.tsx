"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, LayoutGrid, Truck } from "lucide-react"; // Icons for tabs

import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GuestListTab } from "@/components/custom/events/guest-list-tab";
import { SeatingChartTab } from "@/components/custom/events/seating-chart-tab";
import { VendorManagementTab } from "@/components/custom/events/vendor-management-tab";
import { Guest, Vendor } from "@/@types/events-details";
import WeddingPlanner, {
  WeddingPlannerWrapper,
} from "@/component/table-charts/wedding-planner";
import { useStore } from "@/zustan-fn/save-alert";
import { toast } from "sonner";
import { User } from "@/@types/user-types";
import { getUserInfo } from "@/actions/auth";

export default function EventDetailsPage() {
  const params = useParams();
  const eventSlug = params.slug as string;
  const [tab, setTab] = useState("guests");
  const [user, SetUser] = useState<User | null>(null);
  useEffect(() => {
    const getuserInfo = async () => {
      const info = await getUserInfo();
      SetUser(info);
    };
    getuserInfo();
  }, []);
  // Static data for demonstration
  const [guests, setGuests] = useState<Guest[]>([
    {
      id: uuidv4(),
      name: "Alice Smith",
      email: "alice@example.com",
      phone: "111-222-3333",
      seat_number: 101,
      isAssigned: true,
    },
    {
      id: uuidv4(),
      name: "Bob Johnson",
      email: "bob@example.com",
      phone: "444-555-6666",
      seat_number: undefined,
      isAssigned: false,
    },
    {
      id: uuidv4(),
      name: "Charlie Brown",
      email: "charlie@example.com",
      phone: "777-888-9999",
      seat_number: 205,
      isAssigned: true,
    },
    {
      id: uuidv4(),
      name: "Diana Prince",
      email: "diana@example.com",
      phone: "123-456-7890",
      seat_number: undefined,
      isAssigned: false,
    },
    {
      id: uuidv4(),
      name: "Eve Adams",
      email: "eve@example.com",
      phone: "987-654-3210",
      seat_number: 302,
      isAssigned: true,
    },
    {
      id: uuidv4(),
      name: "Frank White",
      email: "frank@example.com",
      phone: "555-123-4567",
      seat_number: 102,
      isAssigned: true,
    },
    {
      id: uuidv4(),
      name: "Grace Lee",
      email: "grace@example.com",
      phone: "222-333-4444",
      seat_number: undefined,
      isAssigned: false,
    },
    {
      id: uuidv4(),
      name: "Henry Green",
      email: "henry@example.com",
      phone: "888-999-0000",
      seat_number: 201,
      isAssigned: true,
    },
    {
      id: uuidv4(),
      name: "Ivy King",
      email: "ivy@example.com",
      phone: "111-000-9999",
      seat_number: undefined,
      isAssigned: false,
    },
    {
      id: uuidv4(),
      name: "Jack Black",
      email: "jack@example.com",
      phone: "777-666-5555",
      seat_number: 301,
      isAssigned: true,
    },
    {
      id: uuidv4(),
      name: "Karen Blue",
      email: "karen@example.com",
      phone: "444-333-2222",
      seat_number: undefined,
      isAssigned: false,
    },
    {
      id: uuidv4(),
      name: "Liam Red",
      email: "liam@example.com",
      phone: "999-888-7777",
      seat_number: 103,
      isAssigned: true,
    },
    {
      id: uuidv4(),
      name: "Mia Yellow",
      email: "mia@example.com",
      phone: "000-111-2222",
      seat_number: undefined,
      isAssigned: false,
    },
    {
      id: uuidv4(),
      name: "Noah Purple",
      email: "noah@example.com",
      phone: "333-444-5555",
      seat_number: 202,
      isAssigned: true,
    },
    {
      id: uuidv4(),
      name: "Olivia Orange",
      email: "olivia@example.com",
      phone: "666-777-8888",
      seat_number: undefined,
      isAssigned: false,
    },
  ]);

  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: uuidv4(),
      name: "Catering Co.",
      email: "catering@example.com",
      whatsapp: "123-456-7890",
      reminder_message: "Confirm final headcount.",
      sent_status: false,
      number_of_reminder: 0,
      starting_date: "2025-09-01",
      end_date: "2025-09-10",
    },
    {
      id: uuidv4(),
      name: "Photography Studio",
      email: "photo@example.com",
      whatsapp: "098-765-4321",
      reminder_message: "Review shot list.",
      sent_status: true,
      number_of_reminder: 1,
      starting_date: "2025-08-20",
      end_date: "2025-09-14",
    },
  ]);

  const handleAddGuest = (newGuest: Omit<Guest, "id">) => {
    setGuests((prev) => [...prev, { id: uuidv4(), ...newGuest }]);
  };

  const handleUpdateGuest = (updatedGuest: Guest) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === updatedGuest.id ? updatedGuest : g))
    );
  };

  const handleDeleteGuest = (guestId: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
  };

  const handleAddVendor = (newVendor: Omit<Vendor, "id">) => {
    setVendors((prev) => [...prev, { id: uuidv4(), ...newVendor }]);
  };

  const handleUpdateVendor = (updatedVendor: Vendor) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === updatedVendor.id ? updatedVendor : v))
    );
  };

  const handleDeleteVendor = (vendorId: string) => {
    setVendors((prev) => prev.filter((v) => v.id !== vendorId));
  };
  const dataLength = useStore((state) => state.dataLength);
  const handleTabChange = (nextTab: string) => {
    console.log("dataLength->", dataLength);
    if (dataLength > 0) {
      toast.error("Please save your changes before switching tabs!");
      return;
    }
    setTab(nextTab);
  };
  return (
    <section className=" bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-dvh">
      <div className="container mx-auto py-8 px-4 md:px-6 space-y-8">
        <Card className="border border-gray-200/80 shadow-none  bg-transparent">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">
              Manage Event:
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {" "}
            {/* Remove padding from CardContent to allow TabsList to be flush */}
            <Tabs
              value={tab}
              onValueChange={handleTabChange}
              defaultValue="guests"
              className="w-full"
            >
              <TabsList className="sticky top-0 z-10 grid w-full grid-cols-3 border-b border-border bg-transparent rounded-none p-0 h-auto">
                <TabsTrigger
                  value="guests"
                  className="flex items-center gap-2  text-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-t-0 data-[state=active]:border-l-0 data-[state=active]:border-r-0 data-[state=active]:border-b-2  data-[state=active]:border-[hsl(185_70%_40%)] rounded-none py-3 px-4"
                >
                  <Users className="h-4 w-4" /> Guest List
                </TabsTrigger>
                <TabsTrigger
                  value="seating-chart"
                  className="flex items-center gap-2 text-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-t-0 data-[state=active]:border-l-0 data-[state=active]:border-r-0  data-[state=active]:border-b-2 data-[state=active]:border-[hsl(185_70%_40%)] rounded-none py-3 px-4"
                >
                  <LayoutGrid className="h-4 w-4" /> Seating Chart
                </TabsTrigger>
                {user?.plan?.permissions?.includes("vendor.manage") ? (
                  <TabsTrigger
                    value="vendors"
                    className="flex items-center gap-2 text-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-t-0 data-[state=active]:border-l-0 data-[state=active]:border-r-0  data-[state=active]:border-b-2 data-[state=active]:border-[hsl(185_70%_40%)] rounded-none py-3 px-4"
                  >
                    <Truck className="h-4 w-4" /> Vendors
                  </TabsTrigger>
                ) : null}
              </TabsList>
              <TabsContent
                value="guests"
                className="mt-0 p-6 border-none bg-transparent"
              >
                {" "}
                {/* Remove mt and border, add back padding */}
                <GuestListTab
                  guests={guests}
                  onAddGuest={handleAddGuest}
                  onUpdateGuest={handleUpdateGuest}
                  onDeleteGuest={handleDeleteGuest}
                />
              </TabsContent>
              <TabsContent
                value="seating-chart"
                className="mt-0 p-6 border-none"
              >
                <WeddingPlannerWrapper />
              </TabsContent>
              <TabsContent value="vendors" className="mt-0 p-6 border-none">
                {" "}
                {/* Remove mt and border, add back padding */}
                <VendorManagementTab
                  vendors={vendors}
                  onAddVendor={handleAddVendor}
                  onUpdateVendor={handleUpdateVendor}
                  onDeleteVendor={handleDeleteVendor}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
