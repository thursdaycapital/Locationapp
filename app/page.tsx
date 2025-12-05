'use client';

import { useState, useEffect } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { CameraCapture } from '@/components/CameraCapture';
import { TerrainBackground } from '@/components/TerrainBackground';

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
    <>
      <TerrainBackground />
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

        {locationError && (() => {
          let errorObj: { message: string; type?: string } | null = null;
          try {
            errorObj = JSON.parse(locationError);
          } catch {
            errorObj = { message: locationError };
          }
          
          const isPermissionError = errorObj?.type === 'permission';
          
          return (
            <div className="error-message">
              {errorObj?.message || locationError}
              {isPermissionError && (
                <div style={{ marginTop: '12px', fontSize: '13px', lineHeight: '1.6' }}>
                  <strong style={{ display: 'block', marginBottom: '8px' }}>
                    📍 如何允许位置权限：
                  </strong>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '6px' }}>
                    <strong>iOS Safari：</strong>
                    <ol style={{ margin: '6px 0', paddingLeft: '20px' }}>
                      <li>打开 iPhone 设置</li>
                      <li>找到并点击 "Safari"</li>
                      <li>向下滚动找到 "位置服务"</li>
                      <li>选择 "询问" 或 "允许"</li>
                      <li>返回浏览器，刷新页面后重试</li>
                    </ol>
                    
                    <strong style={{ display: 'block', marginTop: '12px' }}>Android Chrome：</strong>
                    <ol style={{ margin: '6px 0', paddingLeft: '20px' }}>
                      <li>点击浏览器地址栏左侧的锁图标 🔒 或信息图标 ℹ️</li>
                      <li>找到 "位置" 或 "位置信息" 权限</li>
                      <li>选择 "允许" 或 "始终允许"</li>
                      <li>刷新页面后重试</li>
                    </ol>
                    
                    <strong style={{ display: 'block', marginTop: '12px' }}>桌面浏览器：</strong>
                    <ol style={{ margin: '6px 0', paddingLeft: '20px' }}>
                      <li>点击地址栏左侧的锁图标 🔒</li>
                      <li>找到 "位置" 权限设置</li>
                      <li>选择 "允许"</li>
                      <li>刷新页面后重试</li>
                    </ol>
                  </div>
                  <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(255,193,7,0.2)', borderRadius: '4px', fontSize: '12px' }}>
                    💡 <strong>提示：</strong>如果通过 IP 地址访问（如 http://192.168.x.x），某些浏览器可能不允许位置权限。
                    建议部署到 Vercel 使用 HTTPS 访问以获得最佳体验。
                  </div>
                </div>
              )}
              {errorObj?.type === 'timeout' && (
                <div style={{ marginTop: '8px', fontSize: '13px' }}>
                  <button
                    onClick={getLocation}
                    className="button primary-button"
                    style={{ marginTop: '8px', fontSize: '14px', padding: '8px 16px' }}
                  >
                    重试获取位置
                  </button>
                </div>
              )}
            </div>
          );
        })()}

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
    </>
  );
}

