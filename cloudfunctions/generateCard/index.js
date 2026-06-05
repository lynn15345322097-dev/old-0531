const https = require('https')
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

const SYSTEM_PROMPT = `你是一位家庭博物馆策展人。你的任务是根据家庭成员围绕一件旧物留下的真实记忆，生成一张家庭展品卡。

必须遵守以下规则：

1. 只能使用用户提供的记忆内容，不得编造人物、年代、事件、情节、用途或情感。
2. 如果信息不足，要写得克制，可以保留“不确定”“家人还没有说清”的表达。
3. 不要写成通用抒情文，不要使用空泛套话，例如“承载了岁月”“见证了时代”“满载回忆”等。
4. representativeQuote 必须直接来自 memoryItems 中的 contentText 原文，不能改写，不能编造。
5. 如果某条记忆 source 是 audio，但没有 transcriptText，则只能说明“留下了一段语音记忆”，不能推测语音内容。
6. description 的叙述者必须是物件本身，用物件第一人称“我”来写。不要使用第三人称介绍物件，也不要使用任何家庭成员的第一人称。
7. description 要通过物件视角讲述：我是谁、我和谁有关、我经历过什么、为什么我一直被留下。长度控制在 120-200 字。
8. 物件第一人称要温暖、克制、有故事感，不拟人过度，不像童话，不卖萌，不煽情。
9. perspectives 是“家人记得”模块，只整理真实人物视角，不能改成物件口吻。
10. museumTags 只能从以下标签中选择 1-3 个：
   "厨房馆"、"人物馆"、"迁徙馆"、"劳动馆"、"节庆馆"、"日常馆"、"手艺馆"、"童年馆"。
11. 只输出严格 JSON，不要 Markdown，不要解释。`

const VALID_TAGS = ['厨房馆', '人物馆', '迁徙馆', '劳动馆', '节庆馆', '日常馆', '手艺馆', '童年馆']

function isPlaceholderText(text) {
  if (!text) return true
  const placeholders = [
    '留下了一段语音',
    '我用语音讲了一段',
    '留下了一段语音记忆'
  ]
  return placeholders.some((p) => text.includes(p))
}

function findRepresentativeQuote(memoryItems) {
  for (const item of memoryItems) {
    if (item.source === 'audio' && !item.transcriptText) continue
    if (item.contentText && !isPlaceholderText(item.contentText)) {
      return item.contentText
    }
  }
  return ''
}

function buildPerspectives(memoryItems) {
  return memoryItems
    .filter((item) => {
      if (item.source === 'audio' && !item.transcriptText) return false
      return item.contentText && !isPlaceholderText(item.contentText)
    })
    .slice(0, 6)
    .map((item) => ({
      person: item.authorName || '家人',
      relation: item.authorRelation || '',
      memory: item.contentText
    }))
}

function fallbackCard(object, memoryItems) {
  const quote = findRepresentativeQuote(memoryItems)
  const perspectives = buildPerspectives(memoryItems)

  const titlePrefix = object.title && object.title !== '未知藏品'
    ? object.title
    : (object.objectNo || '这件旧物')

  let description = ''
  if (perspectives.length >= 2) {
    const detail = perspectives.map((p) => p.memory).join('。')
    description = `我是${titlePrefix}。家人围着我留下了${perspectives.length}段记忆，他们说起我的来处、用过我的人，也说起我差点被忘记的时刻。我不替他们补全没有说出口的故事，只把这些已经被记起的细节留在身上：${detail}`.slice(0, 200)
  } else {
    description = `我是${titlePrefix}。家人还没有把我的来处说完整，只留下了几句关于我的记忆。我先安静地待在这里，等他们继续说起我是谁、和谁有关，又为什么一直没有被丢掉。`
  }

  return {
    title: `${titlePrefix}`,
    keywords: ['旧物', '家庭记忆'],
    shortIntro: perspectives.length
      ? `${perspectives.length}位家人留下了关于这件旧物的记忆`
      : '记忆还在收集和修复中',
    description,
    representativeQuote: quote,
    perspectives,
    museumTags: ['日常馆']
  }
}

function callAi(prompt) {
  const apiKey = process.env.AI_API_KEY
  if (!apiKey) return Promise.resolve(null)

  const baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1/chat/completions'
  const model = process.env.AI_MODEL || 'gpt-4.1-mini'
  const url = new URL(baseUrl)
  const body = JSON.stringify({
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7
  })

  return new Promise((resolve, reject) => {
    const req = https.request({
      method: 'POST',
      hostname: url.hostname,
      path: `${url.pathname}${url.search}`,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          const content = json.choices && json.choices[0] && json.choices[0].message.content
          resolve(content ? JSON.parse(content) : null)
        } catch (error) {
          reject(error)
        }
      })
    })

    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

exports.main = async (event) => {
  if (!event.objectId) {
    throw new Error('objectId is required')
  }

  const now = db.serverDate()
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const userQuery = await db.collection('users').where({ openid }).limit(1).get()
  const user = userQuery.data.length ? userQuery.data[0] : null
  if (!user || !user.familyId) {
    throw new Error('用户不存在，请先登录')
  }

  const objectRes = await db.collection('objects').doc(event.objectId).get()
  const object = objectRes.data
  if (!object) {
    throw new Error('藏品不存在')
  }
  if (object.familyId !== user.familyId) {
    throw new Error('你不属于该藏品所属的家庭')
  }

  const memoryItemsRes = await db.collection('memoryItems')
    .where({ objectId: event.objectId })
    .orderBy('createdAt', 'asc')
    .get()

  const memoryItems = memoryItemsRes.data.filter((item) => {
    return item.familyId === user.familyId
  })

  const prompt = `请根据下面这件旧物和家人留下的 memoryItems，生成一张家庭博物馆展品卡。

输出 JSON 字段必须是：

{
  "title": "展品名称，格式类似：一直没有换的白瓷茶杯",
  "keywords": ["3-5 个关键词"],
  "shortIntro": "30 字以内的一句话简介",
  "description": "120-200 字展品说明。必须使用物件第一人称“我”，由物件自己讲述，不能使用第三人称或任何家庭成员第一人称",
  "representativeQuote": "一句来自 contentText 的家人原话；如果没有合适原话，返回空字符串",
  "perspectives": [
    {
      "person": "说话人",
      "relation": "说话人与家庭的关系，例如 奶奶 / 爸爸 / 妈妈 / 孙女；没有则返回空字符串",
      "memory": "这个人提供的真实记忆，保持人物视角，不能改成物件口吻，不能虚构"
    }
  ],
  "museumTags": ["从限定标签中选择 1-3 个"]
}

旧物信息：
${JSON.stringify({
  title: object.title || '未知藏品',
  objectNo: object.objectNo || '',
  status: object.status || '',
  repairProgress: object.repairProgress || 0
})}

记忆条目 memoryItems：
${JSON.stringify(memoryItems.map((item) => ({
  authorName: item.authorName,
  authorRelation: item.authorRelation,
  kind: item.kind,
  source: item.source,
  contentText: item.contentText,
  transcriptText: item.transcriptText || '',
  audioDuration: item.audioDuration || 0,
  parentId: item.parentId || null
})))}

注意：
- contentText 如果是“我留下了一段语音”“我用语音讲了一段故事”这类占位句，不能当作真实原话。
- source 为 audio 且 transcriptText 为空时，不要推测语音内容。
- description 负责物件视角：物件自己说“我是谁、我和谁有关、我经历过什么、为什么我一直被留下”。
- perspectives 是“家人记得”模块，只整理有真实文字内容的记忆，保留真实人物视角。
- perspectives 必须保留 authorName 和 authorRelation，分别放入 person 和 relation。
- 不要把 description 写成童话、卖萌文、夸张拟人或煽情独白。
- 如果记忆很少，宁可简短，也不要补故事。`

  let finalCard = null
  let aiGenerated = false
  try {
    finalCard = await callAi(prompt)
    if (finalCard) {
      aiGenerated = true
      // 清洗 museumTags，确保只用限定标签
      if (finalCard.museumTags) {
        finalCard.museumTags = finalCard.museumTags.filter((t) => VALID_TAGS.includes(t))
        if (!finalCard.museumTags.length) finalCard.museumTags = ['日常馆']
      }
      if (finalCard.perspectives && finalCard.perspectives.length) {
        const relationByName = {}
        for (const item of memoryItems) {
          if (item.authorName && item.authorRelation && !relationByName[item.authorName]) {
            relationByName[item.authorName] = item.authorRelation
          }
        }
        finalCard.perspectives = finalCard.perspectives.map((item) => ({
          ...item,
          relation: item.relation || relationByName[item.person] || ''
        }))
      }
    }
  } catch (error) {
    finalCard = null
  }

  if (!finalCard) {
    finalCard = fallbackCard(object, memoryItems)
  }

  await db.collection('objects').doc(event.objectId).update({
    data: {
      title: finalCard.title,
      displayTitle: finalCard.title,
      finalCard,
      aiGenerated,
      status: 'completed',
      repairProgress: 100,
      updatedAt: now,
      completedAt: now
    }
  })

  return {
    finalCard
  }
}
