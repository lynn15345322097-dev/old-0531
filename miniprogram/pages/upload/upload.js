Page({
  data: {
    tempImage: '',
    uploading: false
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          tempImage: res.tempFiles[0].tempFilePath
        })
      }
    })
  },

  submit() {
    if (!this.data.tempImage) return

    this.setData({ uploading: true })
    const ext = this.data.tempImage.split('.').pop() || 'jpg'
    const cloudPath = `objects/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    wx.cloud.uploadFile({
      cloudPath,
      filePath: this.data.tempImage,
      success: (uploadRes) => {
        wx.cloud.callFunction({
          name: 'createObject',
          data: {
            imageOriginal: uploadRes.fileID,
            imageProcessed: uploadRes.fileID
          },
          success: (res) => {
            const objectId = res.result.objectId
            wx.redirectTo({ url: `/pages/object/object?objectId=${objectId}` })
          },
          fail: () => {
            wx.showToast({ title: '创建失败', icon: 'error' })
          },
          complete: () => {
            this.setData({ uploading: false })
          }
        })
      },
      fail: () => {
        this.setData({ uploading: false })
        wx.showToast({ title: '上传失败', icon: 'error' })
      }
    })
  }
})
