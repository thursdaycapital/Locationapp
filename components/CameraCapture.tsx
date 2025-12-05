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
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // 优先使用后置摄像头
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setError(null);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : '无法访问摄像头，请检查权限设置';
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
              className="video-preview"
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

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

