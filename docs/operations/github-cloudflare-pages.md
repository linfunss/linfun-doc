---
title: GitHub Actions 持续集成到 Cloudflare Pages
description: 使用冻结依赖安装、GitHub Secrets 与 Wrangler 发布静态前端
---

# GitHub Actions 持续集成到 Cloudflare Pages

本篇整理静态前端自动部署的步骤。本站自身使用 GitHub Pages；以下示例供其他项目接入 Cloudflare Pages。

## 准备项目

在 Cloudflare 创建 Direct Upload 类型的 Pages 项目，记录项目名及账户 ID。准备限定账户和 Pages 编辑权限的 API Token，在 GitHub 仓库 Settings → Secrets and variables → Actions 添加 `CLOUDFLARE_API_TOKEN` 与 `CLOUDFLARE_ACCOUNT_ID`。令牌只放 Secrets。

安装 CLI 并提交依赖锁文件：

```bash
npm install --save-dev wrangler
```

示例假设项目使用 npm、具有 `build` 脚本并输出 `dist/`。pnpm 项目应替换为冻结锁文件安装及对应构建命令。

## 工作流

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
concurrency:
  group: pages-production
  cancel-in-progress: false
jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: npm
      # npm ci 严格依据提交的 package-lock.json 安装。
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=your-project --branch=main
```

将 `your-project` 替换为已经创建的项目名，确保 `main` 与 Pages 的生产分支设置一致。CLI 可以直接发布指定目录，不必为了上传静态文件额外创建旧格式 `wrangler.toml`。

## 命令与常见误解

```bash
npx wrangler pages deploy dist --project-name=your-project --branch=main
```

`dist` 是上传目录；`--project-name` 指定 Pages 项目；`--branch` 提供部署分支信息。`--commit-dirty=true` 只声明工作区含未提交修改，不会执行 Git 提交，也不是包含未跟踪构建产物的开关。

旧笔记中的 `type = "vue"`、`[build].publish` 和 Worker 路由配置不应作为 Pages 通用配置复制。自定义域名在 Pages 项目控制台绑定，再按平台提示配置 DNS；单独创建 CNAME 记录不能替代域名绑定步骤。

## 验收

检查 Actions 安装、构建、上传是否成功，访问返回的部署地址并刷新深层页面。Vue Router 的 history 模式还需要 SPA fallback，见 [Vue 初始化](../development/vue-setup.md)。预览分支与生产分支应分别核对。

参考：[Wrangler 官方命令参考](https://developers.cloudflare.com/workers/wrangler/commands/)、[Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)。
