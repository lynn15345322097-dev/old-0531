# 家庭博物馆

> 那些没有被丢掉的东西

帮助家庭成员一起修复旧物记忆的微信小程序。微信原生 + 云开发 CloudBase。

## 目录结构

```text
miniprogram/
  app.js / app.json / app.wxss
  pages/
    index/        首页 Tab — 今天要做什么
    museum/       博物馆 Tab — 看成果
    profile/      我的 Tab — 家庭身份
    onboarding/   家庭绑定（首次）
    upload/       上传物件
    object/       藏品详情（三态：修复中 / 等生成 / 展品卡）
cloudfunctions/
  login/ createFamily/ joinFamily/
  createObject/ addContribution/
  getObjectDetail/ generateCard/ getMuseumObjects/
docs/
  database.md / api.md
老东西ui/          早期浏览器端预览工具（React）
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

## 藏品详情三态

```
status=repairing → 黑白模糊 + 接龙 + 输入
status=completed + !card → 清晰图 + 恭喜 + 生成展品卡
card 存在 → 展品卡（名称/人物/关键词/说明/记忆/留言）
```

## 云开发准备

1. 微信开发者工具导入本目录
2. 开通云开发，创建集合：`families` `users` `objects` `memoryItems`
3. 部署 `cloudfunctions/` 下 8 个云函数：`login` `createFamily` `joinFamily` `createObject` `addContribution` `getMuseumObjects` `getObjectDetail` `generateCard`
4. 可选：给 `generateCard` 配置环境变量 `AI_API_KEY` `AI_BASE_URL` `AI_MODEL`

## 小程序开发预览模式

小程序默认走云开发和真实家庭数据。需要离线调试交互流程时，可以临时开启本地预览模式。开关在：

```js
miniprogram/utils/demoStore.js
const DEMO_MODE = false
```

临时改成 `DEMO_MODE = true` 时，小程序不调用云函数，也不上传云存储：

- 首页、博物馆读取本地种子藏品
- 上传图片后直接创建本地藏品并进入详情页
- 接龙内容保存在本地缓存
- 每次接龙会根据本地线索分析更新修复度
- 修复完成后可以生成本地展品卡，并保留不同家庭成员的记忆视角

正式开发和提交前保持 `DEMO_MODE = false`，并确认云函数、数据库集合和云存储已配置完成。
