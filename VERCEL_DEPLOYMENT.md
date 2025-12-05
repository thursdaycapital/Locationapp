# Vercel 部署故障排除

## 如果遇到 404 错误

### 1. 检查 Vercel 项目设置

在 Vercel Dashboard 中检查以下设置：

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (或留空，Vercel 会自动检测)
- **Output Directory**: `.next` (或留空)
- **Install Command**: `npm install` (或留空)
- **Node.js Version**: 18.x 或更高

### 2. 检查构建日志

1. 在 Vercel Dashboard 中打开你的项目
2. 点击 "Deployments" 标签
3. 查看最新的部署日志
4. 检查是否有构建错误

### 3. 常见问题

#### 问题：构建成功但访问 404

**解决方案：**
- 确保访问的是根路径 `/`，而不是其他路径
- 检查 Vercel 项目设置中的 "Root Directory" 是否为空（应该为空）
- 确保 `app/page.tsx` 文件存在

#### 问题：构建失败

**解决方案：**
- 检查 Node.js 版本（需要 18+）
- 确保所有依赖都已正确安装
- 检查 TypeScript 编译错误

#### 问题：路由不工作

**解决方案：**
- Next.js 14 App Router 不需要 `vercel.json` 配置文件
- 确保使用 `app/` 目录结构（不是 `pages/`）
- 确保 `app/layout.tsx` 和 `app/page.tsx` 存在

### 4. 重新部署

如果问题持续存在：

1. 在 Vercel Dashboard 中点击 "Redeploy"
2. 或者推送新的提交到 GitHub 触发自动部署
3. 或者使用 Vercel CLI：
   ```bash
   vercel --prod
   ```

### 5. 检查部署 URL

确保访问的是正确的 URL：
- 生产环境：`https://your-app.vercel.app`
- 预览环境：`https://your-app-git-branch.vercel.app`

### 6. 联系支持

如果以上方法都无法解决问题，可以：
1. 查看 Vercel 的构建日志
2. 检查 GitHub Actions（如果使用）
3. 联系 Vercel 支持

