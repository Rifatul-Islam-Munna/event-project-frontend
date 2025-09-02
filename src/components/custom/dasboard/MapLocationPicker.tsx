"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Nominatim API types
interface SearchResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

interface MapLocationPickerProps {
  onLocationSelect: (locationName: string) => void;
  initialLocation?: string;
}

export default function MapLocationPicker({
  onLocationSelect,
  initialLocation = "",
}: MapLocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState(initialLocation);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [currentMarker, setCurrentMarker] = useState<any>(null);

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      if (typeof window !== "undefined" && mapRef.current) {
        // Dynamically import Leaflet to avoid SSR issues
        const L = (await import("leaflet")).default;

        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        // Create map
        const mapInstance = L.map(mapRef.current);

        // Ask for user's location and center map there
        mapInstance.locate({ setView: true, maxZoom: 16 });

        // Handle successful location detection
        mapInstance.on("locationfound", function (e) {
          const radius = e.accuracy;

          // Add marker at user's location
          L.marker(e.latlng)
            .addTo(mapInstance)
            .bindPopup("You are within " + radius + " meters from this point")
            .openPopup();

          // Add accuracy circle
          L.circle(e.latlng, radius).addTo(mapInstance);
        });

        // Handle location error (user denies permission, etc.)
        mapInstance.on("locationerror", function (e) {
          console.log("Location error:", e.message);
          // Fallback to default location
          mapInstance.setView([23.8103, 90.4125], 10);
        });

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(mapInstance);

        // Handle map clicks
        mapInstance.on("click", async (e: any) => {
          const { lat, lng } = e.latlng;
          await handleMapClick(lat, lng, L, mapInstance);
        });

        setMap(mapInstance);
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  // Handle map click for reverse geocoding
  const handleMapClick = async (
    lat: number,
    lng: number,
    L: any,
    mapInstance: any
  ) => {
    try {
      // Remove previous marker
      if (currentMarker) {
        mapInstance.removeLayer(currentMarker);
      }

      // Add new marker
      const marker = L.marker([lat, lng]).addTo(mapInstance);
      setCurrentMarker(marker);

      // Reverse geocoding with Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );

      if (response.ok) {
        const data = await response.json();
        const locationName = data.display_name || "Unknown location";
        setSelectedLocation(locationName);

        // Add popup to marker
        marker
          .bindPopup(
            `
          <div class="p-2">
            <p class="font-semibold mb-2">Selected Location:</p>
            <p class="text-sm">${locationName}</p>
            <button onclick="window.selectThisLocation('${locationName}')" class="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs">
              Select This Location
            </button>
          </div>
        `
          )
          .openPopup();
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      toast.error("Failed to get location details");
    }
  };

  // Add global function for popup button
  useEffect(() => {
    (window as any).selectThisLocation = (locationName: string) => {
      onLocationSelect(locationName);
    };

    return () => {
      delete (window as any).selectThisLocation;
    };
  }, [onLocationSelect]);

  // Search locations using Nominatim
  const searchLocations = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5&addressdetails=1`
      );

      if (response.ok) {
        const data: SearchResult[] = await response.json();
        setSearchResults(data);
      } else {
        toast.error("Search failed");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed");
    }
    setIsSearching(false);
  };

  // Handle search result selection
  const handleSearchResultSelect = async (result: SearchResult) => {
    if (!map) return;

    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    // Move map to location
    map.setView([lat, lng], 15);

    // Remove previous marker
    if (currentMarker) {
      map.removeLayer(currentMarker);
    }

    // Add marker
    const L = (await import("leaflet")).default;
    const marker = L.marker([lat, lng]).addTo(map);
    setCurrentMarker(marker);

    // Set location
    setSelectedLocation(result.display_name);
    setSearchResults([]);

    // Add popup
    marker
      .bindPopup(
        `
      <div class="p-2">
        <p class="font-semibold mb-2">Selected Location:</p>
        <p class="text-sm">${result.display_name}</p>
        <button onclick="window.selectThisLocation('${result.display_name}')" class="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs">
          Select This Location
        </button>
      </div>
    `
      )
      .openPopup();
  };

  // Handle Enter key in search
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchLocations();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="mb-4 space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className="flex-1"
          />
          <Button onClick={searchLocations} disabled={isSearching} size="sm">
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-white border rounded-lg shadow-lg max-h-32 overflow-y-auto">
            {searchResults.map((result) => (
              <button
                key={result.place_id}
                onClick={() => handleSearchResultSelect(result)}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 border-b last:border-b-0 text-sm"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="truncate">{result.display_name}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Instructions */}
        <p className="text-xs text-slate-500">
          Search above or click anywhere on the map to pin a location
        </p>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative bg-slate-100 rounded-lg overflow-hidden">
        <div ref={mapRef} className="w-full h-full" />

        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-lg shadow-lg border">
            <div className="flex items-start gap-2 mb-3">
              <MapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 text-sm">
                  Selected Location:
                </p>
                <p className="text-xs text-slate-600 break-words">
                  {selectedLocation}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => onLocationSelect(selectedLocation)}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              Use This Location
            </Button>
          </div>
        )}
      </div>

      {/* Load Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin=""
      />
    </div>
  );
}
