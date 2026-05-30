Page({
  data: {
    repairingObjects: [],
    recentCompleted: []
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    // 待修复藏品
    wx.cloud.callFunction({
      name: 'getMuseumObjects',
      data: { status: 'repairing' },
      success: (res) => {
        this.setData({ repairingObjects: (res.result.objects || []).slice(0, 5) })
      },
      fail: () => {
        wx.showToast({ title: '加载失败', icon: 'none' })
      }
    })

    // 最近入馆藏品
    wx.cloud.callFunction({
      name: 'getMuseumObjects',
      data: { status: 'completed' },
      success: (res) => {
        this.setData({ recentCompleted: (res.result.objects || []).slice(0, 5) })
      }
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
