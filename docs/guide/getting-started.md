---
title: 维护入门
description: 新维护者从环境准备到提交文档的操作入口
---

# 文档维护指南

本节面向文档贡献者。第一次参与请按下列顺序操作；分支与签名要求以仓库根目录 `AGENTS.md` 为准。

## 按任务查找

| 我要做什么 | 阅读文档 |
| --- | --- |
| 新增文章、添加导航、整理标题 | [文档编写与导航](./vitepress-example.md) |
| 修改首页、Logo、主题颜色或搜索 | [网站设置与主题](./branding.md) |
| 创建分支、签名提交、提 PR 或发布 | [Git 协作要求](./git-workflow.md) |

## 准备开发环境

需要 Git、Node.js 22 或以上、pnpm 12.15.0。先完成 [Git 身份与签名配置](./git-workflow.md#首次配置)，再开始贡献。

所有命令在 `linfun-doc` 仓库根目录运行，该目录包含 `package.json`。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

打开终端显示的本地地址。修改 `docs/` 下的文件后，开发页面会自动更新。

::: tip Windows 与 WSL
如果仓库与依赖位于 WSL，请在 VS Code 中使用“WSL: Reopen Folder in WSL”，确认左下角显示 WSL: Debian。仅把终端切换成 WSL，不能让 Windows 编辑器正确解析 Linux 中的依赖。
:::

## 常用文件

| 文件或目录 | 维护内容 |
| --- | --- |
| `docs/index.md` | 首页标题、按钮、Logo 和介绍卡片 |
| `docs/development/` | 技术笔记文章 |
| `docs/guide/` | 文档维护指南 |
| `docs/.vitepress/config.mts` | 导航、侧边栏、搜索及网站设置 |
| `docs/.vitepress/theme/custom.css` | 品牌色、首页光晕等样式 |
| `docs/public/` | 图片与其他静态资源 |
| `AGENTS.md` | 分支、签名、提交与发布约定 |

## 一次修改的完整流程

1. 确认工作区状态，从最新 `dev` 创建独立分支，命令见 [Git 协作要求](./git-workflow.md)。
2. 修改文章或配置，新增页面时同步添加对应分类的侧边栏入口。
3. 用 `pnpm dev` 检查页面、目录跳转和链接；涉及样式时检查明暗主题与手机宽度。
4. 执行下列构建检查，再检查构建预览。
5. 查看 Git 差异，创建签名提交，推送功能分支并提 PR 到 `dev`。

```bash
pnpm docs:build
pnpm docs:preview
```

修改源码后需重新构建，`docs:preview` 才会显示新内容。构建产物在 `docs/.vitepress/dist/`，不提交到 Git；预览命令用于验收，不是生产服务器。

## 提交前检查

- 页面归类正确，导航与侧边栏都能进入页面。
- 一篇文章只保留一个一级标题，右侧目录层级合理。
- 链接和图片有效，构建无错误；不通过忽略失效链接来掩盖问题。
- 不提交密码、令牌、私钥、内部资料或个人隐私。
- 只暂存本次相关文件，确认未加入依赖、缓存和构建产物。
