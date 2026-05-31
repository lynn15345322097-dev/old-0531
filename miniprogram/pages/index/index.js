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
        recentObjects: allObjects.slice(0, 6)
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
