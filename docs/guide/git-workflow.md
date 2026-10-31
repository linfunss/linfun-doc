---
title: Git 协作要求
description: 文档仓库的分支、GPG 签名、提交、PR 与发布要求
---

# Git 协作要求

本页将仓库根目录 `AGENTS.md` 的约定整理为操作步骤。所有命令在仓库根目录执行；遇到冲突先检查差异，不要用强制推送或硬重置覆盖他人工作。

## 分支要求

| 分支 | 用途 | 要求 |
| --- | --- | --- |
| `main` | 生产稳定版本 | 禁止直接 push，通过发布 PR 合入 |
| `dev` | 集成与联调 | 日常修改不得直接在此编码 |
| `feat/*`、`fix/*` | 独立修改 | 基于最新 dev 创建，通过 PR 合入 dev 后删除 |

新增或整理文档可以使用 `feat/docs-maintenance` 这样的功能分支名；修复问题使用 `fix/*`。示例名称若已存在，请换成描述本次任务的新名称。

## 首次配置

先确认提交身份，邮箱应与 GitHub 账号中已验证的邮箱一致：

```bash
git config user.name "你的名字"
git config user.email "你的已验证邮箱"
```

本项目要求所有日常提交、PR 合并节点和版本标签均启用 GPG 签名。先在本机创建或导入自己的 GPG 密钥，将公钥添加到 GitHub，再设置：

```bash
# 查看自己的签名密钥指纹
gpg --list-secret-keys --keyid-format LONG
# 将下面的占位文字替换为自己的签名密钥指纹
git config user.signingkey "你的签名密钥指纹"
git config commit.gpgsign true
git config tag.gpgsign true
```

私钥留在自己的设备，不上传仓库。Windows 与 WSL 使用不同的密钥环境，请在实际执行 Git 的环境中验证签名配置；签名失败时先修复密钥或代理，不通过关闭签名绕过要求。

## 开始一次修改

先确认工作区没有未处理的修改；已有修改时先妥善提交或保存，再切换分支。

```bash
git status
git fetch origin
git switch dev
git pull --ff-only origin dev
git switch -c feat/docs-maintenance
```

随后修改文件，并完成 [维护入门](./getting-started.md#提交前检查) 中的检查。

## 提交格式与签名

标题格式为 `emoji type(范围): 中文说明`。常用类型：

| 类型 | 示例 |
| --- | --- |
| 文档 | `📝 docs(维护指南): 补充新增文章流程` |
| 功能 | `✨ feat(文档站点): 增加培训分类导航` |
| 修复 | `🐛 fix(导航): 修正软件资源页面地址` |
| 工程维护 | `🔧 chore(开发环境): 调整本地预览配置` |

正文用中文说明改动原因、验证结果及未验证项。emoji 应与主要改动匹配，不堆叠装饰符号，不为补 emoji 改写既有历史。

```bash
pnpm docs:build
git diff
# 按实际修改替换文件路径，只暂存本次相关内容
git add docs/guide/getting-started.md
git diff --cached
git commit -S -m "📝 docs(维护指南): 补充新增文章流程" -m "说明改动原因。验证：pnpm docs:build 通过；列出仍未验证的内容。"
git log -1 --show-signature
```

确认签名有效后，推送自己的功能分支：

```bash
git push -u origin feat/docs-maintenance
```

## PR 与合并

1. 创建功能分支到 `dev` 的 PR，说明问题、修改效果和验证结果。
2. 等待必要检查及审阅完成，确认合并节点满足签名要求。
3. 功能 PR 使用 **Squash and merge** 或 **Rebase and merge**。
4. 确认合并成功后，立即删除该功能分支；不要继续复用已合并分支。

不要提交 `node_modules/`、构建产物、缓存或密钥。未经检查不要直接使用 `git add .`。

## 发布流程（维护者执行）

日常贡献到功能 PR 为止，正式发布由维护者按以下顺序执行。

1. 创建 `dev → main` 发布 PR，必须使用 **Create a merge commit**，禁止 Squash 或 Rebase。
2. 同步本地 main，在已同步的 main 上创建 GPG 签名版本标签并推送。版本号按实际发布替换。

```bash
git switch main
git pull --ff-only origin main
git tag -s vX.Y.Z -m "发布说明"
git push origin vX.Y.Z
```

3. 发布完成后，立即将 main 合并回 dev，完成基线同步。

```bash
git switch dev
git pull --ff-only origin dev
git merge -S origin/main
git push origin dev
```

这里的 dev 推送是发布后的同步步骤，不代表允许日常直接在 dev 开发。签名提交或标签本身也不等同于站点已部署，线上发布结果需单独验证。
