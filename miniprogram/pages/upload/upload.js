const demoStore = require('../../utils/demoStore')

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

    if (demoStore.DEMO_MODE) {
      try {
        const fs = wx.getFileSystemManager()
        const ext = this.data.tempImage.split('.').pop() || 'jpg'
        const savedFilePath = `${wx.env.USER_DATA_PATH}/object_${Date.now()}.${ext}`
        fs.saveFileSync(this.data.tempImage, savedFilePath)
        const object = demoStore.createObject(savedFilePath)
        this.setData({ uploading: false })
        wx.redirectTo({ url: `/pages/object/object?objectId=${object.objectId}` })
      } catch (err) {
        console.error('[demo:saveObjectImage] failed', err)
        this.setData({ uploading: false })
        wx.showToast({ title: '图片保存失败，请重试', icon: 'none' })
      }
      return
    }

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
