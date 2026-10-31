---
title: Cloudflare SSL/TLS 与 Tunnel 学习记录
description: Cloudflare SSL/TLS 与 Tunnel 学习记录的实践笔记与说明
---

# Cloudflare SSL/TLS 与 Tunnel 学习记录
> 原始笔记由 ChatGPT 辅助整理。

> 记录时间：2026-09-19
> 用途：保存本次关于 Cloudflare SSL/TLS、边缘证书、源站证书、Authenticated Origin Pulls、加密模式以及 Cloudflare Tunnel 的学习笔记。

---

## 1. 先建立最重要的整体模型

使用 Cloudflare 代理网站时，实际上存在 **两段独立的网络连接**：

```text
浏览器
   │
   │ ① 浏览器 ↔ Cloudflare
   │    HTTPS
   ▼
Cloudflare
   │
   │ ② Cloudflare ↔ 源站 ECS
   │    HTTP 或 HTTPS
   ▼
OpenResty / Nginx
   │
   ▼
应用（例如 Bludit）
```

因此：

- 浏览器看到的 HTTPS，不代表 Cloudflare → ECS 一定是 HTTPS。
- 浏览器验证的是 **Cloudflare 的边缘证书（Edge Certificate）**。
- Cloudflare 连接 ECS 时，则涉及 **源站证书（Origin Certificate）**。
- Cloudflare 的 SSL/TLS 加密模式决定 Cloudflare → 源站这一段如何连接。

这是理解 Cloudflare SSL/TLS 的核心。

---

## 2. Edge Certificate：边缘证书

### 2.1 它是什么？

Edge Certificate 是 Cloudflare 部署在其边缘节点上的证书。

当用户访问：

```text
https://example.com
```

实际上首先连接的是 Cloudflare：

```text
浏览器
   │
   │ HTTPS
   ▼
Cloudflare Edge
```

浏览器验证的是 Cloudflare 提供的 Edge Certificate。

例如 Cloudflare 控制台中可能看到：

```text
*.lin-fun.com, lin-fun.com
类型：通用
状态：受管理
到期：2026-11-01
```

这就是 Cloudflare Universal SSL 证书。

---

### 2.2 Universal SSL 的作用

例如证书覆盖：

```text
lin-fun.com
*.lin-fun.com
```

那么符合覆盖范围的域名可以通过 Cloudflare 的边缘节点使用 HTTPS：

```text
https://lin-fun.com
https://www.lin-fun.com
https://blog.lin-fun.com
```

Cloudflare 负责：

- 签发/管理证书
- 部署到边缘节点
- 自动续期
- 为访问者提供 HTTPS

因此一般不需要自己在 ECS 上维护浏览器侧的公网证书。

---

### 2.3 Edge Certificate 不等于源站证书

非常重要：

```text
浏览器
   │
   │ HTTPS
   │ Edge Certificate
   ▼
Cloudflare
   │
   │ HTTPS / HTTP
   │ Origin Certificate
   ▼
ECS
```

Edge Certificate 只负责：

> 浏览器 ↔ Cloudflare

它不负责：

> Cloudflare ↔ ECS

---

## 3. Origin Certificate：源站证书

如果希望：

```text
Cloudflare → ECS
```

这一段也使用 HTTPS，就需要源站支持 HTTPS。

可以在 ECS/OpenResty 上部署：

- 公共 CA 证书
- Cloudflare Origin CA Certificate

例如：

```text
浏览器
   │ HTTPS
   │ Edge Certificate
   ▼
Cloudflare
   │ HTTPS
   │ Origin Certificate
   ▼
OpenResty
   │
   ▼
Bludit
```

---

### 3.1 Cloudflare Origin CA

Cloudflare Origin CA 证书主要用于：

> Cloudflare ↔ 源站

它不是给普通浏览器直接验证的公网证书。

典型使用方式：

```text
Cloudflare
    │
    │ HTTPS
    │ 验证 Origin Certificate
    ▼
ECS / OpenResty
```

尤其适合使用：

> Full (strict)

---

## 4. SSL/TLS 加密模式

Cloudflare 的 SSL/TLS 加密模式控制的是：

> 浏览器 ↔ Cloudflare
> 以及
> Cloudflare ↔ 源站

两段连接之间的加密方式。

主要模式可以理解为：

| 模式            | 浏览器 → Cloudflare | Cloudflare → 源站 | 验证源站证书 |
| ------------- | ---------------- | --------------- | ------ |
| Off           | HTTP             | HTTP            | 否      |
| Flexible      | HTTPS            | HTTP            | 不涉及    |
| Full          | HTTPS            | HTTPS           | 否      |
| Full (strict) | HTTPS            | HTTPS           | 是      |

---

### 4.1 Flexible

```text
浏览器
   │ HTTPS
   ▼
Cloudflare
   │ HTTP
   ▼
ECS
```

优点：

- 源站不需要 HTTPS

缺点：

- Cloudflare → ECS 这一段没有 TLS 加密
- 不适合需要较高安全性的管理/业务系统

---

### 4.2 Full

```text
浏览器
   │ HTTPS
   ▼
Cloudflare
   │ HTTPS
   ▼
ECS
```

但是 Cloudflare 不严格验证源站证书。

因此源站证书可以是：

- 自签名
- 过期
- 主机名不匹配

在 Full 模式下仍可能建立连接。

---

### 4.3 Full (strict)

推荐的高安全标准方案：

```text
浏览器
   │ HTTPS
   │ Edge Certificate
   ▼
Cloudflare
   │ HTTPS
   │ Origin Certificate
   ▼
ECS
```

Cloudflare 会验证源站证书。

源站证书需要满足 Cloudflare 的验证要求，例如：

- 未过期
- 主机名匹配
- 由受信任的 CA 签发，或者使用 Cloudflare Origin CA

---

## 5. Certificate 与 Encryption Mode 的区别

这是非常容易混淆的地方。

### Certificate

回答：

> “你是谁？”

例如：

```text
Edge Certificate
→ Cloudflare 向浏览器证明自己的身份

Origin Certificate
→ 源站向 Cloudflare 提供身份
```

### Encryption Mode

回答：

> “这条连接是否使用 HTTPS，以及是否验证对方证书？”

所以：

```text
证书 = 身份证明

SSL/TLS 模式 = 连接策略
```

---

## 6. Client Certificate / Authenticated Origin Pulls

这是另一种完全不同的证书。

普通 HTTPS：

```text
Cloudflare ─────────> ECS
             ECS
          提供服务器证书
```

Cloudflare 验证：

> “你是不是正确的源站？”

---

### 6.1 Authenticated Origin Pulls（AOP）

AOP 可以让源站反过来验证：

> “连接我的客户端是不是 Cloudflare？”

架构：

```text
Cloudflare
   │
   │ Client Certificate
   ▼
ECS / OpenResty
   │
   │ 验证 Cloudflare 身份
   ▼
允许 / 拒绝
```

这属于客户端身份认证机制，可以理解为 TLS/mTLS 体系中的客户端认证。

---

### 6.2 不要把 Client Certificate 理解错

不是：

```text
把 Cloudflare Client Certificate
安装到 ECS
```

然后让 ECS 使用它。

正确关系是：

```text
Cloudflare
   │
   │ 持有 Client Certificate + Private Key
   ▼
ECS
   │
   │ 持有用于验证它的 CA / 证书信息
   ▼
验证 Cloudflare
```

也就是说：

> Cloudflare 持有客户端证书的私钥，源站负责验证 Cloudflare 的客户端身份。

---

## 7. 为什么 AOP 对源站保护有价值？

假设 ECS 公网 IP：

```text
203.0.113.10
```

即使网站使用 Cloudflare：

```text
用户 → Cloudflare → ECS
```

攻击者如果知道源站 IP，仍然可能尝试：

```text
攻击者 → 203.0.113.10
```

如果源站直接接受普通 HTTPS，那么仍然存在绕过 Cloudflare 的可能。

加入 AOP 后：

```text
攻击者
   │
   │ 没有 Cloudflare Client Certificate
   ▼
ECS
   │
   └── ❌ 拒绝
```

而 Cloudflare：

```text
Cloudflare
   │
   │ 正确 Client Certificate
   ▼
ECS
   │
   └── ✅ 接受
```

因此 AOP 的主要价值不是“把 HTTPS 再加密一次”，而是：

> **让源站能够验证访问者确实是 Cloudflare。**

---

## 8. Post-Quantum / 后量子加密

Cloudflare 还提供与源站连接相关的后量子密码学能力。

它解决的主要问题不是“证书是谁”，而是：

> TLS 建立连接时，双方如何协商会话密钥。

例如 Cloudflare 支持混合后量子密钥协商：

```text
X25519 + ML-KEM
```

具体算法可以是：

```text
X25519MLKEM768
```

可以简单理解成：

```text
传统密钥协商
      +
后量子密钥协商
      ↓
混合方案
```

重点：

> 后量子密钥协商 ≠ Origin Certificate

它们解决的是不同问题。

---

## 9. Cipher Suite 是什么？

Cipher Suite（密码套件）是在 TLS 握手过程中协商的一组密码算法组合。

它和：

- TLS 版本
- 证书
- 密钥交换
- 加密算法

等概念有关，但不是完全相同的东西。

可以先建立简单层次：

```text
HTTPS
  ↓
TLS
  ↓
TLS Handshake
  ↓
证书验证 + 密钥协商 + Cipher Suite
  ↓
建立加密会话
```

---

## 10. 你的 Bludit 网站遇到的 Mixed Content 问题

当时的实际架构大致是：

```text
浏览器 HTTPS
      ↓
Cloudflare
      ↓ HTTP
ECS
      ↓
OpenResty
      ↓
Bludit
```

但是 Bludit 生成的资源 URL 却是：

```text
http://example.com/bl-kernel/js/jquery.min.js
http://example.com/bl-themes/alternative/...
```

浏览器访问：

```text
https://example.com
```

然后发现页面内部引用：

```text
http://example.com/...
```

于是出现：

> Mixed Content

浏览器会阻止部分 HTTP CSS/JS 等资源。

---

## 11. 为什么会出现 Mixed Content？

核心不是简单的“Bludit 有 Bug”。

更准确地说，是：

> **反向代理/CDN/应用之间没有正确传递“原始请求是 HTTPS”这一信息。**

可能出现：

```text
浏览器
   │ HTTPS
   ▼
Cloudflare
   │ HTTP
   ▼
OpenResty
   │
   ▼
Bludit
```

Bludit 看到的连接可能是：

```text
HTTP
```

于是它认为自己的外部 URL 也是：

```text
http://example.com
```

最终生成错误的资源 URL。

---

## 12. X-Forwarded-Proto

反向代理通常通过：

```text
X-Forwarded-Proto
```

告诉后端：

> 用户最初使用的是什么协议访问。

例如：

```text
X-Forwarded-Proto: https
```

可以让后端知道：

```text
用户 → 网站
实际使用 HTTPS
```

---

### 12.1 注意 CDN 场景中的特殊问题

如果架构是：

```text
浏览器 HTTPS
    ↓
Cloudflare
    ↓ HTTP
OpenResty
```

那么 OpenResty 自己看到的：

```text
$scheme
```

可能是：

```text
http
```

因此不能机械地写：

```nginx
proxy_set_header X-Forwarded-Proto $scheme;
```

否则可能告诉 Bludit：

```text
原始协议 = HTTP
```

即使用户实际上是 HTTPS。

如果明确知道外部网站始终是 HTTPS，可以临时采用：

```nginx
proxy_set_header X-Forwarded-Proto https;
```

更完善的做法是根据 CDN 是否正确传递原始协议头来处理。

---

## 13. 你的 CDN / Cloudflare 两段连接要分开理解

你之前的第三方 CDN 源站配置类似：

```text
Origin URL:
http://203.0.113.10

TLS SNI:
example.com

Host Header:
example.com
```

这里特别需要注意：

> SNI 写了域名，并不自动意味着 Origin URL 就是 HTTPS。

如果 Origin URL 是：

```text
http://203.0.113.10
```

那么 CDN → ECS 仍然可能是 HTTP。

所以：

```text
SNI = example.com
```

不能单独证明：

```text
CDN → ECS = HTTPS
```

---

## 14. 1Panel 管理面板与网站应该分开考虑

网站：

```text
浏览器
   ↓ HTTPS
Cloudflare Proxy
   ↓
ECS
   ↓
OpenResty
   ↓
Bludit
```

1Panel 是服务器管理入口，安全要求通常更高。

不推荐长期使用：

```text
http://公网IP:1Panel端口
```

更合理的目标是：

```text
浏览器
   ↓ HTTPS
Cloudflare
   ↓
身份验证
   ↓
Tunnel
   ↓
ECS
   ↓
127.0.0.1:1Panel
```

---

## 15. Cloudflare Proxy 和 Cloudflare Tunnel 不是一回事

这是本次学习中另一个重要区别。

### Cloudflare Proxy

```text
浏览器
   │
   ▼
Cloudflare
   │
   │ 主动连接
   ▼
ECS 公网 IP
```

特点：

- 使用域名
- Cloudflare HTTPS
- CDN
- WAF
- DDoS 防护
- Cloudflare 仍然需要连接公网源站
- 源站通常仍存在公网入站端口

---

### Cloudflare Tunnel

ECS 上运行：

```text
cloudflared
```

然后由 ECS 主动向 Cloudflare 建立出站连接：

```text
ECS
  │
  │ 主动出站
  ▼
Cloudflare
```

用户访问：

```text
浏览器
   │
   │ HTTPS
   ▼
Cloudflare
   │
   │ Tunnel
   ▼
cloudflared
   │
   ▼
127.0.0.1:1Panel
```

---

## 16. Tunnel 可以理解为“软件化的反向隧道”

这个理解是正确的，但更准确的术语是：

> **基于出站连接建立的反向隧道 / 应用层代理。**

与传统内网映射相比：

### 传统端口映射

```text
公网
 ↓
公网IP:8080
 ↓
路由器
 ↓
192.168.1.100:80
```

核心是：

> 公网 → 内网

### Tunnel

```text
ECS
 ↓ 主动建立出站连接
Cloudflare
 ↑
用户
```

核心是：

> 内部服务主动连接中继平台，外部请求再通过已经建立的隧道进入内部服务。

因此它和 FRP、ngrok 等反向隧道工具在核心思想上有相似之处。

---

## 17. Tunnel 是长时间建立的吗？

是，但应该准确理解为：

> **Tunnel 作为一个逻辑服务长期存在，而不是一条 TCP/TLS 连接永久不变。**

例如：

```text
cloudflared 启动
       ↓
建立 Tunnel
       ↓
长期运行
       ↓
连接异常
       ↓
自动重新连接
       ↓
继续运行
```

所以：

```text
逻辑层：

ECS ═══════════════════ Cloudflare
           Tunnel


底层连接：

连接 A
  ↓
断开
  ↓
连接 B
  ↓
断开
  ↓
连接 C
  ↓
……
```

对用户而言，Tunnel 是一个持续存在的网络通道。

---

## 18. Tunnel 的安全价值

普通网站：

```text
浏览器
   ↓
Cloudflare
   ↓
公网 ECS
```

Tunnel：

```text
浏览器
   ↓
Cloudflare
   ↓
Tunnel
   ↓
ECS
```

Tunnel 的一个重要优势是：

> **ECS 不需要为了让 Cloudflare 访问服务而开放对应的公网入站端口。**

例如可以设计成：

```text
公网入站：

80       ❌
443      ❌
1Panel   ❌
SSH      ❌

公网出站：

443      ✅
```

具体规则仍然需要根据服务器管理需求配置。

---

## 19. Cloudflare Tunnel 与 1Panel 的推荐架构

对于服务器管理面板，可以考虑：

```text
                    Internet
                       │
                       ▼
                ┌──────────────┐
                │  Cloudflare  │
                │              │
                │ HTTPS        │
                │ Access       │
                └──────┬───────┘
                       │
                    Tunnel
                       │
                       ▼
                ┌──────────────┐
                │     ECS      │
                │              │
                │ cloudflared  │
                │      │       │
                │      ▼       │
                │  127.0.0.1  │
                │   :1Panel    │
                └──────────────┘
```

这样：

- 1Panel 不需要直接暴露公网管理端口
- 用户不需要直接访问 `IP:端口`
- Cloudflare 提供外部 HTTPS
- Tunnel 提供 Cloudflare → ECS 的通道
- Cloudflare Access 可以增加额外身份验证
- 可以进一步降低服务器公网攻击面

---

## 20. 一个完整的安全架构

如果同时经营网站和服务器管理面板，可以采用两套不同入口：

```text
                         Internet
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
        example.com                  panel.example.com
              │                           │
              ▼                           ▼
       Cloudflare Proxy             Cloudflare
              │                       Access
              │                           │
              ▼                         Tunnel
          ECS公网入口                     │
              │                           ▼
          OpenResty                    ECS
              │                           │
            Bludit                  127.0.0.1
                                      :1Panel
```

网站：

> Cloudflare Proxy 更适合 CDN、WAF、缓存和正常 Web 流量。

管理面板：

> Cloudflare Tunnel + Access 更适合减少公网入站暴露。

---

## 21. 最终记忆框架

以后看到 Cloudflare SSL/TLS 设置，可以按照下面的顺序理解：

```text
                    Cloudflare SSL/TLS
                           │
          ┌────────────────┴────────────────┐
          │                                 │
       Edge 侧                            Origin 侧
          │                                 │
   浏览器 ↔ Cloudflare                Cloudflare ↔ ECS
          │                                 │
   Edge Certificate                   Origin Certificate
                                            │
                                      Encryption Mode
                                            │
                              ┌─────────────┴─────────────┐
                              │                           │
                           Full                      Full(strict)
                              │                           │
                      HTTPS但不严格验证             HTTPS + 验证证书
```

如果继续提高源站安全性：

```text
Origin HTTPS
     ↓
Full (strict)
     ↓
Authenticated Origin Pulls
     ↓
限制只有 Cloudflare 可以访问
```

如果希望进一步减少公网暴露：

```text
公网源站
   ↓
Cloudflare Tunnel
   ↓
服务只监听内部地址
```

---

## 22. 一句话速查表

| 概念                 | 记忆方式                                |
| ------------------ | ----------------------------------- |
| Edge Certificate   | Cloudflare 给浏览器看的证书                 |
| Universal SSL      | Cloudflare 自动管理的边缘 SSL              |
| Origin Certificate | Cloudflare ↔ ECS 使用的源站证书            |
| Encryption Mode    | 决定 Cloudflare ↔ ECS 是否 HTTPS、是否验证证书 |
| Full               | HTTPS，但不严格验证源站证书                    |
| Full (strict)      | HTTPS + 严格验证源站证书                    |
| Client Certificate | Cloudflare 作为“客户端”证明自己身份            |
| AOP                | 源站验证“来的是不是 Cloudflare”              |
| Post-Quantum       | TLS 密钥协商层面的后量子安全                    |
| Cipher Suite       | TLS 握手中协商的密码算法组合                    |
| Cloudflare Proxy   | Cloudflare 代理公网源站                   |
| Cloudflare Tunnel  | ECS 主动连接 Cloudflare 的反向隧道           |
| Cloudflare Access  | 在访问服务前增加身份认证/访问控制                   |
| Mixed Content      | HTTPS 页面引用 HTTP 资源导致浏览器阻止           |

---

### 最核心的四句话

1. **Edge Certificate 负责浏览器 ↔ Cloudflare。**
2. **Origin Certificate 负责 Cloudflare ↔ ECS 的 HTTPS 身份验证。**
3. **AOP 让 ECS 可以验证“连接我的确实是 Cloudflare”。**
4. **Tunnel 则进一步改变网络入口：由 ECS 主动向 Cloudflare 建立出站隧道，从而可以避免直接暴露管理服务公网端口。**

## 补充说明

示例地址已替换为文档专用地址。AOP 的共享客户端证书证明请求来自 Cloudflare 网络，不等同于只允许自己的域名或账户；需要更细粒度隔离时使用自定义证书及源站访问控制。Tunnel 也需单独配置 Cloudflare Access 身份策略，才能保护管理面板。

参考：[Authenticated Origin Pulls](https://developers.cloudflare.com/ssl/origin-configuration/authenticated-origin-pull/)、[Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/)。
