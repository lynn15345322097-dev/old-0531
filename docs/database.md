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
  memoryClues: {       // 线索汇总
    targetCount: 6,
    discoveredTypes: ["origin", "related_person"],
    labels: { origin: ["爷爷买的"], related_person: ["爷爷"] }
  },
  createdAt,
  updatedAt,
  completedAt
}
```

MVP 里 `imageProcessed` 可以先等于 `imageOriginal`。黑白模糊由前端根据 `repairProgress` 动态生成视觉效果。

`finalCard` 展品卡结构：

```js
{
  title,
  keywords,
  shortIntro,
  description,          // 物件第一人称叙事：由物件自己讲述，不使用第三人称或老人第一人称
  representativeQuote,  // 来自 memoryItems.contentText 的家人原话
  perspectives: [       // “家人记得”模块，保留真实人物视角
    { person, memory }
  ],
  museumTags
}
```

藏品详情页三态判断：
- `status=repairing` → 修复中
- `status=completed` 且无 `finalCard` → 等待生成展品卡
- 有 `finalCard` → 显示展品卡

## memoryItems 记忆条目表

```js
{
  _id,
  memoryId,            // 同 _id
  objectId,
  userId,
  authorName,
  authorRole,          // "elder" | "family"
  parentId,            // null 表示根条目，否则指向另一条 memoryId
  targetRole,          // null | "elder" | "family"，消息期望谁回应
  kind: "question" | "memory" | "answer",
  source: "text" | "audio",
  contentText,
  audioUrl,
  audioDuration,       // 秒，非音频为 0
  repairDelta,         // 本条新发现的线索类型数
  repairReason,        // 修复反馈文案，如"发现新线索：爷爷买的、搬家"
  analysis: {          // 线索分析结果
    clues: [{ type: "origin", label: "爷爷买的", evidence: "你爷爷以前买的" }],
    analyzer: "mock-v1"
  },
  createdAt
}
```
