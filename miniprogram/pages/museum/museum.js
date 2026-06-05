const demoStore = require('../../utils/demoStore')

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
        ...obj,
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
          ...obj,
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
