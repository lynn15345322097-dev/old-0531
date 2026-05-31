Page({
  data: {
    tempImage: '',
    uploading: false
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera', 'album'],
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
            wx.redirectTo({ url: `/pages/object/object?objectId=${res.result.objectId}` })
          },
          fail: (err) => {
            console.error('[cloud:createObject] failed', err)
            wx.showToast({ title: '保存失败，请重试', icon: 'none' })
          },
          complete: () => {
            this.setData({ uploading: false })
          }
        })
      },
      fail: (err) => {
        console.error('[cloud:uploadFile:object-image] failed', err)
        this.setData({ uploading: false })
        wx.showToast({ title: '上传失败，请重试', icon: 'none' })
      }
    })
  }
})
