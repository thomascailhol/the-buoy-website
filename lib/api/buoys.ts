import { cache } from "react";

const API_BASE_URL =
  process.env.SURFKIT_API_BASE_URL || "http://localhost:3000/api/v2";
const API_KEY = process.env.SURFKIT_API_KEY || "";

export interface Buoy {
  id: number;
  name: string;
  lat: number;
  lng: number;
  source: string;
  source_identifier?: string;
  dtz?: string; // Timezone (e.g., "Europe/Paris")
  last_reading_time?: string;
  readings_count?: number;
  last_reading?: {
    significient_height?: number;
    maximum_height?: number;
    period?: number;
    time?: string;
    water_temperature?: number;
    direction?: number;
    unit?: string;
  };
}

// Slugify function to create URL-friendly strings
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/(^-|-$)/g, ""); // Remove leading/trailing hyphens
}

// Get direction label from degrees
export function getDirectionLabel(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export interface BuoysResponse {
  status: string;
  data: {
    buoys: Buoy[];
    count: number;
  };
  meta: {
    page: number;
    per_page: number;
    total_pages: number;
    timestamp: string;
  };
}

export async function fetchAllBuoys(): Promise<Buoy[]> {
  try {
    const allBuoys: Buoy[] = [];
    let page = 1;
    let totalPages = 1;

    // Paginate through all pages (API limits to 100 per page)
    do {
      const response = await fetch(
        `${API_BASE_URL}/buoys?per_page=100&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            Accept: "application/json",
          },
          next: { revalidate: 300 }, // Cache for 5 minutes
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch buoys: ${response.status} ${response.statusText}`
        );
      }

      const data: BuoysResponse = await response.json();
      allBuoys.push(...data.data.buoys);
      totalPages = data.meta.total_pages;
      page++;
    } while (page <= totalPages);

    return allBuoys;
  } catch (error) {
    console.error("Error fetching buoys:", error);
    throw error;
  }
}

// Wrapped with React cache() to deduplicate calls within the same request
// This ensures generateMetadata and the page component share the same fetch
export const fetchBuoyBySlug = cache(
  async (slug: string): Promise<Buoy | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/buoys/${slug}`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          Accept: "application/json",
        },
        next: { revalidate: 60 }, // Cache for 1 minute (reduced for fresher data)
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(
          `Failed to fetch buoy: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.data?.buoy || null;
    } catch (error) {
      console.error("Error fetching buoy by slug:", error);
      return null;
    }
  }
);

export async function fetchBuoyById(id: number): Promise<Buoy | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/buoys/${id}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: "application/json",
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data.buoy;
  } catch (error) {
    console.error("Error fetching buoy by id:", error);
    return null;
  }
}

export interface BuoyReading {
  id: number;
  time: string;
  significient_height?: number | null;
  maximum_height?: number | null;
  period?: number | null;
  direction?: number | null;
  water_temperature?: number | null;
  spread?: number | null;
  mean_period?: number | null;
  energy?: number | null; // Legacy field name
  energy_per_wave?: number | null;
}

export interface BuoyReadingsResponse {
  status: string;
  data: {
    readings: BuoyReading[];
    count: number;
  };
  meta: {
    page: number;
    per_page: number;
    total_pages: number;
    timestamp: string;
  };
}

export interface BuoyReadingsPaginatedResult {
  readings: BuoyReading[];
  pagination: {
    page: number;
    perPage: number;
    totalPages: number;
    totalCount: number;
  };
}

export async function fetchBuoyReadings(
  buoyId: number,
  hours: number = 24,
  page: number = 1,
  perPage: number = 20
): Promise<BuoyReadingsPaginatedResult> {
  try {
    // Calculate date range for last N hours
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - hours * 60 * 60 * 1000);

    const url = `${API_BASE_URL}/buoys/${buoyId}/readings?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}&per_page=${perPage}&page=${page}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: "application/json",
      },
      cache: "no-store", // Don't cache - params change frequently
    });

    if (!response.ok) {
      console.error("Failed to fetch buoy readings:", response.status);
      return {
        readings: [],
        pagination: {
          page: 1,
          perPage,
          totalPages: 0,
          totalCount: 0,
        },
      };
    }

    const data: BuoyReadingsResponse = await response.json();
    return {
      readings: data.data.readings,
      pagination: {
        page: data.meta.page,
        perPage: data.meta.per_page,
        totalPages: data.meta.total_pages,
        totalCount: data.data.count,
      },
    };
  } catch (error) {
    console.error("Error fetching buoy readings:", error);
    return {
      readings: [],
      pagination: {
        page: 1,
        perPage,
        totalPages: 0,
        totalCount: 0,
      },
    };
  }
}

// Nearby buoy type
export interface NearbyBuoy {
  id: number;
  name: string;
  lat: number;
  lng: number;
  source: string;
  source_identifier?: string;
  distance_km: number;
  last_reading?: {
    significient_height?: number | null;
    period?: number | null;
    direction?: number | null;
    water_temperature?: number | null;
    time?: string;
  };
}

// Spot type
export interface Spot {
  id: number;
  name: string;
  slug?: string;
  lat: number;
  long: number;
  distance_km: number;
  country?: string;
  timezone?: string;
  is_magic?: boolean;
  webcam_url?: string | null;
}

export async function fetchNearestBuoys(
  lat: number,
  lng: number,
  maxDistance: number = 200,
  limit: number = 10
): Promise<NearbyBuoy[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/buoys/nearest?lat=${lat}&lng=${lng}&max_distance=${maxDistance}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          Accept: "application/json",
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      // 404 means no buoys found nearby - this is expected, not an error
      if (response.status !== 404) {
        console.error("Failed to fetch nearest buoys:", response.status);
      }
      return [];
    }

    const data = await response.json();
    // Handle both single (limit=1) and array (limit>1) responses
    if (data.data?.buoys) {
      return data.data.buoys;
    } else if (data.data?.buoy) {
      return [data.data.buoy];
    }
    return [];
  } catch (error) {
    console.error("Error fetching nearest buoys:", error);
    return [];
  }
}

export async function fetchNearestSpots(
  lat: number,
  lng: number,
  maxDistance: number = 200,
  limit: number = 10
): Promise<Spot[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/spots/nearest?lat=${lat}&lng=${lng}&max_distance=${maxDistance}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          Accept: "application/json",
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      // 404 means no spots found nearby - this is expected, not an error
      if (response.status !== 404) {
        console.error("Failed to fetch nearest spots:", response.status);
      }
      return [];
    }

    const data = await response.json();
    // Handle both single (limit=1) and array (limit>1) responses
    if (data.data?.spots) {
      return data.data.spots;
    } else if (data.data?.spot) {
      return [data.data.spot];
    }
    return [];
  } catch (error) {
    console.error("Error fetching nearest spots:", error);
    return [];
  }
}
