/**
 * 在图片上添加水印（经纬度和时间）
 * @param imageDataUrl - 原始图片的 base64 数据
 * @param latitude - 纬度
 * @param longitude - 经度
 * @param timestamp - 时间戳
 * @returns 带水印的图片 base64 数据
 */
export async function addWatermark(
  imageDataUrl: string,
  latitude: number,
  longitude: number,
  timestamp: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('无法创建 Canvas 上下文'));
        return;
      }

      // 设置画布尺寸为图片尺寸
      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制原始图片
      ctx.drawImage(img, 0, 0);

      // 设置文字样式
      const fontSize = Math.max(24, img.width / 20); // 根据图片大小自适应字体
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = Math.max(2, fontSize / 12);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';

      // 格式化时间
      const date = new Date(timestamp);
      const timeString = date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).replace(/\//g, '-');

      // 格式化经纬度（保留5位小数）
      const latString = `纬度：${latitude.toFixed(5)}`;
      const lngString = `经度：${longitude.toFixed(5)}`;
      const timeLabel = `时间：${timeString}`;

      // 计算文字位置（左下角，留出边距）
      const padding = fontSize;
      const lineHeight = fontSize * 1.5;
      const startY = canvas.height - padding;

      // 绘制文字（带描边效果，提高可读性）
      const texts = [latString, lngString, timeLabel];
      texts.forEach((text, index) => {
        const y = startY - (texts.length - 1 - index) * lineHeight;
        // 先绘制描边
        ctx.strokeText(text, padding, y);
        // 再绘制填充
        ctx.fillText(text, padding, y);
      });

      // 转换为 base64
      const watermarkedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      resolve(watermarkedDataUrl);
    };

    img.onerror = () => {
      reject(new Error('图片加载失败'));
    };

    img.src = imageDataUrl;
  });
}

