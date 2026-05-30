# 云函数接口

## login

入参：

```js
{}
```

出参：

```js
{
  openid,
  user,             // 用户记录
  family,           // 家庭记录，未绑定时为 null
  needOnboarding    // true 表示需要创建/加入家庭
}
```

## createFamily

入参：

```js
{
  familyName,       // 家庭名称
  userName,         // 用户称呼
  role: "elder" | "family",
  relation: "爷爷" | "奶奶" | "爸爸" | "妈妈" | "孙女" | "其他"
}
```

出参：

```js
{
  familyId,
  familyName,
  inviteCode,       // 6 位数字邀请码
  user
}
```

## joinFamily

入参：

```js
{
  inviteCode,       // 6 位数字邀请码
  userName,         // 用户称呼
  role: "elder" | "family",
  relation: "爷爷" | "奶奶" | "爸爸" | "妈妈" | "孙女" | "其他"
}
```

出参：

```js
{
  family,
  user
}
```

## createObject

入参：

```js
{
  imageOriginal,
  imageProcessed
}
```

出参：

```js
{
  objectId,
  object
}
```

## addContribution

入参：

```js
{
  objectId,
  type: "question" | "memory" | "answer",
  source: "text" | "audio",
  contentText,
  audioUrl
}
```

出参：

```js
{
  contributionId,
  repairProgress,
  status
}
```

## generateCard

入参：

```js
{
  objectId
}
```

出参：

```js
{
  finalCard
}
```

## getMuseumObjects

入参：

```js
{
  status: "all" | "completed" | "repairing"
}
```

出参：

```js
{
  objects
}
```
