# 老东西

家庭博物馆 MVP 小程序。微信原生 + 云开发 CloudBase。

## 目录结构

```text
miniprogram/
  app.js / app.json / app.wxss
  pages/
    index/        首页 Tab
    museum/       博物馆 Tab
    profile/      我的 Tab
    onboarding/   家庭绑定
    upload/       上传物件
    object/       藏品详情
cloudfunctions/
  login/ createFamily/ joinFamily/
  createObject/ addContribution/
  generateCard/ getMuseumObjects/
docs/
  database.md
  api.md
```

## 页面路由

| 页面 | 路径 | 方式 |
|------|------|------|
| 首页 | `/pages/index/index` | Tab |
| 博物馆 | `/pages/museum/museum` | Tab |
| 我的 | `/pages/profile/profile` | Tab |
| 家庭绑定 | `/pages/onboarding/onboarding` | redirectTo |
| 上传物件 | `/pages/upload/upload` | navigateTo |
| 藏品详情 | `/pages/object/object?objectId=xxx` | navigateTo |

## 云开发准备

1. 微信开发者工具导入本目录
2. 开通云开发，创建集合：`families` `users` `objects` `contributions`
3. 上传并部署 `cloudfunctions/` 下所有云函数
4. 可选：给 `generateCard` 配置环境变量 `AI_API_KEY` `AI_BASE_URL` `AI_MODEL`
