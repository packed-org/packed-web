import type {
  PackingFactorsResponse,
  PackingListItemResponse,
  PackingListResponse,
} from '@/@types/api';
import { apiRequest } from '@/services/api';

export const packingService = {
  async getPackingList(tripId: string): Promise<PackingListResponse> {
    return apiRequest<PackingListResponse>(`/trips/${tripId}/packing-list`, {
      method: 'GET',
    });
  },

  async generatePackingList(tripId: string): Promise<PackingListResponse> {
    return apiRequest<PackingListResponse>(`/trips/${tripId}/packing-list`, {
      method: 'POST',
    });
  },

  async regeneratePackingList(tripId: string): Promise<PackingListResponse> {
    return apiRequest<PackingListResponse>(`/trips/${tripId}/packing-list/regenerate`, {
      method: 'POST',
    });
  },

  async getFactors(tripId: string): Promise<PackingFactorsResponse> {
    return apiRequest<PackingFactorsResponse>(`/trips/${tripId}/packing-list/factors`, {
      method: 'GET',
    });
  },

  async resetChecklist(tripId: string): Promise<PackingListResponse> {
    return apiRequest<PackingListResponse>(`/trips/${tripId}/packing-list/reset`, {
      method: 'POST',
    });
  },

  async addCustomItem(
    tripId: string,
    payload: { name: string; category: string; quantity: number }
  ): Promise<PackingListItemResponse> {
    return apiRequest<PackingListItemResponse>(`/trips/${tripId}/packing-list/items`, {
      method: 'POST',
      body: payload,
    });
  },

  async updateItem(
    tripId: string,
    itemId: string,
    payload: { name?: string; category?: string; quantity?: number; is_checked?: boolean }
  ): Promise<PackingListItemResponse> {
    return apiRequest<PackingListItemResponse>(
      `/trips/${tripId}/packing-list/items/${itemId}`,
      {
        method: 'PATCH',
        body: payload,
      }
    );
  },

  async deleteItem(tripId: string, itemId: string): Promise<void> {
    return apiRequest<void>(`/trips/${tripId}/packing-list/items/${itemId}`, {
      method: 'DELETE',
    });
  },
};

