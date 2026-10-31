---
title: Docker 简易示例
description: 带注释的 Dockerfile 与 Compose 入门示例
---

# Docker 简易示例

## Dockerfile

在项目根目录提供 `main.py` 和 `requirements.txt`（无依赖时可为空）。

```dockerfile
FROM python:3.13-slim
LABEL authors="LinFun"

# 设置容器工作目录。
WORKDIR /app
# 先复制依赖声明，业务代码变化时可复用依赖层缓存。
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# 再复制业务代码；通过 .dockerignore 排除密钥与开发缓存。
COPY . .
# exec 形式直接启动程序，便于接收容器停止信号。
CMD ["python", "main.py"]
```

原笔记同时设置了 `CMD ["python3", "main.py"]` 与 `ENTRYPOINT ["top", "-b"]`，exec 形式会把 CMD 追加为 ENTRYPOINT 的参数，不能据此启动 Python 程序。本示例只使用 CMD。[Dockerfile 官方参考](https://docs.docker.com/reference/dockerfile/)。

```text
# .dockerignore
.git
.venv
__pycache__
.env
```

## Compose 示例

下面演示一个 Nginx 与 Python HTTP 服务组成的网络。Python 内置 HTTP 服务仅用于演示；生产应用换成实际服务。若接入 Flask，应自行构建应用镜像。

```yaml
# compose.yaml；现代 Compose 可省略旧版 version 字段。
services:
  nginx:
    image: nginx:stable
    ports:
      # 宿主机端口:容器端口。
      - "8080:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - app
    networks:
      - own_network
  app:
    image: python:3.13-slim
    working_dir: /app
    volumes:
      - ./public:/app:ro
    command: ["python", "-m", "http.server", "5000", "--bind", "0.0.0.0"]
    networks:
      - own_network
networks:
  own_network: {}
```

创建 `public/index.html` 与同目录的 `nginx.conf`：

```nginx
server {
    listen 80;
    location / {
        # Compose 网络内通过服务名解析应用地址。
        proxy_pass http://app:5000;
    }
}
```

```bash
docker compose config
docker compose up -d
# 访问 http://localhost:8080 后查看日志。
docker compose logs -f
docker compose down
```

Compose 默认会为项目创建网络；此处显式声明网络用于展示配置。`depends_on` 控制启动顺序，不保证应用已经就绪。HTTPS 需要另外配置证书及 Nginx TLS 监听，单独映射 443 端口不会自动启用 HTTPS。
