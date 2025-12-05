'use client';

import { useState, useEffect, useCallback } from 'react';

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface UseGeolocationReturn {
  location: GeolocationData | null;
  error: string | null;
  loading: boolean;
  getLocation: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<GeolocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('您的浏览器不支持地理定位功能');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || 0,
          timestamp: position.timestamp,
        });
        setLoading(false);
      },
      (err) => {
        let errorMessage = '获取位置失败';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = '用户拒绝了地理定位请求';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = '位置信息不可用';
            break;
          case err.TIMEOUT:
            errorMessage = '获取位置超时';
            break;
        }
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  return {
    location,
    error,
    loading,
    getLocation,
  };
}

