import type {
  DestinationCandidate,
  TripCreateRequest,
  TripResponse,
  TripUpdateRequest,
  TripWeatherReport,
  WeatherSnapshot,
} from '@/@types/api';
import { apiRequest } from '@/services/api';

export const tripsService = {
  async searchDestinations(query: string, limit = 5): Promise<DestinationCandidate[]> {
    const params = new URLSearchParams({ q: query, limit: String(limit) });
    return apiRequest<DestinationCandidate[]>(`/destinations/search?${params.toString()}`, {
      method: 'GET',
    });
  },

  async getTripWeatherReport(params: {
    origin_city: string;
    destination_city: string;
    start_date: string;
    duration_days: number;
  }): Promise<TripWeatherReport> {
    const query = new URLSearchParams({
      origin_city: params.origin_city,
      destination_city: params.destination_city,
      start_date: params.start_date,
      duration_days: String(params.duration_days),
    });
    return apiRequest<TripWeatherReport>(`/weather/trip?${query.toString()}`, {
      method: 'GET',
    });
  },

  async listTrips(): Promise<TripResponse[]> {
    const res = await apiRequest<{ items: TripResponse[] }>('/trips', {
      method: 'GET',
    });
    return res.items;
  },

  async getTrip(tripId: string): Promise<TripResponse> {
    return apiRequest<TripResponse>(`/trips/${tripId}`, {
      method: 'GET',
    });
  },

  async createTrip(payload: TripCreateRequest): Promise<TripResponse> {
    return apiRequest<TripResponse>('/trips', {
      method: 'POST',
      body: payload,
    });
  },

  async updateTrip(tripId: string, payload: TripUpdateRequest): Promise<TripResponse> {
    return apiRequest<TripResponse>(`/trips/${tripId}`, {
      method: 'PATCH',
      body: payload,
    });
  },

  async deleteTrip(tripId: string): Promise<void> {
    return apiRequest<void>(`/trips/${tripId}`, {
      method: 'DELETE',
    });
  },

  async getTripWeather(tripId: string): Promise<WeatherSnapshot> {
    return apiRequest<WeatherSnapshot>(`/trips/${tripId}/weather`, {
      method: 'GET',
    });
  },
};

