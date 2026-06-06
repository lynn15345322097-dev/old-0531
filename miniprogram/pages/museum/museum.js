const demoStore = require('../../utils/demoStore')

function lerp(a, b, t) {
  return a + (b - a) * t
}

const FILTER_STAGES = [
  { p: 0, g: 1, b: 10, c: 0.65, br: 0.85, s: 0 },
  { p: 25, g: 1, b: 8, c: 0.72, br: 0.9, s: 0.2 },
  { p: 50, g: 0.8, b: 5, c: 0.85, br: 0.95, s: 0.5 },
  { p: 75, g: 0.35, b: 2.5, c: 0.95, br: 1, s: 0.8 },
  { p: 100, g: 0, b: 0, c: 1, br: 1, s: 1 }
]

function getCoverFilter(progress) {
  const p = Math.max(0, Math.min(100, progress || 0))
  if (p >= 100) return 'none'

  for (let i = 0; i < FILTER_STAGES.length - 1; i++) {
    const s0 = FILTER_STAGES[i]
    const s1 = FILTER_STAGES[i + 1]
    if (p >= s0.p && p <= s1.p) {
      const range = s1.p - s0.p
      const t = range === 0 ? 0 : (p - s0.p) / range
      return `grayscale(${lerp(s0.g * 100, s1.g * 100, t).toFixed(0)}%) blur(${lerp(s0.b, s1.b, t).toFixed(1)}px) contrast(${lerp(s0.c, s1.c, t).toFixed(2)}) brightness(${lerp(s0.br, s1.br, t).toFixed(2)}) saturate(${lerp(s0.s, s1.s, t).toFixed(2)})`
    }
  }

  return 'none'
}

function decorateObject(obj) {
  const repairProgress = obj.repairProgress || 0
  return {
    ...obj,
    isUnrepaired: repairProgress < 100,
    coverImage: obj.imageProcessed || obj.imageOriginal || '',
    coverFilterStyle: getCoverFilter(repairProgress)
  }
}

Page({
  data: {
    status: 'all',
    objects: []
  },

  onShow() {
    this.loadObjects()
  },

  switchStatus(event) {
    this.setData({ status: event.currentTarget.dataset.status })
    this.loadObjects()
  },

  loadObjects() {
    if (demoStore.DEMO_MODE) {
      const objects = demoStore.listObjects(this.data.status)
      const enriched = objects.map((obj) => ({
        ...decorateObject(obj),
        participantCount: demoStore.getParticipantCount(obj._id || obj.objectId)
      }))
      this.setData({ objects: enriched })
      return
    }

    wx.cloud.callFunction({
      name: 'getMuseumObjects',
      data: { status: this.data.status },
      success: (res) => {
        const objects = (res.result.objects || []).map((obj) => ({
          ...decorateObject(obj),
          participantCount: (res.result.participantCounts || {})[obj._id || obj.objectId] || 1
        }))
        this.setData({ objects })
      },
      fail: (err) => {
        console.error('[cloud:getMuseumObjects] failed', err)
        wx.showToast({ title: '加载失败', icon: 'none' })
      }
    })
  },

  goObject(event) {
    const objectId = event.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/object/object?objectId=${objectId}` })
  }
})
