const https = require('https')
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const SYSTEM_PROMPT = `你是一位家庭博物馆策展人。根据家人提供的物件信息和记忆碎片，
为这件物品生成一张"展品卡"。你需要：
1. 给物件起一个有温度的名字
2. 判断与它相关的人物
3. 提取 3-5 个关键词
4. 写一段 80-150 字的展品描述
5. 整理家人记忆，每条一句话

只输出严格 JSON，不要 Markdown。`

function fallbackCard(object, contributions) {
  const memoryTexts = contributions
    .filter((item) => item.contentText)
    .map((item) => item.contentText)

  const titlePrefix = object.title && object.title !== '未知藏品'
    ? object.title
    : (object.objectNo || '这件旧物')

  return {
    title: `关于${titlePrefix}的故事`,
    people: ['爷爷', '奶奶', '爸爸', '孙女'],
    keywords: ['陪伴', '习惯', '搬家', '舍不得'],
    description: `这件物原本只是家中常见的旧物。经过家人的提问、补充和老人留下的回答，它被重新看见：它记录了日常生活里的习惯，也保存了几代人共同生活的痕迹。`,
    memories: memoryTexts.length
      ? memoryTexts.slice(0, 5).map((text, index) => ({
          person: index === memoryTexts.length - 1 ? '老人' : '家人',
          text
        }))
      : [
          { person: '奶奶', text: '这个杯子一直放在桌边，家里搬过几次也没有换掉。' },
          { person: '孙女', text: '小时候总觉得它只是普通茶杯，现在才知道它和家里的日常有关。' }
        ],
    familyMessage: '一件旧物被留下来，不只是因为它有用，也因为它让家人重新说起彼此。'
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
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: prompt
      }
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
      res.on('data', (chunk) => {
        data += chunk
      })
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
  const objectRes = await db.collection('objects').doc(event.objectId).get()
  const contributionRes = await db.collection('contributions')
    .where({ objectId: event.objectId })
    .orderBy('createdAt', 'asc')
    .get()

  const object = objectRes.data
  const contributions = contributionRes.data
  const prompt = `请根据家庭成员围绕一件旧物的接龙内容，生成一个家庭博物馆展品卡 JSON。

字段必须是：
{
  "title": "展品名称",
  "people": ["关联人物"],
  "keywords": ["关键词"],
  "description": "展品说明",
  "memories": [{ "person": "人物", "text": "记忆" }],
  "familyMessage": "家人留言"
}

藏品：${object.title || '未知藏品'}
接龙内容：${JSON.stringify(contributions.map((item) => ({
    type: item.type,
    source: item.source,
    contentText: item.contentText
  })))}`

  let finalCard = null
  let aiGenerated = false
  try {
    finalCard = await callAi(prompt)
    if (finalCard) aiGenerated = true
  } catch (error) {
    finalCard = null
  }

  if (!finalCard) {
    finalCard = fallbackCard(object, contributions)
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
