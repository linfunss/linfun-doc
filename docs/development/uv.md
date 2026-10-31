---
title: uv 包管理器
description: uv 包管理器的实践笔记与说明
---

# uv 包管理器

uv 为项目管理 Python 版本、虚拟环境与依赖。pip 本身也可配合虚拟环境隔离依赖，并非只能安装到全局解释器。

项目通常仍有 `.venv`，uv 利用统一缓存减少重复下载，并根据平台及文件系统采用克隆、硬链接或复制；跨文件系统不保证能使用硬链接，因此不能保证所有项目完全不重复占用存储。缓存目录可用 `uv cache dir` 查看。

并且它的命令非常地简单

```powershell
uv init    # 初始化uv项目
uv add flask    # 添加一个包
uv remove flask    # 删除
uv sync    # 拿到一个uv项目后，安装所有的项目依赖
uv run hello.py    # 运行脚本
```

可以类比npm项目:

|     | 声明依赖           | 锁版本                 |
| --- |:-------------- | ------------------- |
| uv  | `pyproject.toml` | `uv.lock`           |
| npm | `package.json` | `package-lock.json` |

---

## 项目管理中的`.env`环境变量使用

简单分类：

- 正常的分类：`文件路径` `数据库的位置` 等配置放在config中。

- 敏感分类：`jwt私钥` `smtp密码` `授权ak sk` 等隐私配置放在 `.env` 中。

二者相互结合更为好用，隐私信息通过环境注入的方式使用更安全，且运维麻烦程度比全部放在config.yaml中更加减少。

同样，dockerfile也可以注入环境变量，那么对于docker使用也更加方便

> 本文采用启动时加载配置的应用约定。是否支持热重载取决于应用实现；修改容器环境通常需要重新创建容器。`.env` 文件不提交到仓库。

## 官方参考

[uv 缓存机制](https://docs.astral.sh/uv/concepts/cache/)。
