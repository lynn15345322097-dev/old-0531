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
    wx.cloud.callFunction({
      name: 'getMuseumObjects',
      data: { status: this.data.status },
      success: (res) => {
        this.setData({ objects: res.result.objects || [] })
      },
      fail: () => {
        wx.showToast({ title: '加载失败', icon: 'none' })
      }
    })
  },

  goObject(event) {
    const objectId = event.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/object/object?objectId=${objectId}` })
  }
})
