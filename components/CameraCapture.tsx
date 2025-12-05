'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { addWatermark } from '@/utils/addWatermark';

interface CameraCaptureProps {
  latitude: number | null;
  longitude: number | null;
  onCapture: (imageDataUrl: string) => void;
}

export function CameraCapture({ latitude, longitude, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // 启动摄像头
  const startCamera = useCallback(async () => {
    // 检查是否支持媒体设备
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('您的浏览器不支持摄像头功能，请使用现代浏览器（Chrome、Safari、Firefox）');
      return;
    }

    // 检查是否在安全上下文中（HTTPS 或 localhost）
    const isSecureContext = window.isSecureContext || 
      window.location.protocol === 'https:' || 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1';
    
    if (!isSecureContext) {
      setError('摄像头功能需要在 HTTPS 环境下运行。请使用 HTTPS 访问或部署到 Vercel。');
      return;
    }

    setError(null);

    try {
      // 首先尝试使用后置摄像头
      let mediaStream: MediaStream | null = null;
      
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment', // 后置摄像头
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
      } catch (envError) {
        // 如果后置摄像头失败，尝试前置摄像头
        console.warn('后置摄像头不可用，尝试前置摄像头:', envError);
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { 
              facingMode: 'user', // 前置摄像头
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          });
        } catch (userError) {
          // 如果前置摄像头也失败，尝试不指定 facingMode
          console.warn('前置摄像头不可用，尝试默认摄像头:', userError);
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          });
        }
      }

      if (mediaStream && videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setError(null);
        
        // 等待视频加载
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch((playError) => {
              console.error('视频播放失败:', playError);
              setError('视频播放失败，请重试');
            });
          }
        };
      }
    } catch (err: any) {
      console.error('摄像头访问错误:', err);
      let errorMessage = '无法访问摄像头';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = '摄像头权限被拒绝。请在浏览器设置中允许摄像头权限，然后刷新页面重试。';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = '未找到摄像头设备。请确保设备已连接摄像头。';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = '摄像头被其他应用占用。请关闭其他使用摄像头的应用后重试。';
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        errorMessage = '摄像头不支持请求的设置。正在尝试其他配置...';
        // 尝试最基本的配置
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (basicStream && videoRef.current) {
            videoRef.current.srcObject = basicStream;
            setStream(basicStream);
            setError(null);
            return;
          }
        } catch (basicError) {
          errorMessage = '无法访问摄像头，请检查设备权限和设置';
        }
      } else if (err.message) {
        errorMessage = `摄像头错误: ${err.message}`;
      }
      
      setError(errorMessage);
    }
  }, []);

  // 停止摄像头
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  // 拍照
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('视频或画布未初始化');
      return;
    }

    if (latitude === null || longitude === null) {
      setError('请先获取定位信息');
      return;
    }

    setIsCapturing(true);
    setError(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('无法创建 Canvas 上下文');
      }

      // 设置画布尺寸为视频尺寸
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // 将视频帧绘制到画布
      ctx.drawImage(video, 0, 0);

      // 获取图片数据
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);

      // 添加水印
      const timestamp = Date.now();
      const watermarkedImage = await addWatermark(
        imageDataUrl,
        latitude,
        longitude,
        timestamp
      );

      // 调用回调函数
      onCapture(watermarkedImage);

      // 停止摄像头
      stopCamera();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '拍照失败';
      setError(errorMessage);
    } finally {
      setIsCapturing(false);
    }
  }, [latitude, longitude, onCapture, stopCamera]);

  // 组件卸载时停止摄像头
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="camera-capture">
      <div className="video-container">
        {stream ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="video-preview"
              style={{ 
                width: '100%',
                maxWidth: '100%',
                height: 'auto',
                transform: 'scaleX(-1)' // 镜像翻转，更符合自拍习惯
              }}
            />
            <div className="camera-controls">
              <button
                onClick={capturePhoto}
                disabled={isCapturing}
                className="capture-button"
              >
                {isCapturing ? '处理中...' : '拍照'}
              </button>
              <button onClick={stopCamera} className="stop-button">
                关闭摄像头
              </button>
            </div>
          </>
        ) : (
          <button onClick={startCamera} className="start-camera-button">
            启动摄像头
          </button>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {error && (
        <div className="error-message">
          {error}
          {error.includes('权限') && (
            <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
              <strong>解决步骤：</strong>
              <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>点击浏览器地址栏左侧的锁图标或信息图标</li>
                <li>找到"摄像头"或"相机"权限设置</li>
                <li>选择"允许"或"始终允许"</li>
                <li>刷新页面后重试</li>
              </ol>
              <div style={{ marginTop: '8px' }}>
                <strong>注意：</strong>如果通过 IP 地址访问（如 http://192.168.x.x），某些浏览器可能不允许访问摄像头。
                建议部署到 Vercel 使用 HTTPS 访问。
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

