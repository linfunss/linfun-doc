---
title: Vue 项目初始化
description: Vue 项目初始化的实践笔记与说明
---

# Vue 项目初始化

---

### 配置 UnoCss

1. 安装 unocss 和配套 CSS 图标的图集

   ```shell
   npm install -D unocss @iconify/json
   ```

2. 根目录下（/uno.config.ts）

   ```ts
   import { defineConfig } from 'unocss'
   import presetWind3 from '@unocss/preset-wind3'
   import presetIcons from '@unocss/preset-icons'

   export default defineConfig({
       rules: [ // ...
       ],
       presets: [
           // 这里处理了unocss的 CSS变量导入
           // tailwind CSS
           presetWind3(),
           // 这里处理了unocss的 CSS图标导入
           presetIcons(),
       ],
   })
   ```

3. VUE项目文件增加：（/vite.config.js）：

   ```js
   import UnoCSS from 'unocss/vite'

   export default defineConfig({
     plugins: [
       UnoCSS(),
     ],
   })
   ```

   （/main.js）:

```js
import 'virtual:uno.css'
```


### 配置 Element Plus UI库

1. 安装 UI 库

   ```shell
   npm install element-plus --save
   ```

2. 安装自动导入插件

   ```shell
   npm install -D unplugin-vue-components unplugin-auto-import
   ```

3. VUE项目文件增加：（/vite.config.js）:

   ```js
   import AutoImport from 'unplugin-auto-import/vite'
   import Components from 'unplugin-vue-components/vite'
   import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

   export default defineConfig({
     plugins: [
       AutoImport({
         resolvers: [ElementPlusResolver()],
       }),
       Components({
         resolvers: [ElementPlusResolver()],
       }),
     ],
   })
   ```

   （/main.js）:

   ```js
   import 'element-plus/dist/index.css'
   import 'element-plus/theme-chalk/dark/css-vars.css' // 黑暗模式
   ```


### 配置 AXIOS

1. 安装 axios

   ```shell
   npm install axios
   ```

2. 配置 axios 封装（/src/api/axios.js）:

   ```js
   import axios from "axios";

   // 创建api实例
   const api = axios.create({
       baseURL: "https://example.com",
       timeout: 1000,  // 超时时间（毫秒）
       headers: { "Content-Type": "application/json" },
   });

   // 请求拦截器
   api.interceptors.request.use(
       (config) => {
           // 发送请求前的操作
           console.log("发送请求，请求拦截函数触发");
           return config;
       },
       (error) => {
           // 请求错误
           return Promise.reject(error);
       }
   );

   // 响应拦截器
   api.interceptors.response.use(
       (response) => {
           console.log("响应请求，响应拦截函数触发");
           return response.data;
       },
       (error) => {
           // 响应错误
           return Promise.reject(error);
       }
   );

   export default api;
   ```

3. 使用需要在具体组件里面导入（/src/APP.vue）:

   ```js
   import api from './api/axios'
   import { onMounted } from 'vue';

   onMounted(async () => {
       api.get('/api/v1/users').then(res => {
           console.log(res)
       })
   })
   ```

### 配置 vue-router

1. 安装 vue-router

   ```shell
   npm install vue-router@4
   ```

2. 配置 router 文件（/src/router/router.js）

   ```js
   import { createRouter, createWebHistory } from 'vue-router'

   // 配置
   const routes = [
       {
           path: '/home',
           name: 'home',
           component: () => import('../views/test.vue')
       },
       {
           path: '/',
           name: 'login',
           component: () => import('../views/login.vue')
       },
   ]

   // 路由实例
   const router = createRouter({
       history: createWebHistory(),
       routes
   })

   // 路由守卫
   router.beforeEach((to, from, next) => {
       console.log("路由守卫检测环节...")

       // 可以在此处核验用户是否有token，没有token就停止跳转网页
       // if (to.meta.requiresAuth && !isAuthenticated) {
       //     next('/login')
       // } else {
       //     next()
       // }

       next()  // 要继续执行路由跳转
   })

   export default router
   ```

   路由模式区别：**createWebHistory（HTML5模式）** 和 **createWebHashHistory（哈希模式）**

   相同点：在页面上 vue 都会拦截二者的跳转

   不同点：

   - 前者的 URL 比较漂亮：例如 example.com/login/

     - 当用户按 F5 刷新，或者直接用这个 URL 访问网站会得到404（纯静态服务器完全没有对应的这个 login.html文件）

     - ！！你需要做的：**你的要有一个规则文件（或者一个后端），把所有的 URL 访问统一定向到 index.html**。vue会处理加载页面后的跳转

   - 后者的 URL 会有一个 # 号：例如 example.com/#/home

     - 这条链接完全不会向服务器发送请求，不需要单独配置一个规则文件

     - ！！缺点：对搜索引擎不太友好

     （/src/main.js）

     ```js
     import router from './router/router'

     app.use(router)
     ```

     > 示例将路由页面放在 **/src/views**，目录可按项目约定调整。

     #### 适配 cloudflare pages 的规则文件

     （/public/_redirects）

     > 命名没有后缀

     ```text
     /* /index.html  200
     ```

   ## 开发用间距工具 Spacingjs

网站：[Spacing.js](https://spacingjs.com/)

添加在根目录文件：（/src/main.js）

```js
if (import.meta.env.DEV) {
    // 开发用间距工具，部署时需要移除
    console.log("当前处于开发模式")
    import('./assets/js/spacingjs').then(() => {
        console.log('已加载间距工具')
    }).catch(err => {
        console.error(err)
    })
}
```

### HTML 基本样式设置

（/index.html）

```css
* {
      font-family: 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
      margin: 0;
      padding: 0;
    }
```
