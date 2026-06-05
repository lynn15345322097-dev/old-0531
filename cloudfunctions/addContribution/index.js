const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const CLUE_TARGET = 6

// ---- Mock 线索分析 ----

const PERSON_NAMES = [
  '爷爷', '奶奶', '爸爸', '妈妈', '外公', '外婆', '姥姥', '姥爷',
  '哥哥', '姐姐', '弟弟', '妹妹', '叔叔', '阿姨', '舅舅', '姑姑',
  '邻居', '师傅', '老师', '同事', '朋友', '老伴', '老头', '老太太',
  '儿子', '女儿', '孙子', '孙女', '顺子', '小陈', '大哥', '大姐'
]

const TIME_WORDS = [
  '小时候', '以前', '从前', '那一年', '那年',
  '结婚时', '结婚那年', '结婚后',
  '搬家时', '搬家那年', '搬家后',
  '过年', '春节', '中秋节',
  '上学时', '上学那年',
  '几岁', '岁那年',
  '很多年', '几十年', '这些年',
  '刚买', '刚搬', '刚结婚'
]

const PLACE_WORDS = [
  '老家', '厨房', '阳台', '堂屋', '客厅', '卧室', '院子',
  '供销社', '厂里', '厂子', '车间', '单位',
  '学校', '学堂',
  '村里', '镇上', '县城', '城里',
  '桌上', '柜子', '抽屉', '墙上', '床头'
]

const EVENT_WORDS = [
  '搬家', '搬走', '搬过来',
  '摔坏', '摔碎', '磕破',
  '修过', '修好', '修好了', '找人修',
  '差点丢掉', '差点扔了', '没舍得扔', '没扔掉',
  '送人', '送给', '留给',
  '买回来', '买的时候',
  '留下来', '带回来', '捡回来',
  '扔掉', '丢掉'
]

const EMOTION_WORDS = [
  '舍不得', '不舍得', '舍不得扔', '舍不得换',
  '想念', '想他', '想她', '惦记',
  '遗憾', '可惜',
  '安心', '踏实', '放心', '心里踏实',
  '陪伴', '陪着', '一直陪着',
  '习惯', '习惯了', '用惯了', '顺手',
  '喜欢', '珍惜',
  '温暖', '暖和'
]

const REASON_WORDS = [
  '舍不得', '舍不得扔', '舍不得换', '没舍得',
  '用习惯了', '用惯了', '顺手',
  '纪念', '纪念他',
  '一直留着', '一直留', '留到现在',
  '还能用', '没坏',
  '好看', '就是喜欢'
]

const OBJECT_WORDS = [
  '杯子', '茶杯', '碗', '盘子', '筷子', '壶',
  '挂钟', '钟', '手表', '闹钟',
  '缝纫机', '针线',
  '照片', '相片', '相框',
  '衣服', '衣裳', '帽子', '围巾', '鞋',
  '盒子', '箱子', '柜子', '抽屉',
  '钥匙', '锁',
  '书', '本子', '笔记本', '信',
  '收音机', '录音机', '电视', '电话',
  '椅子', '凳子', '桌子', '床',
  '扇子', '手镯', '戒指', '项链'
]

function matchAny(text, words) {
  const found = []
  for (const w of words) {
    if (text.includes(w)) found.push(w)
  }
  return found
}

function hasValidContent(text) {
  if (!text || text.length < 5) return false
  const chineseChars = text.match(/[一-鿿]/g)
  return chineseChars && chineseChars.length >= 2
}

function analyzeMemoryItem(contentText) {
  const text = contentText || ''
  if (!hasValidContent(text)) {
    return { clues: [], analyzer: 'mock-v1', skipped: true, reason: '内容不足，未发现线索' }
  }
  const clues = []

  const objects = matchAny(text, OBJECT_WORDS)
  if (objects.length) {
    clues.push({ type: 'object_identity', label: objects[0], evidence: objects[0] })
  }

  const persons = matchAny(text, PERSON_NAMES)
  for (const p of persons.slice(0, 2)) {
    clues.push({ type: 'related_person', label: p, evidence: p })
  }

  for (const p of persons.slice(0, 1)) {
    if (text.includes(p + '的')) {
      clues.push({ type: 'owner', label: p + '的', evidence: p + '的' })
    }
  }

  if (text.includes('买的') || text.includes('买回来')) {
    clues.push({ type: 'origin', label: '购买', evidence: '买的' })
  }
  if (text.includes('送的') || text.includes('送给')) {
    clues.push({ type: 'origin', label: '馈赠', evidence: '送的' })
  }
  if (text.includes('做的')) {
    clues.push({ type: 'origin', label: '手工制作', evidence: '做的' })
  }
  if (text.includes('传下来') || text.includes('留下来的')) {
    clues.push({ type: 'origin', label: '传下来的', evidence: '传下来的' })
  }

  const times = matchAny(text, TIME_WORDS)
  if (times.length) {
    clues.push({ type: 'time_clue', label: times[0], evidence: times[0] })
  }

  const places = matchAny(text, PLACE_WORDS)
  if (places.length) {
    clues.push({ type: 'place_clue', label: places[0], evidence: places[0] })
  }

  const events = matchAny(text, EVENT_WORDS)
  for (const ev of events.slice(0, 2)) {
    clues.push({ type: 'event_clue', label: ev, evidence: ev })
  }

  const reasons = matchAny(text, REASON_WORDS)
  if (reasons.length) {
    clues.push({ type: 'reason_kept', label: reasons[0], evidence: reasons[0] })
  }

  const emotions = matchAny(text, EMOTION_WORDS)
  if (emotions.length) {
    clues.push({ type: 'emotion_clue', label: emotions[0], evidence: emotions[0] })
  }

  // 同类型去重
  const seen = {}
  const unique = []
  for (const c of clues) {
    if (!seen[c.type]) {
      seen[c.type] = true
      unique.push(c)
    }
  }

  return { clues: unique, analyzer: 'mock-v1' }
}

function mergeClues(existing, analysis) {
  const discovered = new Set(existing && existing.discoveredTypes || [])
  const labels = Object.assign({}, (existing && existing.labels) || {})
  const newClues = []

  for (const c of (analysis.clues || [])) {
    if (!labels[c.type]) labels[c.type] = []
    if (!labels[c.type].includes(c.label)) {
      labels[c.type].push(c.label)
    }
    if (!discovered.has(c.type)) {
      discovered.add(c.type)
      newClues.push(c)
    }
  }

  return {
    targetCount: CLUE_TARGET,
    discoveredTypes: Array.from(discovered),
    labels,
    newClues
  }
}

// ---- 主函数 ----

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const now = db.serverDate()

  if (!event.objectId) {
    throw new Error('objectId is required')
  }

  const kind = event.kind || 'memory'
  const source = event.source || 'text'
  const VALID_KINDS = ['question', 'memory', 'answer']
  const VALID_SOURCES = ['text', 'audio']

  if (!VALID_KINDS.includes(kind)) {
    throw new Error(`无效的 kind: ${kind}`)
  }
  if (!VALID_SOURCES.includes(source)) {
    throw new Error(`无效的 source: ${source}`)
  }
  if (source === 'text' && !event.contentText) {
    throw new Error('文字来源的 memoryItem 必须提供 contentText')
  }
  if (source === 'audio') {
    if (!event.audioUrl) {
      throw new Error('音频来源的 memoryItem 必须提供 audioUrl')
    }
    if ((event.audioDuration || 0) < 2) {
      throw new Error(`录音时长不足，至少需要 2 秒`)
    }
  }

  const objectRes = await db.collection('objects').doc(event.objectId).get()
  if (!objectRes.data) {
    throw new Error('藏品不存在')
  }

  const userQuery = await db.collection('users').where({ openid }).limit(1).get()
  const user = userQuery.data.length ? userQuery.data[0] : null
  if (!user) {
    throw new Error('用户不存在，请先登录')
  }
  if (user.familyId !== objectRes.data.familyId) {
    throw new Error('你不属于该藏品所属的家庭')
  }

  const authorName = user.name || '家人'
  const authorRelation = user.relation || ''

  // 线索分析
  const analysis = source === 'text' && event.contentText
    ? analyzeMemoryItem(event.contentText)
    : { clues: [], analyzer: 'mock-v1' }

  // 线索分析结果仍然保留写入，供后续生成展品卡使用，
  // 但不再用它自动计算 repairProgress —— 进度由发起者人工评定（setMemoryRepair）。
  const existingClues = objectRes.data.memoryClues || { targetCount: CLUE_TARGET, discoveredTypes: [], labels: {} }
  const mergedClues = mergeClues(existingClues, analysis)
  const newlyDiscovered = mergedClues.newClues || []

  const currentProgress = objectRes.data.repairProgress || 0
  const repairReason = '已保存，等待发起者评定贡献度'

  const memoryId = `${openid}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const memoryItem = {
    _id: memoryId,
    memoryId,
    objectId: event.objectId,
    familyId: user.familyId,
    authorOpenid: openid,
    authorName,
    authorRelation,
    parentId: event.parentId || null,
    quotedAuthorName: event.quotedAuthorName || '',
    quotedExcerpt: event.quotedExcerpt || '',
    kind,
    source,
    contentText: event.contentText || '',
    audioUrl: event.audioUrl || '',
    audioDuration: event.audioDuration || 0,
    repairPercent: null,
    reviewedByOpenid: '',
    reviewedAt: null,
    repairDelta: 0,
    repairReason,
    analysis,
    createdAt: now
  }

  await db.collection('memoryItems').add({ data: memoryItem })

  // 不动 repairProgress / status / completedAt，只刷新 memoryClues 和 updatedAt
  await db.collection('objects').doc(event.objectId).update({
    data: {
      memoryClues: {
        targetCount: mergedClues.targetCount,
        discoveredTypes: mergedClues.discoveredTypes,
        labels: mergedClues.labels
      },
      updatedAt: now
    }
  })

  return {
    memoryItem,
    repairDelta: 0,
    repairProgress: currentProgress,
    repairReason,
    newClues: newlyDiscovered,
    clueCount: mergedClues.discoveredTypes.length,
    clueTarget: mergedClues.targetCount,
    memoryClues: {
      targetCount: mergedClues.targetCount,
      discoveredTypes: mergedClues.discoveredTypes,
      labels: mergedClues.labels
    }
  }
}
