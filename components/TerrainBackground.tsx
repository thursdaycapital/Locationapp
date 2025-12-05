'use client';

import { useEffect, useRef } from 'react';

export function TerrainBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 动态导入 Three.js，避免 SSR 问题
    let THREE: typeof import('three');
    let scene: any;
    let camera: any;
    let renderer: any;
    let geometry: any;
    let material: any;
    let animationId: number = 0;
    let handleResize: (() => void) | null = null;

    const init = async () => {
      THREE = await import('three');

      // 创建场景
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a1a2e);

      // 创建相机
      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(0, 5, 10);
      camera.lookAt(0, 0, 0);

      // 创建渲染器
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      containerRef.current!.appendChild(renderer.domElement);

      // 创建地形几何体
      geometry = new THREE.PlaneGeometry(20, 20, 50, 50);
      const vertices = geometry.attributes.position.array as Float32Array;

      // 生成高度数据（使用噪声函数创建起伏效果）
      const time = Date.now() * 0.0001;
      for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 2];
        // 使用多个正弦波叠加创建自然的地形起伏
        const height =
          Math.sin(x * 0.5 + time) * 0.5 +
          Math.sin(z * 0.5 + time * 0.8) * 0.5 +
          Math.sin((x + z) * 0.3 + time * 1.2) * 0.3 +
          Math.sin(Math.sqrt(x * x + z * z) * 0.4 + time * 0.5) * 0.4;
        vertices[i + 1] = height;
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();

      // 创建材质（使用渐变色表示海拔）
      material = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vPosition;
          varying vec3 vNormal;
          void main() {
            vPosition = position;
            vNormal = normal;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vPosition;
          varying vec3 vNormal;
          void main() {
            float height = vPosition.y;
            vec3 color1 = vec3(0.1, 0.2, 0.4); // 深蓝（低海拔）
            vec3 color2 = vec3(0.2, 0.4, 0.6); // 中蓝
            vec3 color3 = vec3(0.3, 0.6, 0.8); // 浅蓝
            vec3 color4 = vec3(0.4, 0.7, 0.9); // 很浅的蓝（高海拔）
            
            vec3 color;
            if (height < -0.3) {
              color = mix(color1, color2, (height + 0.5) / 0.2);
            } else if (height < 0.0) {
              color = mix(color2, color3, (height + 0.3) / 0.3);
            } else if (height < 0.3) {
              color = mix(color3, color4, height / 0.3);
            } else {
              color = color4;
            }
            
            // 添加光照效果
            vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
            float light = max(dot(vNormal, lightDir), 0.3);
            color *= light;
            
            gl_FragColor = vec4(color, 0.6);
          }
        `,
        transparent: true,
        wireframe: false,
      });

      const terrain = new THREE.Mesh(geometry, material);
      terrain.rotation.x = -Math.PI / 2;
      scene.add(terrain);

      // 添加环境光
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      // 添加方向光
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 10, 5);
      scene.add(directionalLight);

      // 动画循环
      const animate = () => {
        animationId = requestAnimationFrame(animate);

        // 更新地形高度（创建动态效果）
        const time = Date.now() * 0.0001;
        const vertices = geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < vertices.length; i += 3) {
          const x = vertices[i];
          const z = vertices[i + 2];
          const height =
            Math.sin(x * 0.5 + time) * 0.5 +
            Math.sin(z * 0.5 + time * 0.8) * 0.5 +
            Math.sin((x + z) * 0.3 + time * 1.2) * 0.3 +
            Math.sin(Math.sqrt(x * x + z * z) * 0.4 + time * 0.5) * 0.4;
          vertices[i + 1] = height;
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();

        // 缓慢旋转相机
        const radius = 10;
        const angle = time * 0.1;
        camera.position.x = Math.cos(angle) * radius;
        camera.position.z = Math.sin(angle) * radius;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      };

      animate();

      // 处理窗口大小变化
      handleResize = () => {
        if (!containerRef.current) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', handleResize);
    };

    init().catch((err) => {
      console.error('Failed to initialize Three.js:', err);
    });

    // 清理函数
    return () => {
      if (handleResize) {
        window.removeEventListener('resize', handleResize);
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (containerRef.current && renderer?.domElement) {
        try {
          containerRef.current.removeChild(renderer.domElement);
        } catch (e) {
          // 忽略错误
        }
      }
      if (renderer) renderer.dispose();
      if (geometry) geometry.dispose();
      if (material) material.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        overflow: 'hidden',
      }}
    />
  );
}
