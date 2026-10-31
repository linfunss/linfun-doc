# LinFun 文档

个人技术笔记，基于 nsrh-doc 的 VitePress 1.6.4 文档站点结构与开发约定独立创建。

推荐 Node.js 24，固定 pnpm 12.15.0。

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm docs:build
pnpm docs:preview
```

站点地址为 https://doc.lin-fun.com/ ，VitePress 与 CI 均使用根路径 `/`，无需设置 `VITEPRESS_BASE` 仓库变量。产物位于 `docs/.vitepress/dist/`；不提交依赖或产物。

站点包含中文全文搜索、明暗主题、分类导航、代码行号、GitHub 编辑入口、构建提交链接及北京时间精确到秒的 Git 更新时间。构建依赖完整 Git 历史；浅克隆先补全历史。

Actions 对 dev/main 推送、PR、v* 标签和手动运行执行冻结安装及构建，产物保留 14 天。main 构建通过后使用 OIDC 部署 GitHub Pages。Pages 的 Source 需设置为 GitHub Actions。

协作要求见 [AGENTS.md](./AGENTS.md)，维护指南见 [docs/guide/getting-started.md](./docs/guide/getting-started.md)。功能分支从 dev 创建并经 PR 合入；发布 dev → main 必须 Merge commit，提交与版本标签需 GPG 签名，发布后同步 main 回 dev。

## 内容来源

8 篇个人待处理笔记归入开发环境、部署与网络、应用与游戏。原始记录保留实践背景，修正明显笔误、错误示例与标题层级；Cloudflare 示例公网 IP 替换为文档保留地址。Google 截图沿用已遮挡个人信息的本地原图，并补充中英文术语对照。经验性验证流程不视为平台保证。
