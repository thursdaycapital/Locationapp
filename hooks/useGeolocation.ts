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
        let errorType: 'permission' | 'unavailable' | 'timeout' | 'other' = 'other';
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = '位置权限被拒绝';
            errorType = 'permission';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = '位置信息不可用';
            errorType = 'unavailable';
            break;
          case err.TIMEOUT:
            errorMessage = '获取位置超时，请重试';
            errorType = 'timeout';
            break;
          default:
            errorMessage = `获取位置失败: ${err.message || '未知错误'}`;
        }
        
        setError(JSON.stringify({ message: errorMessage, type: errorType }));
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

