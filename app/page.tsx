'use client';

import { useState, useEffect } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { CameraCapture } from '@/components/CameraCapture';

export default function Home() {
  const { location, error: locationError, loading, getLocation } = useGeolocation();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

  // 初始化 Farcaster Mini App SDK
  useEffect(() => {
    const initSDK = async () => {
      try {
        // 动态导入 SDK，避免 SSR 问题
        const sdk = (await import('@farcaster/miniapp-sdk')).default;
        await sdk.actions.ready();
        setSdkReady(true);
      } catch (err) {
        // SDK 初始化失败不影响应用运行（开发环境可能没有 SDK）
        console.warn('Farcaster Mini App SDK 初始化失败:', err);
        setSdkReady(true); // 仍然允许应用运行
      }
    };

    initSDK();
  }, []);

  const handleCapture = (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
  };

  return (
    <div className="container">
      <h1>📍 位置拍照应用</h1>

      {/* 定位信息区域 */}
      <section className="section">
        <h2 className="section-title">实时定位</h2>
        <button
          onClick={getLocation}
          disabled={loading}
          className="button primary-button"
        >
          {loading ? '获取中...' : '获取定位'}
        </button>

        {locationError && (
          <div className="error-message">{locationError}</div>
        )}

        {loading && <div className="loading">正在获取位置信息...</div>}

        {location && (
          <div className="location-info">
            <div className="location-item">
              <span className="location-label">纬度：</span>
              <span className="location-value">{location.latitude.toFixed(5)}</span>
            </div>
            <div className="location-item">
              <span className="location-label">经度：</span>
              <span className="location-value">{location.longitude.toFixed(5)}</span>
            </div>
            <div className="location-item">
              <span className="location-label">精度：</span>
              <span className="location-value">{location.accuracy.toFixed(2)} 米</span>
            </div>
            <div className="location-item">
              <span className="location-label">时间：</span>
              <span className="location-value">
                {new Date(location.timestamp).toLocaleString('zh-CN')}
              </span>
            </div>
          </div>
        )}

        {!location && !loading && !locationError && (
          <div className="no-location">点击上方按钮获取当前位置</div>
        )}
      </section>

      {/* 拍照区域 */}
      <section className="section">
        <h2 className="section-title">拍照（带水印）</h2>
        {location ? (
          <CameraCapture
            latitude={location.latitude}
            longitude={location.longitude}
            onCapture={handleCapture}
          />
        ) : (
          <div className="no-location">
            请先获取定位信息才能拍照
          </div>
        )}
      </section>

      {/* 照片预览区域 */}
      {capturedImage && (
        <section className="section">
          <h2 className="section-title">带水印的照片</h2>
          <div className="photo-preview">
            <img src={capturedImage} alt="带水印的照片" />
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.download = `photo-${Date.now()}.jpg`;
                link.href = capturedImage;
                link.click();
              }}
              className="button secondary-button"
              style={{ marginTop: '12px' }}
            >
              下载照片
            </button>
          </div>
        </section>
      )}

      {/* SDK 状态（开发时可见） */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ marginTop: '24px', fontSize: '12px', color: '#999', textAlign: 'center' }}>
          SDK 状态: {sdkReady ? '✅ 已就绪' : '⏳ 初始化中...'}
        </div>
      )}
    </div>
  );
}

