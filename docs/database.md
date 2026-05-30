# 数据库字段

## families 家庭表

```js
{
  _id,
  familyId,
  familyName,
  inviteCode,         // 6 位数字邀请码，用于家人加入
  creatorOpenid,      // 创建者的 openid
  createdAt,
  updatedAt
}
```

## users 用户表

```js
{
  _id,
  userId,
  openid,
  familyId,           // 所属家庭，null 表示未绑定
  name,               // 称呼
  role: "elder" | "family",
  relation: "爷爷" | "奶奶" | "爸爸" | "妈妈" | "孙女" | "其他",
  createdAt,
  updatedAt
}
```

role 数据库值 `elder`/`family`，前端显示 `老东西`/`小东西`。

MVP 一个用户只属于一个家庭。以后如需多家庭，再加 `family_members` 关联表。

## objects 藏品表

```js
{
  _id,
  objectId,
  objectNo,
  familyId,
  uploaderId,
  title,
  displayTitle,
  imageOriginal,
  imageProcessed,
  repairProgress,
  status: "repairing" | "completed",
  finalCard,
  aiGenerated,
  createdAt,
  updatedAt,
  completedAt
}
```

MVP 里 `imageProcessed` 可以先等于 `imageOriginal`。黑白模糊由前端根据 `repairProgress` 动态生成视觉效果。

藏品详情页三态判断：
- `status=repairing` → 修复中
- `status=completed` 且无 `finalCard` → 等待生成展品卡
- 有 `finalCard` → 显示展品卡

## contributions 接龙表

```js
{
  _id,
  contributionId,
  objectId,
  userId,
  authorName,
  authorRole,
  type: "question" | "memory" | "answer",
  source: "text" | "audio",
  contentText,
  audioUrl,
  createdAt
}
```
