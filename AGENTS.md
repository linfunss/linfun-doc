# 开发与发布约定

### 1. 分支定位与生命周期
- **长期分支**：
  - `main`：生产环境稳定分支，绝对禁止直接 push。
  - `dev`：集成测试环境分支，作为功能合并与联调基准。
- **临时分支（用完即删）**：
  - 日常功能与问题修复（`feat/*`、`fix/*`）必须基于最新 `dev` 单独切出新分支开发，**禁止直接在 `dev` 或 `main` 上编码**。
  - 特性分支提 PR 合并进 `dev` 并确认后，**必须立即删除该特性分支**。

### 2. PR 与合并策略规范（关键：避免幽灵提交）
- **特性分支合入 `dev` (`feat/* -> dev`)**：
  - 允许使用 **Squash and merge** 或 **Rebase and merge**，保持 `dev` 线性干净。
- **发布合并 (`dev -> main`)**：
  - **严禁使用 Squash and merge 或 Rebase！**
  - **必须严格使用 Create a merge commit（Merge commit）**，以保留分支共同祖先拓扑，防止后续 PR 重复带入已合并的历史提交。

### 3. 发布与同步闭环（发版必做）
1. **合并上线**：通过 PR（Merge commit 方式）将 `dev` 合入 `main`。
2. **本地同步与打标**：
   - 切换到本地 `main`，执行 `git pull --ff-only origin main` 拉取最新代码。
   - 在已同步的 `main` 上创建 GPG 签名版本标签并推送标签（`git push origin <tag>`）。
   - 严禁在 `dev` 或未同步的 `main` 上打发布标签。
3. **反向同步闭环（Sync-back）**：
   - 发版完成后，**必须立即将 `main` 合并回 `dev`**，保持基线 1:1 对齐：
     ```bash
     git checkout dev
     git pull origin dev
     git merge origin/main
     git push origin dev
     ```

### 4. 签名与安全
- 所有的日常 Commit、PR 合并节点以及版本 Tag，均必须配置并启用 GPG 签名。

### 5. Commit 语义 emoji 规范

- Commit 标题使用 `emoji type(范围): 中文说明` 格式，选择一个与本次主要变更语义匹配的 emoji；emoji 不替代类型、范围和明确的中文说明。
- 常用对应：✨ `feat` 新功能、🐛 `fix` 缺陷修复、♻️ `refactor` 重构、📝 `docs` 文档、🧪 `test` 测试、👷 `ci` 持续集成与发布流程、📦 `build` 构建与依赖、⚡️ `perf` 性能优化、🔧 `chore` 工程维护、⏪ `revert` 回退。
- 示例：`👷 ci(前端发布): 增加版本标签构建与产物发布`、`🐛 fix(工单): 修复取件码长度校验`。不要堆叠装饰性 emoji 或用成功标记代替实际验证说明。
- 正文继续用中文说明改动原因、验证结果和未验证项；沿用 GPG 签名要求，不为补 emoji 改写既有提交历史。
