export const API_CONFIG = {
  BASE_URL: 'http:

  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  AUTH_HEADERS: (token) => ({
    'Authorization': `Bearer ${token}`,
  }),
};