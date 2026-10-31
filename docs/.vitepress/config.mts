// @ts-ignore Windows 本地编辑器无法解析 WSL 中的依赖
import { defineConfig } from 'vitepress'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// 本地开发使用展示占位；正式构建读取真实提交，兼容 CI 的 detached HEAD。
const isBuild = process.argv.includes('build')
const commit = isBuild ? execFileSync('git', ['rev-parse', 'HEAD'], {
  cwd: fileURLToPath(new URL('../..', import.meta.url)),
  encoding: 'utf8'
}).trim() : ''

// favicon 统一在这里维护。
const base = process.env.VITEPRESS_BASE || '/linfun-doc/'
const favicon = `${base}favicon.svg`

export default defineConfig({
  // 网站级配置：作用于整个站点。
  lang: 'zh-CN',
  title: 'LinFun',
  description: 'LinFun 的技术笔记',

  // 部署在域名根目录使用 /；如果部署到 example.com/doc/，改为 /doc/。
  base,
  titleTemplate: ':title | LinFun',  // 浏览器标签标题
  appearance: true, // 黑白切换
  lastUpdated: true,// 从 Git 提交读取修改时间。
  // 使用无后缀地址；部署服务器需支持将其解析到对应 HTML 文件。
  cleanUrls: true,
  // HTML <head> 元信息。未确定正式域名，因此暂不配置 canonical / og:url。
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: favicon }],
    ['meta', { name: 'theme-color', content: '#1677c8' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'LinFun' }]
  ],
  markdown: {
    // 所有代码块默认显示行号。
    lineNumbers: true
  },

  // VitePress 默认主题
  themeConfig: {
    buildCommit: { hash: commit ? commit.slice(0, 7) : 'a1b2c3d', url: commit ? `https://github.com/linfunss/linfun-doc/commit/${commit}` : 'https://github.com/linfunss/linfun-doc/commits/dev/' },
    // public 下的资源直接使用 /文件名，主题会自动处理部署 base。
    logo: { light: favicon, dark: favicon, alt: 'LinFun 文档 Logo' },
    // 导航栏title。
    siteTitle: 'LinFun',
    // 页脚默认显示在首页或没有侧边栏的页面。
    footer: { message: 'LinFun 的技术笔记' },
    lastUpdated: { text: '最后更新', formatOptions: { dateStyle: 'medium' } },
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换至浅色模式',
    darkModeSwitchTitle: '切换至深色模式',
    // 编辑入口指向 dev 分支；:path 会替换为当前 Markdown 的相对路径。
    editLink: { pattern: 'https://github.com/linfunss/linfun-doc/edit/dev/docs/:path', text: '在 GitHub 上编辑此页' },
    // 顶部导航：text 是显示文字，link 是访问地址。
    // docs/ 是内容根目录，不写进链接；Markdown 页面的链接也不用写 .md。
    nav: [
      {
            "text": "开发环境",
            "link": "/development/vue-setup",
            "activeMatch": "^/development/"
      },
      {
            "text": "部署与网络",
            "link": "/operations/docker",
            "activeMatch": "^/operations/"
      },
      {
            "text": "应用与游戏",
            "link": "/applications/simple-voice-chat",
            "activeMatch": "^/applications/"
      },
      {
            "text": "文档维护指南",
            "link": "/guide/getting-started",
            "activeMatch": "^/guide/"
      }
],

    // 按页面路径切换分类侧栏；新增文章须同时补充菜单。
    sidebar: {
      "/development/": [
            {
                  "text": "开发环境",
                  "collapsed": false,
                  "items": [
                        {
                              "text": "Vue 项目初始化",
                              "link": "/development/vue-setup"
                        },
                        {
                              "text": "GSAP 属性速查",
                              "link": "/development/gsap"
                        },
                        {
                              "text": "uv 包管理器",
                              "link": "/development/uv"
                        }
                  ]
            }
      ],
      "/operations/": [
            {
                  "text": "部署与网络",
                  "collapsed": false,
                  "items": [
                        {
                              "text": "Docker 简易示例",
                              "link": "/operations/docker"
                        },
                        {
                              "text": "GitHub Actions 部署 Pages",
                              "link": "/operations/github-cloudflare-pages"
                        },
                        {
                              "text": "Cloudflare SSL/TLS 与 Tunnel",
                              "link": "/operations/cloudflare-tls-tunnel"
                        }
                  ]
            }
      ],
      "/applications/": [
            {
                  "text": "应用与游戏",
                  "collapsed": false,
                  "items": [
                        {
                              "text": "Simple Voice Chat",
                              "link": "/applications/simple-voice-chat"
                        },
                        {
                              "text": "Google 手机验证记录",
                              "link": "/applications/google-verification"
                        }
                  ]
            }
      ],
      "/guide/": [
            {
                  "text": "文档维护指南",
                  "collapsed": false,
                  "items": [
                        {
                              "text": "维护入门",
                              "link": "/guide/getting-started"
                        },
                        {
                              "text": "文档编写与导航",
                              "link": "/guide/vitepress-example"
                        },
                        {
                              "text": "网站设置与主题",
                              "link": "/guide/branding"
                        },
                        {
                              "text": "Git 协作要求",
                              "link": "/guide/git-workflow"
                        }
                  ]
            }
      ]
},

    // 顶部社交图标：icon 使用默认主题支持的名称，也可以配置自定义 SVG。
    socialLinks: [
      // 自定义图标不依赖外部图标服务；ariaLabel 为屏幕阅读器提供名称。
      { icon: 'github', link: 'https://github.com/linfunss/linfun-doc' },
      // 默认主题对社交 SVG 设置 fill: currentColor，因此使用带镂空的填充路径。
      // mailto 会调用访问者的默认邮件应用。
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v1l8 5 8-5V6H4Zm16 3.36-7.47 4.67a1 1 0 0 1-1.06 0L4 9.36V18h16V9.36Z" clip-rule="evenodd"/></svg>'
        },
        link: 'mailto:shizhi_233@outlook.com',
        ariaLabel: '发送邮件至 shizhi_233@outlook.com'
      }
    ],

    // 本地全文搜索，无需配置外部搜索服务；正式索引在构建时生成。
    search: {
      provider: 'local',
      options: {
        // 本地搜索的按钮、弹窗提示与键盘操作说明。
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            displayDetails: '显示详细结果',
            resetButtonTitle: '清空搜索',
            backButtonTitle: '返回搜索',
            noResultsText: '未找到相关结果：',
            footer: {
              selectText: '选择',
              selectKeyAriaLabel: '回车键',
              navigateText: '切换结果',
              navigateUpKeyAriaLabel: '向上方向键',
              navigateDownKeyAriaLabel: '向下方向键',
              closeText: '关闭',
              closeKeyAriaLabel: '退出键'
            }
          }
        }
      }
    },

    // 右侧文章目录：收录 Markdown 的二级和三级标题（## 与 ###）。
    outline: { label: '目录', level: [2, 3] },

    // 文末上一篇/下一篇通常按侧边栏的页面顺序生成。
    docFooter: { prev: '上一篇', next: '下一篇' },
    // 移动端菜单与返回顶部按钮的中文文案。
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '返回顶部'
  }
})
