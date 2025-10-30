"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download, Users, Eye, ExternalLink } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useQuery } from "@tanstack/react-query";
import { getOneEvent } from "@/actions/fetch-action";

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const qrCodeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // QR Code color state
  const [qrColor, setQrColor] = useState("#000000");
  const [qrBgColor, setQrBgColor] = useState("#FFFFFF");

  // Fetch event data
  const { data: eventData, isLoading } = useQuery({
    queryKey: ["event-details", eventId],
    queryFn: () => getOneEvent(eventId),
    enabled: !!eventId,
  });

  console.log("eventData", eventData);

  const event = eventData?.data;

  const handleDownloadQrCode = () => {
    if (!qrCodeCanvasRef.current) return;
    const url = qrCodeCanvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event?.name || "event"}-qrcode.png`;
    a.click();
  };

  const handleManageEvent = () => {
    router.push(
      `/dashboard/events/${eventId}?venueWidth=${event?.width}&venueHeight=${event?.height}`
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Event not found</p>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/public-view/event/${eventId}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {event.name}
          </h1>
          <p className="text-gray-600">{event.date}</p>
          {event.location && (
            <p className="text-sm text-gray-500 mt-1">{event.location}</p>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: QR Code Card */}
          <Card className="border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Event QR Code
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadQrCode}
                className="text-xs"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download
              </Button>
            </div>

            {/* QR Code Display */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 flex justify-center mb-4">
              <QRCodeCanvas
                value={shareUrl}
                ref={qrCodeCanvasRef}
                size={240}
                level="H"
                marginSize={5}
                bgColor={qrBgColor}
                fgColor={qrColor}
              />
            </div>

            {/* Color Customization */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm text-gray-700">QR Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    className="h-9 w-16 rounded border border-gray-300 cursor-pointer"
                  />
                  <span className="text-xs text-gray-500 font-mono">
                    {qrColor.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm text-gray-700">Background</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={qrBgColor}
                    onChange={(e) => setQrBgColor(e.target.value)}
                    className="h-9 w-16 rounded border border-gray-300 cursor-pointer"
                  />
                  <span className="text-xs text-gray-500 font-mono">
                    {qrBgColor.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Share this QR code with your guests or print it for display at
              your venue
            </p>
          </Card>

          {/* Right: Quick Actions Card */}
          <Card className="border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>

            <div className="space-y-3">
              {/* Manage Guest List */}
              <Button
                onClick={handleManageEvent}
                className="w-full bg-blue-800 hover:bg-blue-900 text-white h-11 justify-start"
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Guest List
              </Button>

              {/* View Live Site */}
              <Button
                variant="outline"
                asChild
                className="w-full h-11 justify-start border-gray-300 hover:bg-gray-50"
              >
                <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4 mr-2" />
                  View Live Site
                </a>
              </Button>
            </div>

            {/* Event Details */}
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Event Details
              </h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Venue Size:</span>
                <span className="font-medium text-gray-900">
                  {event.width}m × {event.height}m
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Area:</span>
                <span className="font-medium text-gray-900">
                  {event.width * event.height}m²
                </span>
              </div>
            </div>

            {/* Share Link */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <Label className="text-sm text-gray-700 mb-2 block">
                Share Link
              </Label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    // Optional: Add toast notification
                  }}
                  className="flex-shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
