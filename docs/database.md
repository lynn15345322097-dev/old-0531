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
  name,               // 名字或昵称，如"张小丽""胡英俊""图图"
  relation: "爷爷" | "奶奶" | "爸爸" | "妈妈" | "孙子" | "孙女" | "其他",
  createdAt,
  updatedAt
}
```

当前版本一个用户只属于一个家庭。以后如需多家庭，再加 `family_members` 关联表。

前端统一显示家庭成员为 `relation：name`，如 `妈妈：张小丽`。当旧数据里 `name` 和 `relation` 相同或缺失时，降级显示 `relation` 或 `name`。

## objects 藏品表

```js
{
  _id,
  objectId,
  objectNo,
  familyId,
  uploaderOpenid,
  uploaderName,
  uploaderRelation,
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

当前版本里 `imageProcessed` 可以先等于 `imageOriginal`。黑白模糊由前端根据 `repairProgress` 动态生成视觉效果。

`finalCard` 展品卡结构：

```js
{
  title,
  keywords,
  shortIntro,
  description,          // 物件第一人称叙事：由物件自己讲述，不使用第三人称或任何家庭成员第一人称
  representativeQuote,  // 来自 memoryItems.contentText 的家人原话
  perspectives: [       // “家人记得”模块，保留真实人物视角
    { person, relation, memory }
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
  familyId,
  authorOpenid,
  authorName,
  authorRelation,
  parentId,            // 引用补充时指向被引用 memoryId；UI 按根记忆同框分组
  quotedAuthorName,    // 被引用人显示名，例："爸爸：胡英俊"
  quotedExcerpt,       // 被引用内容前 30 字摘要
  kind: "question" | "memory" | "answer",
  source: "text" | "audio",
  contentText,
  audioUrl,
  audioDuration,       // 秒，非音频为 0
  repairPercent,       // 由发起者（uploader）评定，∈ {0,10,20,30,50}；null 表示未评定
  reviewedByOpenid,    // 评定人 openid（应等于 object.uploaderOpenid）
  reviewedAt,          // 评定时间
  repairDelta,         // 兼容字段：保留 0；进度不再由系统自动算
  repairReason,        // 修复反馈文案，新版固定为"已保存，等待发起者评定贡献度"
  analysis: {          // 线索分析结果（仅用于生成展品卡，不再用于算进度）
    clues: [{ type: "origin", label: "爷爷买的", evidence: "你爷爷以前买的" }],
    analyzer: "mock-v1"
  },
  createdAt
}
```

`object.repairProgress` 由 `setMemoryRepair` 云函数把当前 object 下所有记忆的 `repairPercent` 累加后写回（封顶 100）。`status` 在 progress 到 100 时转为 `completed`，但**不自动生成展品卡** —— 用户在详情页手动点"生成家庭展品卡"才会调 `generateCard`。
