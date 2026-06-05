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
  keywords: ['茉莉花茶', '搬家', '缺口', '窗边'],
  shortIntro: '一个普通茶杯，因为一直没换，成了家人共同补充的记忆线索。',
  description: '我是那只一直没有换掉的白瓷茶杯。杯口有缺口，杯身留着长期喝茶的痕迹。奶奶说，缺口不影响使用，顺手的东西舍不得换；爸爸补充，小时候每天早上都能闻到茉莉花茶味；妈妈记得，搬家时我被包进旧毛巾带走。现在我被保留下来，作为这个家庭关于喝茶、搬家和日常习惯的记忆线索。',
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
    // 一次性清理 No.004-007（跑过一次就不再跑）
    if (!saved.cleanedNo004_007) {
      const removeNos = new Set(['No.004', 'No.005', 'No.006', 'No.007'])
      const removedIds = new Set()
      saved.objects = saved.objects.filter((obj) => {
        if (removeNos.has(obj.objectNo)) {
          removedIds.add(obj._id || obj.objectId)
          return false
        }
        return true
      })
      for (const id of removedIds) {
        delete saved.memoryItems[id]
      }
      saved.cleanedNo004_007 = true
      needsMigration = true
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

const PLACEHOLDER_PHRASES = ['留下了一段语音', '我用语音讲了一段', '语音记忆']

// 物件细节：材质 / 颜色 / 磨损 / 痕迹 / 形态
const DETAIL_REGEX = /(颜色|材质|木|布|绒|铝|瓷|釉|铁|铜|银|塑料|皮|纸|锈|裂|缺口|纹路|印|刻|烫|花纹|图案|杯口|杯底|边沿|底部|盖|缝|线|漆|发黄|发黑|发亮|发白|光滑|粗糙|痕迹|茶渍|油渍|斑|破|皱|褪色|掉漆|生锈|磨损|形状|大小|手感|分量)/
// 摆放与使用场景
const PLACE_REGEX = /(放在|摆在|挂在|搁在|收在|藏在|压在|窗|柜|床|桌|架|墙|阳台|抽屉|箱|角落|厨房|客厅|卧室|书房|楼上|楼下|门口|床头)/
// 保留原因
const REASON_REGEX = /(舍不得|留着|没扔|没换|没丢|从来没|始终|至今|顺手|习惯)/
const DESCRIPTION_MAX = 180

function isPlaceholder(text) {
  if (!text) return true
  return PLACEHOLDER_PHRASES.some((p) => text.includes(p))
}

function splitToShortSentences(text) {
  if (!text) return []
  return String(text)
    .split(/[。！？!?；;\n]+/)
    .map((s) => s.trim())
    .filter((s) => s && s.length >= 2 && s.length <= 60)
}

function pickFirstSentence(text) {
  const list = splitToShortSentences(text)
  return list.length ? list[0] : (text || '').slice(0, 60)
}

function summarizeRelationMemory(memories) {
  const fragments = []
  for (const m of memories) {
    if (isPlaceholder(m.contentText)) continue
    const first = pickFirstSentence(m.contentText)
    if (first && !fragments.includes(first)) fragments.push(first)
    if (fragments.length >= 2) break
  }
  return fragments.join('，')
}

function pickSentence(sentences, regex, used) {
  for (const s of sentences) {
    if (used.has(s)) continue
    if (regex.test(s)) {
      used.add(s)
      return s
    }
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

function generateCard(objectId) {
  const state = readState()
  const object = state.objects.find((item) => item._id === objectId)
  if (!object) return null

  const items = (state.memoryItems[objectId] || [])
  const usable = items.filter((item) => item.contentText && !isPlaceholder(item.contentText))

  // 按 authorName + authorRelation 分组（保留爸爸/妈妈/奶奶/女儿等关系标签）
  const groupMap = new Map()
  for (const item of usable) {
    const relation = item.authorRelation || ''
    const person = item.authorName || '家人'
    const key = `${person}|${relation}`
    if (!groupMap.has(key)) {
      groupMap.set(key, { person, relation, memories: [] })
    }
    groupMap.get(key).memories.push(item)
  }
  const groups = Array.from(groupMap.values())

  // perspectives：保留每个家人独立视角，用于"家人记得"模块
  const perspectives = groups.map((g) => ({
    person: g.person,
    relation: g.relation,
    memory: summarizeRelationMemory(g.memories) || pickFirstSentence(g.memories[0].contentText)
  })).filter((p) => p.memory)

  // representativeQuote：从原文选最短最像原话的一句
  const quoteCandidate = usable
    .map((m) => pickFirstSentence(m.contentText))
    .filter((s) => s && s.length >= 6 && s.length <= 50)
    .sort((a, b) => a.length - b.length)[0]

  // 从对话原文里抽：物件细节 / 摆放场景 / 保留原因
  const allSentences = usable.flatMap((m) => splitToShortSentences(m.contentText))
  const used = new Set()
  const detailSentence = pickSentence(allSentences, DETAIL_REGEX, used)
  const placeSentence = pickSentence(allSentences, PLACE_REGEX, used)
  const reasonSentence = pickSentence(allSentences, REASON_REGEX, used)

  // 兜底线索（信息不足时，用 memoryClues 中已有的标签补充合理日常场景，不编造具体人物经历）
  const labels = (object.memoryClues && object.memoryClues.labels) || {}
  const placeClues = labels.place_clue || []
  const reasonClues = labels.reason_kept || []
  const emotionClues = labels.emotion_clue || []
  const eventClues = labels.event_clue || []

  const titlePrefix = object.title && object.title !== '未知藏品' ? object.title : '一件被保留下来的旧物'

  // === 按"物件第一视角"七步结构组装 description ===
  const parts = []

  // 1. 我是什么
  parts.push(`我是${titlePrefix}`)

  // 2. 物件细节（必有，至少一个具象细节）
  if (detailSentence) {
    parts.push(compactMemoryForDescription(detailSentence, 42))
  } else if (emotionClues.length) {
    parts.push(`身上还能找到${emotionClues.slice(0, 2).join('、')}的痕迹`)
  } else {
    parts.push('表面留着长期使用的痕迹')
  }

  // 3. 摆放与使用场景
  if (placeSentence) {
    parts.push(compactMemoryForDescription(placeSentence, 42))
  } else if (placeClues.length) {
    parts.push(`我曾被放在${placeClues.slice(0, 2).join('、')}`)
  }

  // 4. 家人讲述（按 authorRelation 出"XX 说 / 补充 / 记得"）
  if (perspectives.length) {
    const VERBS = ['说', '补充', '记得', '也提到']
    const lines = perspectives.slice(0, 2).map((p, i) => {
      const who = p.relation || p.person
      const memory = compactMemoryForDescription(p.memory, 34)
      return memory ? `${who}${VERBS[i] || '记得'}，${memory}` : ''
    })
    parts.push(lines.filter(Boolean).join('；'))
  }

  // 5. 我为什么被保存下来
  if (reasonSentence) {
    parts.push(compactMemoryForDescription(reasonSentence, 42))
  } else if (reasonClues.length && !REASON_REGEX.test(detailSentence || '')) {
    parts.push(`后来我也没被换掉，家人提到${reasonClues.slice(0, 2).join('、')}`)
  }

  // 6. 现在作为家庭展品承载什么日常记忆（不夸张煽情）
  const topicClues = [].concat(eventClues, placeClues, emotionClues).slice(0, 2)
  const topic = topicClues.length ? topicClues.join('与') : '日常生活'
  parts.push(`现在我被保留下来，作为这个家庭关于${topic}的记忆线索`)

  let description = buildDescription(parts)
  if (description.length < 90 && perspectives.length === 0) {
    description = `我是${titlePrefix}。表面留着长期使用的痕迹。关于我的材料还在补充，家人可以继续记录我的来源、摆放位置、使用场景和被保留下来的原因。`
  }

  const finalCard = {
    title: object.title === '未知藏品' ? `${object.objectNo} 被重新记住的东西` : object.title,
    keywords: ['旧物', '家人接龙', '记忆修复'],
    shortIntro: perspectives.length
      ? `${perspectives.length}位家人留下了关于这件旧物的记忆`
      : '记忆还在收集和修复中',
    description,
    representativeQuote: quoteCandidate || '',
    perspectives: perspectives.length ? perspectives : [
      { person: '家人', relation: '', memory: '我们重新围着这件旧物说起了过去的生活。' }
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
