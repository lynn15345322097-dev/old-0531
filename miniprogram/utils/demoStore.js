const {
  mockAnalyzeMemoryItem,
  mergeMemoryClues
} = require('./repairWeights')
const { displayMember } = require('./memberDisplay')

const DEMO_MODE = true

const STORAGE_KEY = 'old0531_family_demo_store_v3'

const family = {
  familyId: 'demo-family',
  familyName: '老陈家的传家屋',
  inviteCode: '839251'
}

const user = {
  _id: 'demo-user',
  userId: 'demo-user',
  openid: 'demo-openid',
  familyId: family.familyId,
  name: '陈桂兰',
  relation: '奶奶'
}

const demoMembers = {
  grandma: {
    openid: 'demo-openid',
    name: '陈桂兰',
    relation: '奶奶'
  },
  grandpa: {
    openid: 'demo-openid-grandpa',
    name: '胡帅哥',
    relation: '爷爷'
  },
  dad: {
    openid: 'demo-openid-dad',
    name: '胡英俊',
    relation: '爸爸'
  },
  mom: {
    openid: 'demo-openid-mom',
    name: '张小丽',
    relation: '妈妈'
  },
  grandson: {
    openid: 'demo-openid-grandson',
    name: '图图',
    relation: '孙子'
  }
}

const demoMemberList = Object.keys(demoMembers).map((key) => ({
  _id: `demo-user-${key}`,
  userId: `demo-user-${key}`,
  openid: demoMembers[key].openid,
  familyId: family.familyId,
  name: demoMembers[key].name,
  relation: demoMembers[key].relation
}))

const demoCard = {
  title: '那只一直没有换掉的白瓷茶杯',
  keywords: ['茉莉花茶', '搬家', '缺口', '陪伴'],
  shortIntro: '一个普通茶杯，因为一直没换，成了家人共同的记忆坐标。',
  description: '我是那只一直没有换掉的白瓷茶杯。奶奶陈桂兰把我上传进家庭博物馆，因为我陪她喝了很多年的茉莉花茶。爸爸胡英俊记得清晨桌上的茶香，妈妈张小丽记得搬家时把我包进旧毛巾，孙子图图记得小时候看奶奶端着我坐在窗边。我的价值不是贵重，而是家人从不同位置记得我为什么一直留在桌边。',
  representativeQuote: '杯子有缺口了也还能用，顺手的东西舍不得换。',
  perspectives: [
    { person: '陈桂兰', relation: '奶奶', memory: '杯子有缺口了也还能用，顺手的东西舍不得换。' },
    { person: '胡英俊', relation: '爸爸', memory: '我小时候每天早上都闻到这个杯子里的茉莉花茶味。' },
    { person: '张小丽', relation: '妈妈', memory: '搬家时很多东西都清掉了，只有这个杯子被奶奶包进旧毛巾带走。' },
    { person: '图图', relation: '孙子', memory: '小时候总看见奶奶端着它坐在窗边喝茶。' }
  ],
  museumTags: ['日常馆', '人物馆']
}

function nowText() {
  const date = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function makeDemoMemoryItem(memoryId, objectId, author, contentText, createdAt, repairDelta) {
  return {
    _id: memoryId,
    memoryId,
    objectId,
    authorOpenid: author.openid,
    authorName: author.name,
    authorRelation: author.relation,
    parentId: null,
    kind: 'memory',
    source: 'text',
    contentText,
    displayText: `${displayMember(author.relation, author.name)}：${contentText}`,
    audioUrl: '',
    audioDuration: 0,
    repairDelta,
    repairReason: `家人补充了一段记忆，修复 +${repairDelta}%`,
    createdAt
  }
}

function initialState() {
  return {
    user,
    family,
    objects: [
      {
        _id: 'demo-object-1',
        objectId: 'demo-object-1',
        objectNo: 'No.001',
        familyId: family.familyId,
        uploaderOpenid: demoMembers.grandma.openid,
        uploaderName: demoMembers.grandma.name,
        uploaderRelation: demoMembers.grandma.relation,
        title: '一直没有换掉的白瓷茶杯',
        displayTitle: '一直没有换掉的白瓷茶杯',
        imageOriginal: '/assets/demo-cup.svg',
        imageProcessed: '/assets/demo-cup.svg',
        repairProgress: 100,
        status: 'completed',
        finalCard: null,
        aiGenerated: false,
        memoryClues: {
          targetCount: 6,
          discoveredTypes: ['object_identity', 'related_person', 'reason_kept', 'emotion_clue', 'event_clue', 'place_clue'],
          labels: {
            object_identity: ['杯子'],
            related_person: ['奶奶', '爸爸', '妈妈', '图图'],
            reason_kept: ['顺手', '舍不得换'],
            emotion_clue: ['习惯', '茶香'],
            event_clue: ['搬家'],
            place_clue: ['窗边', '桌上']
          }
        },
        createdAt: '2026-05-30 09:30',
        updatedAt: '2026-05-30 11:20',
        completedAt: '2026-05-30 11:20'
      },
      {
        _id: 'demo-object-2',
        objectId: 'demo-object-2',
        objectNo: 'No.002',
        familyId: family.familyId,
        uploaderOpenid: user.openid,
        uploaderName: user.name,
        uploaderRelation: user.relation,
        title: '绿亮五九式挂钟',
        displayTitle: '绿亮五九式挂钟',
        imageOriginal: '/assets/demo-clock.svg',
        imageProcessed: '/assets/demo-clock.svg',
        repairProgress: 100,
        status: 'completed',
        finalCard: null,
        aiGenerated: false,
        memoryClues: {
          targetCount: 6,
          discoveredTypes: ['object_identity', 'related_person', 'origin', 'time_clue', 'event_clue', 'place_clue'],
          labels: {
            object_identity: ['挂钟'],
            related_person: ['奶奶'],
            origin: ['购买'],
            time_clue: ['结婚时'],
            event_clue: ['修过'],
            place_clue: ['堂屋']
          }
        },
        createdAt: '2026-05-28 14:00',
        updatedAt: '2026-05-28 16:12',
        completedAt: '2026-05-28 16:12'
      },
      {
        _id: 'demo-object-3',
        objectId: 'demo-object-3',
        objectNo: 'No.003',
        familyId: family.familyId,
        uploaderOpenid: user.openid,
        uploaderName: user.name,
        uploaderRelation: user.relation,
        title: demoCard.title,
        displayTitle: demoCard.title,
        imageOriginal: '/assets/demo-sewing.svg',
        imageProcessed: '/assets/demo-sewing.svg',
        repairProgress: 67,
        status: 'completed',
        finalCard: demoCard,
        aiGenerated: false,
        memoryClues: {
          targetCount: 6,
          discoveredTypes: ['object_identity', 'related_person', 'reason_kept', 'emotion_clue'],
          labels: {
            object_identity: ['茶杯'],
            related_person: ['奶奶', '小陈', '妈妈'],
            reason_kept: ['没舍得扔'],
            emotion_clue: ['习惯']
          }
        },
        createdAt: '2026-05-20 18:22',
        updatedAt: '2026-05-20 19:10',
        completedAt: '2026-05-20 19:10'
      }
    ],
    memoryItems: {
      'demo-object-1': [
        makeDemoMemoryItem('demo-m-cup-1', 'demo-object-1', demoMembers.grandma, '杯子有缺口了也还能用，顺手的东西舍不得换。', '2026-05-30 09:35', 25),
        makeDemoMemoryItem('demo-m-cup-2', 'demo-object-1', demoMembers.dad, '我小时候每天早上都闻到这个杯子里的茉莉花茶味，桌上总是热的。', '2026-05-30 10:05', 25),
        makeDemoMemoryItem('demo-m-cup-3', 'demo-object-1', demoMembers.mom, '搬家时很多东西都清掉了，只有这个杯子被奶奶包进旧毛巾带走。', '2026-05-30 10:40', 25),
        makeDemoMemoryItem('demo-m-cup-4', 'demo-object-1', demoMembers.grandson, '小时候总看见奶奶端着它坐在窗边喝茶，我后来才知道那个缺口一直没修。', '2026-05-30 11:20', 25)
      ],
      'demo-object-2': [
        {
          _id: 'demo-m-4',
          memoryId: 'demo-m-4',
          objectId: 'demo-object-2',
          authorOpenid: user.openid,
          authorName: demoMembers.grandma.name,
          authorRelation: '奶奶',
          parentId: null,
          kind: 'memory',
          source: 'text',
          contentText: '这台挂钟是结婚时托人买回来的，夜里听见它响，心里就踏实。',
          displayText: `${displayMember(demoMembers.grandma.relation, demoMembers.grandma.name)}：这台挂钟是结婚时托人买回来的，夜里听见它响，心里就踏实。`,
          audioUrl: '',
          audioDuration: 0,
          repairDelta: 25,
          repairReason: '这段讲述让记忆修复 +25%',
          createdAt: '2026-05-28 14:00'
        },
        {
          _id: 'demo-m-5',
          memoryId: 'demo-m-5',
          objectId: 'demo-object-2',
          authorOpenid: user.openid,
          authorName: demoMembers.grandma.name,
          authorRelation: '奶奶',
          parentId: null,
          kind: 'memory',
          source: 'text',
          contentText: '它挂在堂屋墙上，孩子们都是听着钟声长大的。',
          displayText: `${displayMember(demoMembers.grandma.relation, demoMembers.grandma.name)}：它挂在堂屋墙上，孩子们都是听着钟声长大的。`,
          audioUrl: '',
          audioDuration: 0,
          repairDelta: 25,
          repairReason: '这段讲述让记忆修复 +25%',
          createdAt: '2026-05-28 14:20'
        },
        {
          _id: 'demo-m-6',
          memoryId: 'demo-m-6',
          objectId: 'demo-object-2',
          authorOpenid: user.openid,
          authorName: demoMembers.grandma.name,
          authorRelation: '奶奶',
          parentId: null,
          kind: 'memory',
          source: 'text',
          contentText: '这些年挂钟慢过也停过，每次我都找人修好了。',
          displayText: `${displayMember(demoMembers.grandma.relation, demoMembers.grandma.name)}：这些年挂钟慢过也停过，每次我都找人修好了。`,
          audioUrl: '',
          audioDuration: 0,
          repairDelta: 25,
          repairReason: '这段讲述让记忆修复 +25%',
          createdAt: '2026-05-28 15:00'
        },
        {
          _id: 'demo-m-7',
          memoryId: 'demo-m-7',
          objectId: 'demo-object-2',
          authorOpenid: user.openid,
          authorName: demoMembers.grandma.name,
          authorRelation: '奶奶',
          parentId: null,
          kind: 'memory',
          source: 'text',
          contentText: '现在有手机了，但看挂钟的习惯改不掉。',
          displayText: `${displayMember(demoMembers.grandma.relation, demoMembers.grandma.name)}：现在有手机了，但看挂钟的习惯改不掉。`,
          audioUrl: '',
          audioDuration: 0,
          repairDelta: 25,
          repairReason: '这段讲述让记忆修复 +25%',
          createdAt: '2026-05-28 16:12'
        }
      ],
      'demo-object-3': demoCard.perspectives.map((p, index) => ({
        _id: `demo-m-card-${index}`,
        memoryId: `demo-m-card-${index}`,
        objectId: 'demo-object-3',
        authorOpenid: `demo-card-${p.relation || p.person}`,
        authorName: p.person,
        authorRelation: p.relation || '家人',
        parentId: null,
        kind: 'memory',
        source: 'text',
        contentText: p.memory,
        displayText: `${p.person}：${p.memory}`,
        audioUrl: '',
        audioDuration: 0,
        repairDelta: 10,
        repairReason: '一段记忆补充，修复 +10%',
        createdAt: '2026-05-20 19:10'
      }))
    }
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function readState() {
  const saved = wx.getStorageSync(STORAGE_KEY)
  if (saved && saved.objects && saved.memoryItems) {
    // 迁移旧数据：确保每个 object 有 memoryClues
    let needsMigration = false
    for (const obj of saved.objects) {
      if (!obj.memoryClues) {
        obj.memoryClues = { targetCount: 6, discoveredTypes: [], labels: {} }
        obj.repairProgress = 0
        needsMigration = true
      }
    }
    if (needsMigration) {
      writeState(saved)
    }
    return saved
  }

  const state = initialState()
  wx.setStorageSync(STORAGE_KEY, state)
  return state
}

function writeState(state) {
  wx.setStorageSync(STORAGE_KEY, state)
}

function getUser() {
  return clone(readState().user)
}

function getDemoMembers() {
  return clone(demoMemberList)
}

function setDemoUser(openid) {
  const member = demoMemberList.find((item) => item.openid === openid)
  if (!member) return null

  const state = readState()
  state.user = clone(member)
  writeState(state)
  return clone(state.user)
}

function getFamily() {
  return clone(readState().family)
}

function listObjects(status) {
  const objects = readState().objects
  const filtered = status && status !== 'all'
    ? objects.filter((item) => item.status === status)
    : objects

  return clone(filtered)
}

function getObject(objectId) {
  const object = readState().objects.find((item) => item._id === objectId)
  return object ? clone(object) : null
}

function getMemoryItems(objectId) {
  const list = readState().memoryItems[objectId] || []
  return clone(list)
}

function getParticipantCount(objectId) {
  const state = readState()
  const object = state.objects.find((item) => item._id === objectId || item.objectId === objectId)
  const items = state.memoryItems[objectId] || []
  const openids = new Set(items.map((item) => item.authorOpenid))
  if (object && object.uploaderOpenid) {
    openids.add(object.uploaderOpenid)
  }
  return openids.size
}

function createObject(imagePath) {
  const state = readState()
  const objectIndex = state.objects.length + 1
  const objectId = `demo-object-${Date.now()}`
  const objectNo = `No.${String(objectIndex).padStart(3, '0')}`
  const object = {
    _id: objectId,
    objectId,
    objectNo,
    familyId: state.family.familyId,
    uploaderOpenid: state.user.openid,
    uploaderName: state.user.name,
    uploaderRelation: state.user.relation,
    title: '未知藏品',
    displayTitle: `${objectNo} 等待被认出来`,
    imageOriginal: imagePath,
    imageProcessed: imagePath,
    repairProgress: 0,
    status: 'repairing',
    finalCard: null,
    aiGenerated: false,
    memoryClues: { targetCount: 6, discoveredTypes: [], labels: {} },
    createdAt: nowText(),
    updatedAt: nowText(),
    completedAt: null
  }

  state.objects.unshift(object)
  state.memoryItems[objectId] = []
  writeState(state)
  return clone(object)
}

function addMemoryItem(objectId, data) {
  const state = readState()
  const object = state.objects.find((item) => item._id === objectId)
  if (!object) {
    console.error('[demoStore] addMemoryItem: object not found', objectId)
    return null
  }

  const kind = data.kind || 'memory'
  const source = data.source || 'text'
  const VALID_KINDS = ['question', 'memory', 'answer']
  const VALID_SOURCES = ['text', 'audio']

  if (!VALID_KINDS.includes(kind)) {
    console.error('[demoStore] addMemoryItem: invalid kind', kind)
    return null
  }
  if (!VALID_SOURCES.includes(source)) {
    console.error('[demoStore] addMemoryItem: invalid source', source)
    return null
  }
  if (source === 'text' && !data.contentText) {
    console.error('[demoStore] addMemoryItem: contentText required for text source')
    return null
  }
  if (source === 'audio') {
    if (!data.audioUrl) {
      console.error('[demoStore] addMemoryItem: audioUrl required for audio source')
      return null
    }
    if ((data.audioDuration || 0) < 2) {
      console.error('[demoStore] addMemoryItem: audio duration too short')
      return null
    }
  }

  const list = state.memoryItems[objectId] || []
  const memoryId = `demo-memory-${Date.now()}-${list.length}`

  // 线索分析结果仍然保留写入，但不再用它自动算进度
  const analysis = source === 'text' && data.contentText
    ? mockAnalyzeMemoryItem(data.contentText)
    : { clues: [], analyzer: 'mock-v1' }

  const mergedClues = mergeMemoryClues(object.memoryClues, analysis)
  const newlyDiscovered = mergedClues.newClues || []
  const repairReason = '已保存，等待发起者评定贡献度'

  list.push({
    _id: memoryId,
    memoryId,
    objectId,
    authorOpenid: state.user.openid,
    authorName: state.user.name,
    authorRelation: state.user.relation,
    parentId: data.parentId || null,
    quotedAuthorName: data.quotedAuthorName || '',
    quotedExcerpt: data.quotedExcerpt || '',
    kind,
    source,
    contentText: data.contentText || '',
    displayText: `${state.user.name}：${data.contentText || ''}`,
    audioUrl: data.audioUrl || '',
    audioDuration: data.audioDuration || 0,
    repairPercent: null,
    reviewedByOpenid: '',
    reviewedAt: null,
    repairDelta: 0,
    repairReason,
    analysis,
    createdAt: nowText()
  })

  // 只更新 memoryClues 和 updatedAt，不动 repairProgress/status
  object.memoryClues = {
    targetCount: mergedClues.targetCount,
    discoveredTypes: mergedClues.discoveredTypes,
    labels: mergedClues.labels
  }
  object.updatedAt = nowText()
  state.memoryItems[objectId] = list
  writeState(state)

  return {
    memoryItem: list[list.length - 1],
    repairDelta: 0,
    repairProgress: object.repairProgress || 0,
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

const ALLOWED_REPAIR_PERCENTS = [0, 10, 20, 30, 50]

function setMemoryRepair(memoryId, repairPercent) {
  const percent = Number(repairPercent)
  if (!ALLOWED_REPAIR_PERCENTS.includes(percent)) {
    console.error('[demoStore] setMemoryRepair: invalid percent', repairPercent)
    return null
  }
  const state = readState()
  let object = null
  let memory = null
  Object.keys(state.memoryItems).forEach((objId) => {
    const found = state.memoryItems[objId].find((item) => item.memoryId === memoryId || item._id === memoryId)
    if (found) {
      memory = found
      object = state.objects.find((o) => o._id === objId)
    }
  })
  if (!memory || !object) {
    console.error('[demoStore] setMemoryRepair: memory or object not found', memoryId)
    return null
  }
  // 权限校验：只有上传者可以评定
  if (object.uploaderOpenid !== state.user.openid) {
    console.error('[demoStore] setMemoryRepair: only uploader can review')
    return null
  }

  memory.repairPercent = percent
  memory.reviewedByOpenid = state.user.openid
  memory.reviewedAt = nowText()

  // 重新汇总该 object 下所有记忆的 repairPercent
  const list = state.memoryItems[object._id] || []
  let total = 0
  list.forEach((item) => {
    if (typeof item.repairPercent === 'number') total += item.repairPercent
  })
  const repairProgress = Math.min(100, total)
  const status = repairProgress >= 100 ? 'completed' : 'repairing'

  object.repairProgress = repairProgress
  object.status = status
  object.updatedAt = nowText()
  object.completedAt = status === 'completed' ? (object.completedAt || nowText()) : null
  writeState(state)

  return {
    memoryId,
    repairPercent: percent,
    repairProgress,
    status
  }
}

function isUploader(objectId) {
  const state = readState()
  const object = state.objects.find((item) => item._id === objectId || item.objectId === objectId)
  if (!object) return false
  return object.uploaderOpenid === state.user.openid
}

function generateCard(objectId) {
  const state = readState()
  const object = state.objects.find((item) => item._id === objectId)
  if (!object) return null

  const items = (state.memoryItems[objectId] || [])
  const quotes = items
    .filter((item) => item.contentText)
    .slice(-5)
  const perspectives = quotes.map((item) => ({
    person: item.authorName || '家人',
    relation: item.authorRelation || '',
    memory: item.contentText
  }))

  const finalCard = {
    title: object.title === '未知藏品' ? `${object.objectNo} 被重新记住的东西` : object.title,
    keywords: ['旧物', '家人接龙', '记忆修复'],
    shortIntro: perspectives.length
      ? `${perspectives.length}位家人留下了关于这件旧物的记忆`
      : '记忆还在收集和修复中',
    description: object.title === '未知藏品'
      ? `我还没有被家人准确叫出名字。有人提问，有人补充，也有人开始讲起和我有关的片段。我先从模糊的照片里慢慢清楚起来，等他们继续说出我是谁、谁用过我、我为什么一直被留在家里。`
      : `我是${object.title}。家人围绕我留下了${perspectives.length}段记忆，他们说起我的样子、用过我的人，也说起我被留下的原因。我不替他们补全没有说出口的故事，只把已经被记起的细节安静地留在身上。`,
    representativeQuote: quotes.length ? quotes[0].contentText : '',
    perspectives: perspectives.length ? perspectives : [
      { person: '家人', memory: '我们重新围着这件旧物说起了过去的生活。' }
    ],
    museumTags: ['日常馆']
  }

  object.title = finalCard.title
  object.displayTitle = finalCard.title
  object.finalCard = finalCard
  object.repairProgress = 100
  object.status = 'completed'
  object.updatedAt = nowText()
  object.completedAt = nowText()
  writeState(state)
  return clone(finalCard)
}

function resetDemo() {
  const state = initialState()
  wx.setStorageSync(STORAGE_KEY, state)
  return clone(state)
}

module.exports = {
  DEMO_MODE,
  getUser,
  getDemoMembers,
  setDemoUser,
  getFamily,
  listObjects,
  getObject,
  getMemoryItems,
  getParticipantCount,
  createObject,
  addMemoryItem,
  setMemoryRepair,
  isUploader,
  generateCard,
  resetDemo
}
