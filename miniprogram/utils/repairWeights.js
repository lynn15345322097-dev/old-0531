const CLUE_TARGET = 6

const CLUE_TYPES = [
  'object_identity',
  'owner',
  'origin',
  'related_person',
  'time_clue',
  'place_clue',
  'event_clue',
  'reason_kept',
  'emotion_clue'
]

const CLUE_LABELS = {
  object_identity: '物件身份',
  owner: '物主',
  origin: '来源',
  related_person: '相关人物',
  time_clue: '时间',
  place_clue: '地点',
  event_clue: '事件',
  reason_kept: '留下原因',
  emotion_clue: '情感'
}

// ---- 关键词规则库 ----

const PERSON_NAMES = [
  '爷爷', '奶奶', '爸爸', '妈妈', '外公', '外婆', '姥姥', '姥爷',
  '哥哥', '姐姐', '弟弟', '妹妹', '叔叔', '阿姨', '舅舅', '姑姑',
  '邻居', '师傅', '老师', '同事', '朋友', '老伴', '老头', '老太太',
  '儿子', '女儿', '孙子', '孙女', '顺子', '小陈', '大哥', '大姐'
]

const TIME_WORDS = [
  '小时候', '以前', '从前', '原来', '那一年', '那年',
  '结婚时', '结婚那年', '结婚后',
  '搬家时', '搬家那年', '搬家后',
  '过年', '春节', '中秋节', '端午节',
  '上学时', '上学那年', '上学的时候',
  '几岁', '岁那年', '岁时候',
  '七十年代', '八十年代', '九十年代', '60年代', '70年代', '80年代', '90年代',
  '文革', '改革开放', '下乡',
  '很多年', '几十年', '这些年', '头几年',
  '刚买', '刚搬', '刚结婚'
]

const PLACE_WORDS = [
  '老家', '厨房', '阳台', '堂屋', '客厅', '卧室', '院子',
  '供销社', '厂里', '厂子', '车间', '单位',
  '学校', '学堂', '教室',
  '村里', '镇上', '县城', '城里',
  '桌上', '柜子', '抽屉', '墙上', '床头',
  '河边', '山上', '田里'
]

const EVENT_WORDS = [
  '搬家', '搬走', '搬过来',
  '摔坏', '摔碎', '摔破', '磕破', '磕了',
  '修过', '修好', '修好了', '找人修',
  '差点丢掉', '差点扔了', '没舍得扔', '没扔掉',
  '送人', '送给', '留给',
  '买回来', '买回来时', '买的时候',
  '留下来', '带回来', '捡回来',
  '扔掉', '丢掉', '扔了',
  '搬家时', '搬家那年'
]

const EMOTION_WORDS = [
  '舍不得', '不舍得', '舍不得扔', '舍不得换', '舍不得丢',
  '想念', '想他', '想她', '想他们', '惦记',
  '遗憾', '可惜',
  '安心', '踏实', '放心', '心里踏实',
  '陪伴', '陪着', '一直陪着',
  '习惯', '习惯了', '用惯了', '用习惯了', '顺手',
  '喜欢', '珍惜', '看重',
  '温暖', '暖和'
]

const REASON_WORDS = [
  '舍不得', '舍不得扔', '舍不得换', '没舍得',
  '用习惯了', '用惯了', '顺手', '顺手的东西',
  '纪念', '纪念他', '纪念她',
  '一直留着', '一直留', '留到现在',
  '还能用', '还能用呢', '没坏',
  '好看', '喜欢', '就是喜欢'
]

const OBJECT_WORDS = [
  '杯子', '茶杯', '碗', '盘子', '筷子', '壶',
  '挂钟', '钟', '手表', '闹钟',
  '缝纫机', '针线', '线轴',
  '照片', '相片', '相框', '影集',
  '衣服', '衣裳', '帽子', '围巾', '鞋',
  '盒子', '箱子', '柜子', '抽屉',
  '钥匙', '锁',
  '书', '本子', '笔记本', '信', '信纸',
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
  // 必须包含至少 2 个中文字符
  const chineseChars = text.match(/[一-鿿]/g)
  return chineseChars && chineseChars.length >= 2
}

function mockAnalyzeMemoryItem(contentText) {
  const text = contentText || ''
  if (!hasValidContent(text)) {
    return { clues: [], analyzer: 'mock-v1', skipped: true, reason: '内容不足，未发现线索' }
  }
  const clues = []

  // object_identity
  const objects = matchAny(text, OBJECT_WORDS)
  if (objects.length) {
    clues.push({ type: 'object_identity', label: objects[0], evidence: objects[0] })
  }

  // related_person
  const persons = matchAny(text, PERSON_NAMES)
  for (const p of persons.slice(0, 2)) {
    clues.push({ type: 'related_person', label: p, evidence: text.slice(Math.max(0, text.indexOf(p) - 2), text.indexOf(p) + p.length + 2) })
  }

  // owner: "我的" "爷爷的" etc.
  for (const p of persons.slice(0, 1)) {
    if (text.includes(p + '的')) {
      clues.push({ type: 'owner', label: p + '的', evidence: text.slice(Math.max(0, text.indexOf(p + '的') - 2), text.indexOf(p + '的') + p.length + 4) })
    }
  }

  // origin: 买的/送的/做的/传下来的
  if (text.includes('买的') || text.includes('买回来')) {
    const idx = Math.max(0, text.indexOf('买的') - 4)
    const ev = text.slice(idx, idx + 8)
    clues.push({ type: 'origin', label: '购买', evidence: ev })
  }
  if (text.includes('送的') || text.includes('送给')) {
    clues.push({ type: 'origin', label: '馈赠', evidence: text.slice(Math.max(0, text.indexOf('送') - 2), text.indexOf('送') + 4) })
  }
  if (text.includes('做的') || text.includes('做的')) {
    clues.push({ type: 'origin', label: '手工制作', evidence: text.slice(Math.max(0, text.indexOf('做') - 2), text.indexOf('做') + 4) })
  }
  if (text.includes('传下来') || text.includes('留下来的')) {
    clues.push({ type: 'origin', label: '传下来的', evidence: text.slice(Math.max(0, text.indexOf('传下来') - 2), Math.min(text.length, text.indexOf('传下来') + 6)) })
  }

  // time_clue
  const times = matchAny(text, TIME_WORDS)
  if (times.length) {
    clues.push({ type: 'time_clue', label: times[0], evidence: times[0] })
  }

  // place_clue
  const places = matchAny(text, PLACE_WORDS)
  if (places.length) {
    clues.push({ type: 'place_clue', label: places[0], evidence: places[0] })
  }

  // event_clue
  const events = matchAny(text, EVENT_WORDS)
  if (events.length) {
    for (const ev of events.slice(0, 2)) {
      clues.push({ type: 'event_clue', label: ev, evidence: ev })
    }
  }

  // reason_kept
  const reasons = matchAny(text, REASON_WORDS)
  if (reasons.length) {
    clues.push({ type: 'reason_kept', label: reasons[0], evidence: text.slice(Math.max(0, text.indexOf(reasons[0]) - 2), text.indexOf(reasons[0]) + reasons[0].length + 2) })
  }

  // emotion_clue
  const emotions = matchAny(text, EMOTION_WORDS)
  if (emotions.length) {
    clues.push({ type: 'emotion_clue', label: emotions[0], evidence: text.slice(Math.max(0, text.indexOf(emotions[0]) - 2), text.indexOf(emotions[0]) + emotions[0].length + 2) })
  }

  // Deduplicate within same type
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

function mergeMemoryClues(existing, analysis) {
  const clues = existing || { targetCount: CLUE_TARGET, discoveredTypes: [], labels: {} }
  const discovered = new Set(clues.discoveredTypes || [])
  const labels = { ...(clues.labels || {}) }
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

function calcRepairProgressFromClues(clues) {
  if (!clues) return 0
  const count = (clues.discoveredTypes || []).length
  return Math.min(100, Math.round(count / CLUE_TARGET * 100))
}

// 保留旧接口兼容
function calcRepairDelta() {
  return { repairDelta: 0, repairReason: '', baseWeight: 0, bonuses: 0 }
}

function sumRepairProgress() {
  return 0
}

module.exports = {
  CLUE_TARGET,
  CLUE_LABELS,
  mockAnalyzeMemoryItem,
  mergeMemoryClues,
  calcRepairProgressFromClues,
  calcRepairDelta,
  sumRepairProgress
}
