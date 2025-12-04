const API_BASE_URL = 'https://thesurfkit.com/api/v2';
const API_KEY = 'YhcqpqTMvfiEaO0b2vKcDp1wpHQL1SMA8p5OQXsKlLI';

export interface Buoy {
  id: number;
  name: string;
  lat: number;
  lng: number;
  source: string;
  source_identifier?: string;
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
    const response = await fetch(`${API_BASE_URL}/buoys?per_page=1000`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch buoys: ${response.status} ${response.statusText}`);
    }

    const data: BuoysResponse = await response.json();
    return data.data.buoys;
  } catch (error) {
    console.error('Error fetching buoys:', error);
    throw error;
  }
}

