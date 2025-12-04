"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { fetchAllBuoys, slugify, type Buoy } from "@/lib/api/buoys";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// Set token once globally
mapboxgl.accessToken = MAPBOX_TOKEN;

interface MarkerData {
  marker: mapboxgl.Marker;
  cleanup: () => void;
}

export default function BuoysMap() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] || "en";

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<MarkerData[]>([]);
  const mapLoaded = useRef(false);

  const [buoys, setBuoys] = useState<Buoy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch buoys data
  useEffect(() => {
    let isMounted = true;

    fetchAllBuoys()
      .then((data) => {
        if (isMounted) {
          setBuoys(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Cleanup all markers
  const clearMarkers = useCallback(() => {
    markers.current.forEach(({ marker, cleanup }) => {
      cleanup();
      marker.remove();
    });
    markers.current = [];
  }, []);

  // Navigate to buoy detail page
  const navigateToBuoy = useCallback(
    (buoy: Buoy) => {
      const slug = slugify(buoy.name);
      router.push(`/${locale}/buoy/${slug}`);
    },
    [router, locale]
  );

  // Create a marker for a buoy
  const createBuoyMarker = useCallback(
    (buoy: Buoy, mapInstance: mapboxgl.Map): MarkerData | null => {
      if (!buoy.lat || !buoy.lng) return null;

      // Create marker container
      const container = document.createElement("div");
      container.className = "buoy-marker-container";
      Object.assign(container.style, {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
      });

      // Create marker dot
      const el = document.createElement("div");
      el.className = "buoy-marker";
      Object.assign(el.style, {
        width: "14px",
        height: "14px",
        borderRadius: "50%",
        backgroundColor: "#3b82f6",
        border: "2px solid white",
        boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
        transition: "all 0.2s ease",
      });

      container.appendChild(el);

      // Create wave height label if available
      if (buoy.last_reading?.significient_height) {
        const label = document.createElement("div");
        label.className = "buoy-label";
        label.textContent = `${buoy.last_reading.significient_height.toFixed(1)}m`;
        Object.assign(label.style, {
          marginTop: "2px",
          fontSize: "10px",
          fontWeight: "600",
          color: "#1f2937",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          padding: "1px 4px",
          borderRadius: "4px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          whiteSpace: "nowrap",
          transition: "all 0.2s ease",
        });
        container.appendChild(label);
      }

      // Create marker using the container (no popup, direct navigation on click)
      const marker = new mapboxgl.Marker({ element: container, anchor: "top" })
        .setLngLat([buoy.lng, buoy.lat])
        .addTo(mapInstance);

      // Marker hover handlers
      const handleMarkerEnter = () => {
        // Visual feedback on the dot
        Object.assign(el.style, {
          width: "18px",
          height: "18px",
          boxShadow: "0 4px 12px rgba(59, 130, 246, 0.6)",
          border: "3px solid white",
        });
      };

      const handleMarkerLeave = () => {
        // Reset visual on the dot
        Object.assign(el.style, {
          width: "14px",
          height: "14px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
          border: "2px solid white",
        });
      };

      // Click handler to navigate to detail page
      const handleMarkerClick = () => {
        navigateToBuoy(buoy);
      };

      container.addEventListener("mouseenter", handleMarkerEnter);
      container.addEventListener("mouseleave", handleMarkerLeave);
      container.addEventListener("click", handleMarkerClick);

      // Cleanup function
      const cleanup = () => {
        container.removeEventListener("mouseenter", handleMarkerEnter);
        container.removeEventListener("mouseleave", handleMarkerLeave);
        container.removeEventListener("click", handleMarkerClick);
      };

      return { marker, cleanup };
    },
    [locale, navigateToBuoy]
  );

  // Initialize map (only after loading is complete and container exists)
  useEffect(() => {
    if (loading || !mapContainer.current || map.current) return;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-3, 47], // Center on Atlantic coast
      zoom: 4,
      attributionControl: false,
      failIfMajorPerformanceCaveat: false, // Allow software rendering fallback
    });

    mapInstance.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapInstance.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-right"
    );

    mapInstance.on("load", () => {
      mapLoaded.current = true;
      // Trigger resize to ensure proper rendering
      mapInstance.resize();
    });

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstance && mapLoaded.current) {
        mapInstance.resize();
      }
    });

    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current);
    }

    map.current = mapInstance;

    return () => {
      resizeObserver.disconnect();
      clearMarkers();
      mapLoaded.current = false;
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [loading, clearMarkers]);

  // Add markers when buoys data is available and map is ready
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance || !buoys.length) return;

    const addMarkers = () => {
      // Clear existing markers first
      clearMarkers();

      // Add new markers
      buoys.forEach((buoy) => {
        const markerData = createBuoyMarker(buoy, mapInstance);
        if (markerData) {
          markers.current.push(markerData);
        }
      });

      // Fit bounds to show all buoys
      const validBuoys = buoys.filter((b) => b.lat && b.lng);
      if (validBuoys.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        validBuoys.forEach((buoy) => {
          bounds.extend([buoy.lng, buoy.lat]);
        });
        mapInstance.fitBounds(bounds, {
          padding: { top: 80, bottom: 80, left: 80, right: 80 },
          maxZoom: 8,
          duration: 1000,
        });
      }
    };

    // Wait for map to be loaded
    if (mapLoaded.current) {
      addMarkers();
    } else {
      mapInstance.on("load", addMarkers);
    }

    return () => {
      mapInstance.off("load", addMarkers);
    };
  }, [buoys, createBuoyMarker, clearMarkers]);

  if (loading) {
    return (
      <section className="py-20 px-4 bg-background">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading buoys map...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 px-4 bg-background">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center text-destructive">
            <p>Error loading map: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="buoys-map"
      className="py-20 px-4 bg-gradient-to-b from-background to-accent/10 overflow-x-hidden"
    >
      <div className="container max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Explore Our Buoy Network
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time ocean data from {buoys.length} buoys across France, Spain,
            Portugal, UK, and Ireland
          </p>
        </header>
        <div className="relative w-full h-[600px] md:h-[700px] rounded-2xl overflow-hidden shadow-2xl border border-border">
          <div ref={mapContainer} className="w-full h-full" />
          <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-border">
            <div className="text-sm font-semibold text-foreground">
              {buoys.length} Active Buoys
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
