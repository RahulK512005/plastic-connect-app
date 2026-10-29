import api from './axios';

export const brandsApi = {
  getProfile: () => api.get('/brands/profile'),
  updateProfile: (data) => api.put('/brands/profile', data),
  browseListings: () => api.get('/brands/listings/browse'),
};

export const ordersApi = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/buyer/' + localStorage.getItem('user')?.match(/"id":(\d+)/)?.[1]),
  getCollectorOrders: () => api.get('/orders/collector'),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

export const listingsApi = {
  getActiveListings: () => api.get('/listings/active'),
  getPreviousListings: () => api.get('/listings/previous'),
  getListing: (id) => api.get(`/listings/${id}`),
  deleteListing: (id) => api.delete(`/listings/${id}`),
};
