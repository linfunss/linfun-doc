---
title: 网站设置与主题
description: 维护网站配置、Logo、主题颜色、首页和中文搜索
---

# 网站设置与主题

## 先找到正确的文件

| 修改目标 | 文件与配置 |
| --- | --- |
| 站点名、描述、浏览器标题 | `config.mts` 的 title、description、titleTemplate |
| 顶部显示的名称 | `themeConfig.siteTitle` |
| 顶部导航与分类菜单 | `themeConfig.nav` 与 sidebar |
| 搜索按钮和弹窗文案 | `themeConfig.search.options.translations` |
| 明暗切换 | 网站级 appearance |
| 首页标题、按钮和卡片 | `docs/index.md` 的 hero、features |
| 品牌颜色与 Logo 光晕 | `docs/.vitepress/theme/custom.css` |

表中的 `config.mts` 指 `docs/.vitepress/config.mts`。修改已有配置项，避免重复定义同名对象覆盖其他设置。

## 替换 Logo 与浏览器图标

当前导航栏和首页 Logo 使用 `docs/public/logo.svg`，浏览器图标使用 `docs/public/favicon.ico`。

- 浏览器图标：`config.mts` 的 `head` 中 `rel: 'icon'`。
- 导航栏 Logo：`themeConfig.logo`。
- 首页大 Logo：`docs/index.md` 的 `hero.image`。

只替换同名图片即可更新资源；换文件名时要同步修改上述引用。当前 ICO 图标的 MIME 类型是 `image/x-icon`。Logo 为深色图形，深色模式通过 CSS 反色以保持清晰。

浅色与深色可以配置不同图片：

```ts
logo: {
  light: '/logo-light.png',
  dark: '/logo-dark.png',
  alt: '网站 Logo'
}
```

这是写法示例，使用前需提供对应图片。透明背景图片更方便与首页光晕融合。

## 自定义社交图标

`themeConfig.socialLinks` 当前包含 GitHub 与邮件入口。邮件使用 `mailto:` 地址，点击后调用访问者的邮件应用，不会由网站直接发送邮件。

自定义图标通过 `icon: { svg: 'SVG 字符串' }` 配置，并补充 `ariaLabel`。默认主题会对 SVG 设置 `fill: currentColor`，应使用适配填充的路径，或在子图形上明确指定 `fill="none"`，避免空心图标被填成实心块。

## 修改品牌颜色

`theme/index.ts` 继承默认主题并加载 `custom.css`。只需覆盖主题变量，不修改依赖包中的文件。

```css
:root {
  --vp-c-brand-1: #495BE4; /* 链接与选中状态 */
  --vp-c-brand-2: #3D4DCC; /* 悬停颜色 */
  --vp-c-brand-3: #495BE4; /* 品牌按钮背景 */
  --vp-c-brand-soft: rgba(73, 91, 228, 0.14);
}
```

`.dark` 中单独配置深色模式，文字采用较亮的蓝色以便阅读。修改后同时检查链接、按钮、选中菜单和明暗主题；`head` 中的 `theme-color` 仅影响部分浏览器界面，不能代替网站 CSS。

## 修改首页 Logo 光晕

仍在 `custom.css` 中调整：

```css
:root {
  --vp-home-hero-image-background-image:
    linear-gradient(135deg, #495BE4 0%, #ffffff 50%, #363aa1 100%);
  --vp-home-hero-image-filter: blur(56px);
}
```

目前使用蓝、白、靛蓝渐变，深色模式降低了透明度。渐变控制颜色与方向，blur 控制边缘柔和程度；不需要修改 Logo 图片本身。

## 路径与部署设置

当前 `base` 为 `/`（自定义域名根路径），`cleanUrls` 已启用。部署到 `/doc/` 子路径时修改 `base` 并重新构建，同时检查图片与 favicon 地址。启用 cleanUrls 的托管服务应支持无后缀地址解析到 HTML 文件，部署后直接刷新深层页面验证是否出现 404。

`lastUpdated` 从 Git 读取更新时间，未提交的新文章没有该时间。`editLink` 已启用，页面底部的“在 GitHub 编辑此页”指向 `linfunss/linfun-doc` 仓库 `dev` 分支的对应 Markdown 文件；正式域名相关的 canonical 与分享地址应在明确部署地址后填写。

## 修改后检查

运行 `pnpm docs:build` 和 `pnpm docs:preview`，检查首页、任一笔记页面和维护页面，以及手机宽度和深色模式。构建成功仅表示静态构建通过，视觉效果仍需在浏览器检查。
