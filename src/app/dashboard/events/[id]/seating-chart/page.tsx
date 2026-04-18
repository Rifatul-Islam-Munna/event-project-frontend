import { Suspense } from "react";
import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";

const WeddingPlannerWrapper = dynamic(
  () => import("@/component/table-charts/wedding-planner"),
);

export default function EventSeatingChartPage() {
  return (
    <Suspense fallback={<Skeleton className="container h-dvh w-full" />}>
      <WeddingPlannerWrapper />
    </Suspense>
  );
}
