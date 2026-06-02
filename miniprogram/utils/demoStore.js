const {
  mockAnalyzeMemoryItem,
  mergeMemoryClues,
  calcRepairProgressFromClues
} = require('./repairWeights')

const DEMO_MODE = true

const STORAGE_KEY = 'old0531_elder_demo_store_v1'

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
  name: '奶奶',
  role: 'elder',
  relation: '奶奶'
}

const demoCard = {
  title: '那只一直没有换掉的白瓷茶杯',
  keywords: ['茉莉花茶', '搬家', '缺口', '陪伴'],
  shortIntro: '一个普通茶杯，因为一直没换，成了家人共同的记忆坐标。',
  description: '我是那只一直没有换掉的白瓷茶杯。奶奶每天用我泡茉莉花茶，杯沿有了缺口，也没有把我换掉。搬家时，很多东西被清走，妈妈记得我被包好带走。小陈说，小时候总看见奶奶端着我坐在窗边。我的价值不是贵重，而是家人还记得我为什么一直留在桌边。',
  representativeQuote: '杯子有缺口了也还能用，顺手的东西舍不得换。',
  perspectives: [
    { person: '小陈', memory: '小时候总看见奶奶端着它坐在窗边喝茶。' },
    { person: '妈妈', memory: '搬家时很多东西都扔了，只有这个杯子一直被奶奶包好带走。' },
    { person: '奶奶', memory: '杯子有缺口了也还能用，顺手的东西舍不得换。' }
  ],
  museumTags: ['日常馆', '人物馆']
}

function nowText() {
  const date = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function initialState() {
  // Q&A 配对的 demo 数据：顺子的提问 → 奶奶的回答
  const questionId1 = 'demo-m-1'
  const questionId2 = 'demo-m-2'
  const answerId = 'demo-m-3'
  const elderAnswerId = 'demo-m-8'

  return {
    user,
    family,
    objects: [
      {
        _id: 'demo-object-1',
        objectId: 'demo-object-1',
        objectNo: 'No.001',
        familyId: family.familyId,
        uploaderId: user.openid,
        title: '未知藏品',
        displayTitle: '未知藏品 No.001',
        imageOriginal: '/assets/demo-cup.svg',
        imageProcessed: '/assets/demo-cup.svg',
        repairProgress: 50,
        status: 'repairing',
        finalCard: null,
        aiGenerated: false,
        memoryClues: {
          targetCount: 6,
          discoveredTypes: ['related_person', 'object_identity', 'event_clue'],
          labels: {
            related_person: ['顺子', '小陈', '妈妈'],
            object_identity: ['杯子'],
            event_clue: ['搬家']
          }
        },
        createdAt: '2026-05-30 09:30',
        updatedAt: '2026-05-30 10:15',
        completedAt: null
      },
      {
        _id: 'demo-object-2',
        objectId: 'demo-object-2',
        objectNo: 'No.002',
        familyId: family.familyId,
        uploaderId: user.openid,
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
        uploaderId: user.openid,
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
        {
          _id: questionId1,
          memoryId: questionId1,
          objectId: 'demo-object-1',
          userId: 'demo-family-1',
          authorName: '顺子',
          authorRole: 'family',
          parentId: null,
          targetRole: 'elder',
          kind: 'question',
          source: 'text',
          contentText: '这是爷爷买的吗？',
          displayText: '顺子问：这是爷爷买的吗？',
          audioUrl: '',
          audioDuration: 0,
          repairDelta: 5,
          repairReason: '家人提出了一个问题，修复 +5%',
          createdAt: '2026-05-30 09:30'
        },
        {
          _id: questionId2,
          memoryId: questionId2,
          objectId: 'demo-object-1',
          userId: 'demo-family-2',
          authorName: '小陈',
          authorRole: 'family',
          parentId: null,
          targetRole: 'elder',
          kind: 'question',
          source: 'text',
          contentText: '它用了多久了？',
          displayText: '小陈问：它用了多久了？',
          audioUrl: '',
          audioDuration: 0,
          repairDelta: 5,
          repairReason: '家人提出了一个问题，修复 +5%',
          createdAt: '2026-05-30 10:15'
        },
        {
          _id: answerId,
          memoryId: answerId,
          objectId: 'demo-object-1',
          userId: 'demo-family-3',
          authorName: '妈妈',
          authorRole: 'family',
          parentId: null,
          targetRole: null,
          kind: 'memory',
          source: 'text',
          contentText: '搬家时差点丢掉。',
          displayText: '妈妈补充：搬家时差点丢掉。',
          audioUrl: '',
          audioDuration: 0,
          repairDelta: 10,
          repairReason: '家人补充了一段记忆，修复 +10%',
          createdAt: '2026-05-30 10:30'
        },
        {
          _id: elderAnswerId,
          memoryId: elderAnswerId,
          objectId: 'demo-object-1',
          userId: user.openid,
          authorName: '奶奶',
          authorRole: 'elder',
          parentId: questionId1,
          targetRole: null,
          kind: 'answer',
          source: 'text',
          contentText: '是你爷爷结婚那年买的，后来一直放在堂屋桌上。',
          displayText: '我回答：是你爷爷结婚那年买的，后来一直放在堂屋桌上。',
          audioUrl: '',
          audioDuration: 0,
          repairDelta: 2,
          repairReason: '发现新线索：爷爷买的、结婚那年',
          analysis: {
            clues: [
              { type: 'origin', label: '爷爷买的', evidence: '你爷爷结婚那年买的' },
              { type: 'related_person', label: '爷爷', evidence: '你爷爷' },
              { type: 'time_clue', label: '结婚那年', evidence: '结婚那年' },
              { type: 'place_clue', label: '堂屋', evidence: '堂屋桌上' }
            ],
            analyzer: 'mock-v1'
          },
          createdAt: '2026-05-30 11:00'
        }
      ],
      'demo-object-2': [
        {
          _id: 'demo-m-4',
          memoryId: 'demo-m-4',
          objectId: 'demo-object-2',
          userId: user.openid,
          authorName: '奶奶',
          authorRole: 'elder',
          parentId: null,
          targetRole: null,
          kind: 'answer',
          source: 'text',
          contentText: '这台挂钟是结婚时托人买回来的，夜里听见它响，心里就踏实。',
          displayText: '我回答：这台挂钟是结婚时托人买回来的，夜里听见它响，心里就踏实。',
          audioUrl: '',
          audioDuration: 0,
          repairDelta: 25,
          repairReason: '你的讲述让记忆修复 +25%',
          createdAt: '2026-05-28 14:00'
        },
        {
          _id: 'demo-m-5',
          memoryId: 'demo-m-5',
          objectId: 'demo-object-2',
          userId: user.openid,
          authorName: '奶奶',
          authorRole: 'elder',
          parentId: null,
          targetRole: null,
          kind: 'answer',
          source: 'text',
          contentText: '它挂在堂屋墙上，孩子们都是听着钟声长大的。',
          displayText: '我回答：它挂在堂屋墙上，孩子们都是听着钟声长大的。',
          audioUrl: '',
          audioDuration: 0,
          repairDelta: 25,
          repairReason: '你的讲述让记忆修复 +25%',
          createdAt: '2026-05-28 14:20'
        },
        {
          _id: 'demo-m-6',
          memoryId: 'demo-m-6',
          objectId: 'demo-object-2',
          userId: user.openid,
          authorName: '奶奶',
          authorRole: 'elder',
          parentId: null,
          targetRole: null,
          kind: 'answer',
          source: 'text',
          contentText: '这些年挂钟慢过也停过，每次我都找人修好了。',
          displayText: '我回答：这些年挂钟慢过也停过，每次我都找人修好了。',
          audioUrl: '',
          audioDuration: 0,
          repairDelta: 25,
          repairReason: '你的讲述让记忆修复 +25%',
          createdAt: '2026-05-28 15:00'
        },
        {
          _id: 'demo-m-7',
          memoryId: 'demo-m-7',
          objectId: 'demo-object-2',
          userId: user.openid,
          authorName: '奶奶',
          authorRole: 'elder',
          parentId: null,
          targetRole: null,
          kind: 'answer',
          source: 'text',
          contentText: '现在有手机了，但看挂钟的习惯改不掉。',
          displayText: '我回答：现在有手机了，但看挂钟的习惯改不掉。',
          audioUrl: '',
          audioDuration: 0,
          repairDelta: 25,
          repairReason: '你的讲述让记忆修复 +25%',
          createdAt: '2026-05-28 16:12'
        }
      ],
      'demo-object-3': demoCard.perspectives.map((p, index) => ({
        _id: `demo-m-card-${index}`,
        memoryId: `demo-m-card-${index}`,
        objectId: 'demo-object-3',
        userId: user.openid,
        authorName: p.person,
        authorRole: index === 2 ? 'elder' : 'family',
        parentId: null,
        targetRole: null,
        kind: index === 2 ? 'answer' : 'memory',
        source: 'text',
        contentText: p.memory,
        displayText: index === 2 ? `我回答：${p.memory}` : `${p.person}补充：${p.memory}`,
        audioUrl: '',
        audioDuration: 0,
        repairDelta: index === 2 ? 25 : 10,
        repairReason: index === 2 ? '你的讲述让记忆修复 +25%' : '家人补充了一段记忆，修复 +10%',
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
    uploaderId: state.user.openid,
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

  // 线索分析
  const analysis = source === 'text' && data.contentText
    ? mockAnalyzeMemoryItem(data.contentText)
    : { clues: [], analyzer: 'mock-v1' }

  const mergedClues = mergeMemoryClues(object.memoryClues, analysis)
  const repairProgress = calcRepairProgressFromClues(mergedClues)
  const newlyDiscovered = mergedClues.newClues || []

  let repairReason = ''
  if (newlyDiscovered.length) {
    const labels = newlyDiscovered.map((c) => c.label).join('、')
    repairReason = `发现新线索：${labels}`
  } else {
    repairReason = '记忆已记录，线索没有新增'
  }

  list.push({
    _id: memoryId,
    memoryId,
    objectId,
    userId: state.user.openid,
    authorName: state.user.name,
    authorRole: state.user.role,
    parentId: data.parentId || null,
    targetRole: data.targetRole || null,
    kind,
    source,
    contentText: data.contentText || '',
    displayText: kind === 'answer'
      ? `我回答：${data.contentText || ''}`
      : (kind === 'question'
          ? `我问：${data.contentText || ''}`
          : `我补充：${data.contentText || ''}`),
    audioUrl: data.audioUrl || '',
    audioDuration: data.audioDuration || 0,
    repairDelta: newlyDiscovered.length,
    repairReason,
    analysis,
    createdAt: nowText()
  })

  object.repairProgress = repairProgress
  object.memoryClues = {
    targetCount: mergedClues.targetCount,
    discoveredTypes: mergedClues.discoveredTypes,
    labels: mergedClues.labels
  }
  object.status = repairProgress >= 100 ? 'completed' : 'repairing'
  object.updatedAt = nowText()
  object.completedAt = object.status === 'completed' ? nowText() : null
  state.memoryItems[objectId] = list
  writeState(state)

  return {
    memoryItem: list[list.length - 1],
    repairDelta: newlyDiscovered.length,
    repairProgress,
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
    memory: item.contentText
  }))

  const finalCard = {
    title: object.title === '未知藏品' ? `${object.objectNo} 被重新记住的老东西` : object.title,
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
  getFamily,
  listObjects,
  getObject,
  getMemoryItems,
  createObject,
  addMemoryItem,
  generateCard,
  resetDemo
}
