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
  people: ['奶奶', '顺子', '小陈', '妈妈'],
  keywords: ['茉莉花茶', '搬家', '缺口', '陪伴'],
  description: '这只白瓷茶杯原本只是我每天泡茶的普通杯子。家人重新问起它的来历后，才发现杯沿的缺口、厚厚的茶渍和多次搬家都藏着一家人的日常。它不是贵重物，却见证了家里最稳定的陪伴。',
  memories: [
    { person: '小陈', text: '小时候总看见奶奶端着它坐在窗边喝茶。' },
    { person: '妈妈', text: '搬家时很多东西都扔了，只有这个杯子一直被奶奶包好带走。' },
    { person: '奶奶', text: '杯子有缺口了也还能用，顺手的东西舍不得换。' }
  ],
  familyMessage: '一件旧物被留下来，不只是因为它还有用，也因为它让家人重新说起彼此。'
}

function nowText() {
  const date = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
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
        uploaderId: user.openid,
        title: '未知藏品',
        displayTitle: '未知藏品 No.001',
        imageOriginal: '/assets/demo-cup.svg',
        imageProcessed: '/assets/demo-cup.svg',
        repairProgress: 60,
        status: 'repairing',
        finalCard: null,
        aiGenerated: false,
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
        repairProgress: 100,
        status: 'completed',
        finalCard: demoCard,
        aiGenerated: false,
        createdAt: '2026-05-20 18:22',
        updatedAt: '2026-05-20 19:10',
        completedAt: '2026-05-20 19:10'
      }
    ],
    contributions: {
      'demo-object-1': [
        {
          _id: 'demo-c-1',
          contributionId: 'demo-c-1',
          objectId: 'demo-object-1',
          userId: 'demo-family-1',
          authorName: '顺子',
          authorRole: 'family',
          type: 'question',
          source: 'text',
          contentText: '这是爷爷买的吗？',
          displayText: '顺子问：这是爷爷买的吗？',
          audioUrl: '',
          createdAt: '2026-05-30 09:30'
        },
        {
          _id: 'demo-c-2',
          contributionId: 'demo-c-2',
          objectId: 'demo-object-1',
          userId: 'demo-family-2',
          authorName: '小陈',
          authorRole: 'family',
          type: 'question',
          source: 'text',
          contentText: '它用了多久了？',
          displayText: '小陈问：它用了多久了？',
          audioUrl: '',
          createdAt: '2026-05-30 10:15'
        },
        {
          _id: 'demo-c-3',
          contributionId: 'demo-c-3',
          objectId: 'demo-object-1',
          userId: 'demo-family-3',
          authorName: '妈妈',
          authorRole: 'family',
          type: 'memory',
          source: 'text',
          contentText: '搬家时差点丢掉。',
          displayText: '妈妈补充：搬家时差点丢掉。',
          audioUrl: '',
          createdAt: '2026-05-30 10:30'
        }
      ],
      'demo-object-2': [
        {
          _id: 'demo-c-4',
          contributionId: 'demo-c-4',
          objectId: 'demo-object-2',
          userId: user.openid,
          authorName: '奶奶',
          authorRole: 'elder',
          type: 'answer',
          source: 'text',
          contentText: '这台挂钟是结婚时托人买回来的，夜里听见它响，心里就踏实。',
          displayText: '我回答：这台挂钟是结婚时托人买回来的，夜里听见它响，心里就踏实。',
          audioUrl: '',
          createdAt: '2026-05-28 16:12'
        }
      ],
      'demo-object-3': demoCard.memories.map((memory, index) => ({
        _id: `demo-c-card-${index}`,
        contributionId: `demo-c-card-${index}`,
        objectId: 'demo-object-3',
        userId: user.openid,
        authorName: memory.person,
        authorRole: index === 2 ? 'elder' : 'family',
        type: index === 2 ? 'answer' : 'memory',
        source: 'text',
        contentText: memory.text,
        displayText: index === 2 ? `我回答：${memory.text}` : `${memory.person}补充：${memory.text}`,
        audioUrl: '',
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
  if (saved && saved.objects && saved.contributions) {
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

function getContributions(objectId) {
  const list = readState().contributions[objectId] || []
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
    createdAt: nowText(),
    updatedAt: nowText(),
    completedAt: null
  }

  state.objects.unshift(object)
  state.contributions[objectId] = []
  writeState(state)
  return clone(object)
}

function addContribution(objectId, data) {
  const state = readState()
  const object = state.objects.find((item) => item._id === objectId)
  if (!object) return null

  const list = state.contributions[objectId] || []
  const contributionId = `demo-contribution-${Date.now()}-${list.length}`
  list.push({
    _id: contributionId,
    contributionId,
    objectId,
    userId: state.user.openid,
    authorName: state.user.name,
    authorRole: state.user.role,
    type: data.type || 'memory',
    source: data.source || 'text',
    contentText: data.contentText || '',
    displayText: data.type === 'answer' ? `我回答：${data.contentText || ''}` : `我补充：${data.contentText || ''}`,
    audioUrl: data.audioUrl || '',
    createdAt: nowText()
  })

  const repairProgress = Math.min(100, list.length * 20)
  object.repairProgress = repairProgress
  object.status = repairProgress >= 100 ? 'completed' : 'repairing'
  object.updatedAt = nowText()
  object.completedAt = object.status === 'completed' ? nowText() : null
  state.contributions[objectId] = list
  writeState(state)

  return {
    contributionId,
    repairProgress: object.repairProgress,
    status: object.status
  }
}

function generateCard(objectId) {
  const state = readState()
  const object = state.objects.find((item) => item._id === objectId)
  if (!object) return null

  const memories = (state.contributions[objectId] || [])
    .filter((item) => item.contentText)
    .slice(-5)
    .map((item) => ({
      person: item.authorName || '家人',
      text: item.contentText
    }))

  const finalCard = {
    title: object.title === '未知藏品' ? `${object.objectNo} 被重新记住的老东西` : object.title,
    people: [user.name, '家人'],
    keywords: ['旧物', '家人接龙', '记忆修复', '舍不得'],
    description: '这件老东西经过家人一轮轮提问、补充和我的讲述，从一张模糊照片变成了家庭博物馆里可以被讲述的展品。它的价值不在价格，而在它重新把家人的日常经验连接起来。',
    memories: memories.length ? memories : [
      { person: '家人', text: '我们重新围着这件旧物说起了过去的生活。' }
    ],
    familyMessage: '先把故事留下来，物件就不只是物件了。'
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
  getContributions,
  createObject,
  addContribution,
  generateCard,
  resetDemo
}
