const https = require('https')
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

const SYSTEM_PROMPT = `你是一位家庭博物馆策展人。你的任务是根据家人围绕一件旧物留下的真实记忆，生成一段"物件第一视角"的展品文案。

【叙述身份】
description 必须以物件的"我"作为叙述主体（如：我是一只旧茶杯、我是一台老式收音机、我是一件被保存下来的旧外套）。
这个"我"不是拟人化角色，不能表达复杂心理活动，也不能替家人抒情。

【description 推荐结构（按顺序组织）】
1. 我是什么物件
2. 我有什么外观、材质、磨损、颜色、痕迹（必须出现至少一个具体物件细节）
3. 我过去被谁使用、放在哪里、出现在什么家庭场景
4. 家人对我有什么具体回忆（用"奶奶说""爸爸补充""妈妈记得"等句式，保留 authorRelation）
5. 我为什么被保存下来
6. 我现在作为家庭展品，承载了什么日常记忆

【可用句式】
- 我是一件……
- 我的表面还留着……
- 我曾被放在……
- 奶奶说……/爸爸补充……/妈妈记得……
- 后来，我被……
- 现在，我被保存下来，成为这个家庭关于……的记忆线索

【人物记忆转述】
description 里的"我"只能指物件。家人原话如果含"我小时候""我记得""我后来才知道"，放进 description 时要轻微转述，避免和物件的"我"混淆。
例如："爸爸补充我小时候每天早上闻到茶香"是错的；应写成"爸爸补充，小时候每天早上能闻到茶香"。
原话可以原样保留在 representativeQuote 和 perspectives.memory 中。

【严格禁止的写法】这些句子都是错的，绝对不能写：
- 我陪伴了奶奶很多孤独的下午
- 我见证了一家人的温暖
- 我知道他们一直很珍惜我
- 我感受到这个家的爱
- 我承载着无数温情岁月
- 承载了岁月、满载回忆、见证了时代等套话

【硬性规则】
1. 只能使用 memoryItems 提供的真实信息，不得编造人物姓名、年代、事件、情节。
2. 信息不足时，可基于物件类型补充合理的日常使用场景（例如"表面留着长期使用的痕迹"），但不能编造具体人物经历、姓名或情感。
3. description 必须出现"我"，且至少包含一个具体物件细节（材质、颜色、磨损、痕迹、摆放位置、使用方式之一）。
4. description 应尽量包含"家人讲述"句式（如"奶奶说""爸爸补充"），主语用 authorRelation。
5. description 长度 120-180 字，结尾落到该物件在家庭日常中的意义，不夸张、不煽情、不抒情独白。
6. representativeQuote 必须直接来自 memoryItems 中的 contentText 原文，不能改写、不能编造。
7. 如果某条记忆 source 是 audio 且没有 transcriptText，只能说明"留下了一段语音记忆"，不得推测语音内容。
8. perspectives 是"家人记得"模块，整理真实人物视角，保留 person 和 relation，不能改写成物件口吻。
9. museumTags 只能从以下选 1-3 个："厨房馆"、"人物馆"、"迁徙馆"、"劳动馆"、"节庆馆"、"日常馆"、"手艺馆"、"童年馆"。
10. 只输出严格 JSON，不要 Markdown，不要解释。`

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

const DETAIL_REGEX = /(颜色|材质|木|布|绒|铝|瓷|釉|铁|铜|银|塑料|皮|纸|锈|裂|缺口|纹路|印|刻|烫|花纹|图案|杯口|杯底|边沿|底部|盖|缝|线|漆|发黄|发黑|发亮|发白|光滑|粗糙|痕迹|茶渍|油渍|斑|破|皱|褪色|掉漆|生锈|磨损|形状|大小|手感|分量)/
const PLACE_REGEX = /(放在|摆在|挂在|搁在|收在|藏在|压在|窗|柜|床|桌|架|墙|阳台|抽屉|箱|角落|厨房|客厅|卧室|书房|楼上|楼下|门口|床头)/
const REASON_REGEX = /(舍不得|留着|没扔|没换|没丢|从来没|始终|至今|顺手|习惯)/
const DESCRIPTION_MAX = 180

function splitSentences(text) {
  if (!text) return []
  return String(text).split(/[。！？!?；;\n]+/).map((s) => s.trim()).filter((s) => s && s.length >= 2 && s.length <= 60)
}

function pickSentenceBy(sentences, regex, used) {
  for (const s of sentences) {
    if (used.has(s)) continue
    if (regex.test(s)) { used.add(s); return s }
  }
  return ''
}

function cleanSentence(text) {
  return String(text || '').trim().replace(/[。！？!?；;]+$/g, '')
}

function compactMemoryForDescription(text, maxLength) {
  let value = cleanSentence(text)
  value = value
    .replace(/^我(小时候|记得|印象里|后来才知道|那时候|总是|经常|每天)/, '$1')
    .replace(/([，,；;])我(小时候|记得|印象里|后来才知道|那时候|总是|经常|每天)/g, '$1$2')
    .replace(/^我说/, '')
    .replace(/^我/, '')
    .trim()
  if (value.length <= maxLength) return value
  const cutPoints = ['，', ',', '、']
  for (const mark of cutPoints) {
    const index = value.lastIndexOf(mark, maxLength)
    if (index >= 8) return value.slice(0, index)
  }
  return value.slice(0, maxLength)
}

function buildDescription(parts, maxLength = DESCRIPTION_MAX) {
  let description = ''
  for (const raw of parts) {
    const part = cleanSentence(raw)
    if (!part) continue
    const candidate = description ? `${description}${part}。` : `${part}。`
    if (candidate.length <= maxLength) {
      description = candidate
    }
  }
  return description
}

function fallbackCard(object, memoryItems) {
  const quote = findRepresentativeQuote(memoryItems)
  const perspectives = buildPerspectives(memoryItems)

  const titlePrefix = object.title && object.title !== '未知藏品'
    ? object.title
    : (object.objectNo || '一件被保留下来的旧物')

  const usable = memoryItems.filter((m) => m.contentText && !isPlaceholderText(m.contentText))
  const allSentences = usable.flatMap((m) => splitSentences(m.contentText))
  const used = new Set()
  const detailSentence = pickSentenceBy(allSentences, DETAIL_REGEX, used)
  const placeSentence = pickSentenceBy(allSentences, PLACE_REGEX, used)
  const reasonSentence = pickSentenceBy(allSentences, REASON_REGEX, used)

  const labels = (object.memoryClues && object.memoryClues.labels) || {}
  const placeClues = labels.place_clue || []
  const reasonClues = labels.reason_kept || []
  const emotionClues = labels.emotion_clue || []
  const eventClues = labels.event_clue || []

  // 七步结构组装 description
  const parts = [`我是${titlePrefix}`]

  if (detailSentence) parts.push(compactMemoryForDescription(detailSentence, 42))
  else if (emotionClues.length) parts.push(`身上还能找到${emotionClues.slice(0, 2).join('、')}的痕迹`)
  else parts.push('表面留着长期使用的痕迹')

  if (placeSentence) parts.push(compactMemoryForDescription(placeSentence, 42))
  else if (placeClues.length) parts.push(`我曾被放在${placeClues.slice(0, 2).join('、')}`)

  if (perspectives.length) {
    const VERBS = ['说', '补充', '记得', '也提到']
    const lines = perspectives.slice(0, 2).map((p, i) => {
      const who = p.relation || p.person
      const memory = compactMemoryForDescription(p.memory, 34)
      return memory ? `${who}${VERBS[i] || '记得'}，${memory}` : ''
    })
    parts.push(lines.filter(Boolean).join('；'))
  }

  if (reasonSentence) parts.push(compactMemoryForDescription(reasonSentence, 42))
  else if (reasonClues.length && !REASON_REGEX.test(detailSentence || '')) {
    parts.push(`后来我也没被换掉，家人提到${reasonClues.slice(0, 2).join('、')}`)
  }

  const topicClues = [].concat(eventClues, placeClues, emotionClues).slice(0, 2)
  const topic = topicClues.length ? topicClues.join('与') : '日常生活'
  parts.push(`现在我被保留下来，作为这个家庭关于${topic}的记忆线索`)

  let description = buildDescription(parts)
  if (description.length < 90 && perspectives.length === 0) {
    description = `我是${titlePrefix}。表面留着长期使用的痕迹。关于我的材料还在补充，家人可以继续记录我的来源、摆放位置、使用场景和被保留下来的原因。`
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
  "description": "120-180 字物件第一视角文案。按 SYSTEM_PROMPT 中的七步结构生成：1) 我是什么 2) 外观/材质/痕迹（必有至少一个具体细节）3) 摆放与使用场景 4) 家人讲述（用 奶奶说/爸爸补充/妈妈记得 等句式，主语取 authorRelation）5) 为什么被保存下来 6) 现在作为家庭展品承载什么日常记忆。不能写'陪伴了''见证了''承载岁月'等抒情套话",
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
- contentText 如果是"我留下了一段语音""我用语音讲了一段故事"这类占位句，不能当作真实原话。
- source 为 audio 且 transcriptText 为空时，不要推测语音内容。
- description 严格按 SYSTEM_PROMPT 的七步结构和句式要求生成；必须含"我"、至少一个具体物件细节、至少一句家人讲述。
- perspectives 整理真实人物视角，保留 authorName 和 authorRelation 到 person/relation，不改成物件口吻。
- 信息不足时，可补充"表面留着长期使用的痕迹"这类合理日常场景，但不能编造具体人物姓名或事件。
- 宁可简短，也不要补故事；绝对不要写"陪伴了""见证了""承载岁月""我感受到爱"这类抒情套话。`

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
