/**
 * Centralized API and WebSocket URL helper for Project Rudra
 * Supports local proxy, Vercel deployments, and remote backend hosts
 */

export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${cleanEndpoint}`;
};

export const getWsUrl = (endpoint = '/ws/telemetry') => {
  if (import.meta.env.VITE_WS_URL) {
    const base = import.meta.env.VITE_WS_URL.replace(/\/$/, '');
    const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${clean}`;
  }
  
  if (API_BASE.startsWith('http://') || API_BASE.startsWith('https://')) {
    const wsBase = API_BASE.replace(/^http/, 'ws');
    const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${wsBase}${clean}`;
  }

  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const host = typeof window !== 'undefined' ? window.location.host : 'localhost:8000';
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${isHttps ? 'wss:' : 'ws:'}//${host}${clean}`;
};
