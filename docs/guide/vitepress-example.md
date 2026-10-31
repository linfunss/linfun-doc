---
title: 文档编写与导航
description: 新建 Markdown、配置标题和分类导航的操作方法
outline: [2, 3]
---

# 文档编写与导航

## 新建一篇文章

技术笔记放进 `docs/development/`，维护说明放进 `docs/guide/`。文件名使用简洁的英文小写与连字符，例如 `environment-setup.md`。

下面是可复制的文章模板：

```markdown
---
title: 环境准备
description: 介绍开发所需的开发环境和安装步骤
outline: [2, 3]
---

# 环境准备

说明本文适用对象与目标。

## 安装步骤

### 安装工具

填写具体操作。

## 验证结果

说明如何确认操作成功。
```

frontmatter 中的 `title` 用于页面元信息，正文中的 `#` 是可见标题，两者应保持一致。

## 整理标题与右侧目录

| 语法 | 用途 |
| --- | --- |
| `#` | 页面主标题，每篇一个 |
| `##` | 章节 |
| `###` | 子分类 |
| `####` | 分类下的软件或具体条目 |

按顺序使用标题层级，不要为了放大文字跳级。右侧目录自动从标题生成，父子标题会逐层缩进，不需要手动在标题前加空格。

全站默认显示二、三级标题；需要显示每个条目的四级标题时，在该页 frontmatter 中设置 `outline: [2, 4]`。不要使用 `sidebar: true` 强制显示侧边栏，分类菜单由网站配置统一管理。

## 把页面加入分类菜单

打开 `docs/.vitepress/config.mts`，找到 `themeConfig.sidebar`，在对应路径的 `items` 中添加：

```ts
// 片段：加入 '/development/' 的 items 数组中。
{ text: '环境准备', link: '/development/environment-setup' }
```

`docs/development/environment-setup.md` 对应 `/development/environment-setup`。路径不写 `docs` 和 `.md`，`text` 是读者看到的菜单文字。

顶部 `nav` 只保留开发环境、部署与网络、应用与游戏和文档维护四个分类入口；通常新增文章只改对应侧边栏。当前菜单按 `/development/` 与 `/guide/` 分开，不要把笔记文章放到维护指南菜单里。

## 链接与图片

同目录文章使用相对链接：

```markdown
[维护入门](./getting-started.md)
```

图片放在 `docs/public/images/`，引用时省略 `public`：

```markdown
![操作示意图](/images/example.png)
```

以上图片只是语法示例，使用前需先创建对应文件。重命名或移动文章时，同步修改导航、侧边栏及其他文章中的引用。

## 代码与提示框

代码围栏后填写语言名称，用于语法高亮：

````markdown
```bash
pnpm dev
```

::: tip 提示
补充帮助读者完成操作的信息。
:::

::: warning 注意
说明当前操作需要满足的条件。
:::
````

## 验证与提交

执行 `pnpm docs:build`，再用 `pnpm docs:preview` 检查链接与目录。构建报告 dead link 时，修正路径或补齐目标页面。

完成后按 [Git 协作要求](./git-workflow.md) 创建签名提交和 PR。
