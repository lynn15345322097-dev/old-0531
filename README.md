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

## 小程序运行模式

当前仓库默认开启 **本地演示模式**（`DEMO_MODE = true`），不连云开发，所有数据来自代码里的种子数据，clone 下来即可直接看到完整演示。开关在：

```js
miniprogram/utils/demoStore.js
const DEMO_MODE = true   // 本地演示；false 走云开发
```

演示模式下：

- 首页、博物馆读取 `demoStore.js` 中的种子藏品
- 上传图片只在本地创建藏品并进入详情页
- 接龙内容保存在微信开发者工具的本地缓存（`wx.storage`）
- 每次接龙会根据本地线索分析更新修复度
- 修复完成后可生成本地展品卡，并保留不同家庭成员的记忆视角

## 拉到仓库后如何看到「和作者一样」的画面

> 你和别人电脑上不一样，最常见的原因是：本地缓存里残留了你之前点过的接龙/上传/修复进度，而对方是干净状态。

**步骤：**

1. 用微信开发者工具导入本目录（基础库 ≥ 3.8.0，AppID 用 `wx74954e5be6ac2037` 或你自己的测试号——演示模式不依赖 AppID）。
2. 打开后进入「我的」Tab，点击底部的 **「恢复初始展品」** 按钮。
3. 此时双方看到的就是 `demoStore.js#initialState()` 里写死的同一份初始状态。

如果你希望对方看到的不是"初始演示版"，而是 **你电脑上当前的进度**，光靠 GitHub 不够——你那部分进度在微信开发者工具的本地缓存里，不在仓库代码里。两种办法二选一：

- 把你想展示的藏品、记忆、身份状态写回 `miniprogram/utils/demoStore.js` 的 `initialState()`，commit 后对方点「恢复初始展品」即可；
- 或者关掉演示模式（`DEMO_MODE = false`），双方接入同一个云开发环境和数据库，按下文「云开发准备」配置。

## 云开发准备（仅当 `DEMO_MODE = false` 时需要）

1. 微信开发者工具导入本目录
2. 开通云开发，创建集合：`families` `users` `objects` `memoryItems`
3. 部署 `cloudfunctions/` 下的云函数：`login` `createFamily` `joinFamily` `createObject` `addContribution` `getMuseumObjects` `getObjectDetail` `generateCard` `setMemoryRepair`
4. 每个云函数目录下需先 `npm install`（仓库未提交 `node_modules/`）
5. 可选：给 `generateCard` 配置环境变量 `AI_API_KEY` `AI_BASE_URL` `AI_MODEL`
