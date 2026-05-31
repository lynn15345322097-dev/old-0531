const recorder = wx.getRecorderManager()

Page({
  data: {
    objectId: '',
    object: null,
    card: null,
    contributions: [],
    contentText: '',
    grayscale: 100,
    blur: 6,
    recording: false,
    generating: false,
    typeText: {
      question: '提问',
      memory: '记忆',
      answer: '回答'
    }
  },

  onLoad(options) {
    this.setData({ objectId: options.objectId })
    this.bindRecorder()
    this.loadData()
  },

  bindRecorder() {
    recorder.onStop((res) => {
      this.setData({ recording: false })
      if (res.tempFilePath) {
        this.uploadAudio(res.tempFilePath)
      }
    })

    recorder.onError(() => {
      this.setData({ recording: false })
      wx.showToast({ title: '录音失败，请重试', icon: 'none' })
    })
  },

  loadData() {
    const db = wx.cloud.database()
    db.collection('objects').doc(this.data.objectId).get({
      success: (objectRes) => {
        const object = objectRes.data
        const progress = object.repairProgress || 0
        this.setData({
          object,
          card: object.finalCard || null,
          grayscale: Math.max(0, 100 - progress),
          blur: Math.max(0, Math.round(6 * (1 - progress / 100)))
        })
      },
      fail: (err) => {
        console.error('[db:objects:get] failed', err)
        wx.showToast({ title: '加载藏品失败', icon: 'none' })
      }
    })

    db.collection('contributions')
      .where({ objectId: this.data.objectId })
      .orderBy('createdAt', 'asc')
      .get({
        success: (res) => {
          this.setData({ contributions: res.data || [] })
        },
        fail: (err) => {
          console.error('[db:contributions:list] failed', err)
        }
      })
  },

  onInput(event) {
    this.setData({ contentText: event.detail.value })
  },

  submitByType(event) {
    const type = event.currentTarget.dataset.type
    const contentText = this.data.contentText.trim()

    if (!contentText) {
      wx.showToast({ title: '先写点什么吧', icon: 'none' })
      return
    }

    wx.cloud.callFunction({
      name: 'addContribution',
      data: {
        objectId: this.data.objectId,
        type,
        source: 'text',
        contentText
      },
      success: () => {
        this.setData({ contentText: '' })
        this.loadData()
      },
      fail: (err) => {
        console.error('[cloud:addContribution:text] failed', err)
        wx.showToast({ title: '提交失败', icon: 'none' })
      }
    })
  },

  startRecord() {
    this.setData({ recording: true })
    recorder.start({
      duration: 60000,
      format: 'mp3',
      fail: () => {
        this.setData({ recording: false })
        wx.showToast({ title: '录音启动失败', icon: 'none' })
      }
    })
  },

  stopRecord() {
    if (this.data.recording) {
      recorder.stop()
    }
  },

  uploadAudio(tempFilePath) {
    const cloudPath = `audio/${this.data.objectId}/${Date.now()}.mp3`
    wx.cloud.uploadFile({
      cloudPath,
      filePath: tempFilePath,
      success: (uploadRes) => {
        wx.cloud.callFunction({
          name: 'addContribution',
          data: {
            objectId: this.data.objectId,
            type: 'answer',
            source: 'audio',
            contentText: '老人留下了一段语音回答',
            audioUrl: uploadRes.fileID
          },
          success: () => {
            this.loadData()
          },
          fail: (err) => {
            console.error('[cloud:addContribution:audio] failed', err)
            wx.showToast({ title: '语音保存失败', icon: 'none' })
          }
        })
      },
      fail: (err) => {
        console.error('[cloud:uploadFile:audio] failed', err)
        wx.showToast({ title: '语音上传失败', icon: 'none' })
      }
    })
  },

  generateCard() {
    this.setData({ generating: true })
    wx.cloud.callFunction({
      name: 'generateCard',
      data: { objectId: this.data.objectId },
      success: () => {
        this.loadData()
      },
      fail: (err) => {
        console.error('[cloud:generateCard] failed', err)
        wx.showToast({ title: '生成失败', icon: 'error' })
      },
      complete: () => {
        this.setData({ generating: false })
      }
    })
  }
})
