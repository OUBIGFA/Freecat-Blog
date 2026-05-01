# Git 提交时间数据 - 完全自动化

## ✨ 完全自动化！无需手动操作！

本项目已配置 **Git Pre-commit Hook**，每次您执行 `git commit` 时，会自动：

1. ✅ 提取所有文章的 Git 最后提交时间
2. ✅ 更新 `git-dates.json` 文件
3. ✅ 将 `git-dates.json` 自动添加到当前提交

**您只需要正常使用 Git，无需任何额外步骤！**

## 🔄 工作流程

```bash
# 1. 修改文章
vim writing/某篇文章.md

# 2. 直接提交（hook 会自动运行）
git add .
git commit -m "更新文章"

# 3. 推送到远程
git push
```

## 🎯 Vercel 部署

Vercel 构建时会读取仓库中的 `git-dates.json`，显示正确的"最后编辑"时间。

## 🛠️ 技术细节

- **Hook 位置**：`.git/hooks/pre-commit`
- **提取脚本**：`extract-git-dates.js`
- **数据文件**：`git-dates.json`（已纳入版本控制）

## ⚠️ 如需手动更新

虽然通常不需要，但您也可以手动运行：

```bash
cd all
npm run extract-dates
```

## 🔧 Hook 安装

Git hook 已自动配置在 `.git/hooks/pre-commit`。
如果您重新克隆了仓库，hook 会自动生效（因为它在 `.git` 目录中）。
