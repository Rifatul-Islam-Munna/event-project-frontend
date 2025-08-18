import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Construction } from "lucide-react"

export function SeatingChartTab() {
  return (
    <Card className="border-none bg-transparent p-0">
      {" "}
      {/* Removed border and padding */}
      <CardHeader className="px-0 pt-0 pb-4">
        {" "}
        {/* Adjusted padding */}
        <CardTitle className="text-xl font-bold text-foreground">Seating Chart</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Construction className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-lg text-muted-foreground">Interactive Seating Chart Builder Coming Soon!</p>
        <p className="text-sm text-muted-foreground mt-2">
          This section will allow you to drag and drop tables, assign guests, and visualize your event layout.
        </p>
      </CardContent>
    </Card>
  )
}
