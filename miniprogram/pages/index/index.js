const demoStore = require('../../utils/demoStore')

// 把 repairProgress (0~100) 落到 5 档（0/25/50/75/100），对应 5 条 CSS class
// 已入馆的物件无论数值，都视为 100（清晰）
function progressBucket(object) {
  if (object.status === 'completed' && object.finalCard) return 100
  const p = Math.max(0, Math.min(100, object.repairProgress || 0))
  if (p >= 88) return 100
  if (p >= 63) return 75
  if (p >= 38) return 50
  if (p >= 13) return 25
  return 0
}

function decorate(objects) {
  return (objects || []).map((item) => ({
    ...item,
    progressBucket: progressBucket(item)
  }))
}

Page({
  data: {
    totalCount: 0,
    repairingCount: 0,
    recentObjects: []
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    if (demoStore.DEMO_MODE) {
      const allObjects = demoStore.listObjects('all')
      const repairing = demoStore.listObjects('repairing')
      this.setData({
        totalCount: allObjects.length,
        repairingCount: repairing.length,
        recentObjects: decorate(allObjects.slice(0, 6))
      })
      return
    }

    const call = (status) =>
      new Promise((resolve) => {
        wx.cloud.callFunction({
          name: 'getMuseumObjects',
          data: { status },
          success: (res) => resolve(res.result.objects || []),
          fail: () => resolve([])
        })
      })

    Promise.all([call('all'), call('repairing')]).then(([allObjects, repairing]) => {
      this.setData({
        totalCount: allObjects.length,
        repairingCount: repairing.length,
        recentObjects: decorate(allObjects.slice(0, 6))
      })
    })
  },

  goUpload() {
    wx.navigateTo({ url: '/pages/upload/upload' })
  },

  goObject(event) {
    const objectId = event.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/object/object?objectId=${objectId}` })
  }
})
