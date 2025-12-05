# 📍 Location App - Farcaster Mini App

一个极简版的 Farcaster Mini App，提供实时定位和拍照功能，照片会自动添加经纬度和时间水印。

## ✨ 功能特性

- ✅ **实时定位**：使用浏览器 Geolocation API 获取当前位置（纬度、经度、精度、时间戳）
- ✅ **拍照功能**：调用设备摄像头进行拍照
- ✅ **水印合成**：自动在照片上添加经纬度和时间信息
- ✅ **Farcaster SDK 集成**：支持 Farcaster Mini App 环境（可选）

## 🛠️ 技术栈

- **框架**：Next.js 14 (App Router)
- **语言**：TypeScript
- **样式**：CSS Modules
- **SDK**：@farcaster/miniapp-sdk

## 📁 项目结构

```
Locationapp/
├── app/
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 主页面
│   └── globals.css         # 全局样式
├── components/
│   └── CameraCapture.tsx   # 摄像头拍照组件
├── hooks/
│   └── useGeolocation.ts   # 定位 Hook
├── utils/
│   └── addWatermark.ts     # 水印合成工具
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## 🚀 本地开发

### 前置要求

- Node.js 18+ 
- npm 或 yarn 或 pnpm

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### ⚠️ 重要提示

1. **HTTPS 要求**：定位和摄像头功能需要在 HTTPS 环境下运行（或 localhost）
2. **权限授权**：首次使用时，浏览器会请求定位和摄像头权限，请点击"允许"
3. **移动设备摄像头权限问题**：
   - **通过 IP 地址访问（如 http://192.168.x.x）**：某些浏览器可能不允许访问摄像头
   - **解决方案**：
     - ✅ **推荐**：部署到 Vercel 使用 HTTPS 访问（最佳方案）
     - ⚠️ **临时方案**：在手机浏览器中手动允许摄像头权限
       - iOS Safari：设置 > Safari > 相机 > 允许
       - Android Chrome：点击地址栏左侧的锁图标 > 权限 > 相机 > 允许
   - **如果仍然无法使用**：请确保在 HTTPS 环境下访问（Vercel 部署后会自动提供 HTTPS）

## 📦 部署到 Vercel

### 方法一：通过 Vercel CLI

1. 安装 Vercel CLI（如果还没有）：
```bash
npm i -g vercel
```

2. 登录 Vercel：
```bash
vercel login
```

3. 在项目根目录部署：
```bash
vercel
```

4. 按照提示完成部署配置

### 方法二：通过 GitHub 集成

1. 将代码推送到 GitHub 仓库

2. 访问 [Vercel Dashboard](https://vercel.com/dashboard)

3. 点击 "Add New Project"

4. 导入你的 GitHub 仓库

5. Vercel 会自动检测 Next.js 项目并配置构建设置

6. 点击 "Deploy" 完成部署

### 方法三：通过 Vercel 网站

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub/GitLab/Bitbucket 账号登录
3. 点击 "New Project"
4. 选择你的仓库
5. 保持默认配置，点击 "Deploy"

### 部署后配置

部署完成后，Vercel 会提供一个 HTTPS URL（例如：`https://your-app.vercel.app`），你的应用就可以正常使用定位和摄像头功能了。

## 🔧 使用说明

1. **获取定位**：
   - 点击"获取定位"按钮
   - 允许浏览器访问位置信息
   - 查看显示的经纬度、精度和时间

2. **拍照**：
   - 确保已获取定位信息
   - 点击"启动摄像头"按钮
   - 允许浏览器访问摄像头
   - 调整角度后点击"拍照"
   - 照片会自动添加经纬度和时间水印

3. **下载照片**：
   - 拍照后，照片会显示在页面上
   - 点击"下载照片"按钮保存到本地

## 📝 代码说明

### useGeolocation Hook

自定义 Hook，封装了浏览器 Geolocation API：

```typescript
const { location, error, loading, getLocation } = useGeolocation();
```

- `location`: 位置信息对象（纬度、经度、精度、时间戳）
- `error`: 错误信息
- `loading`: 加载状态
- `getLocation`: 获取位置的函数

### CameraCapture 组件

摄像头拍照组件，支持：
- 启动/停止摄像头
- 拍照并添加水印
- 错误处理

### addWatermark 工具函数

在图片上添加文字水印：
- 输入：图片 base64、纬度、经度、时间戳
- 输出：带水印的图片 base64
- 自动调整字体大小以适应图片尺寸

## 🌐 Farcaster Mini App 支持

应用已集成 `@farcaster/miniapp-sdk`，在 Farcaster 环境中会自动初始化并隐藏 splash screen。

在非 Farcaster 环境中（如普通浏览器），应用仍可正常运行，SDK 初始化失败不会影响功能。

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

