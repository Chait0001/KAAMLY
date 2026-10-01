import { fetchApi } from './client';

export const shopsApi = {
  getShops: async (params: { lat?: number; lng?: number; city?: string; sort?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params.lat) query.append('lat', params.lat.toString());
    if (params.lng) query.append('lng', params.lng.toString());
    if (params.city) query.append('city', params.city);
    if (params.sort) query.append('sort', params.sort);
    if (params.page) query.append('page', params.page.toString());
    
    return fetchApi(`/api/shops?${query.toString()}`);
  },

  getShopDetails: async (id: string) => {
    return fetchApi(`/api/shops/${id}`);
  },

  searchLocations: async (q: string) => {
    return fetchApi(`/api/locations/search?q=${encodeURIComponent(q)}`);
  }
};
