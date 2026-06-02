const demoStore = require('../../utils/demoStore')
const { CLUE_LABELS, calcRepairProgressFromClues } = require('../../utils/repairWeights')
const recorder = wx.getRecorderManager()

function lerp(a, b, t) {
  return a + (b - a) * t
}

const FILTER_STAGES = [
  { p: 0,   g: 1,    b: 18, c: 0.6,  br: 0.8,  s: 0 },
  { p: 25,  g: 1,    b: 12, c: 0.7,  br: 0.85, s: 0.2 },
  { p: 50,  g: 0.8,  b: 7,  c: 0.85, br: 0.95, s: 0.5 },
  { p: 75,  g: 0.35, b: 3,  c: 0.95, br: 1,    s: 0.8 },
  { p: 100, g: 0,    b: 0,  c: 1,    br: 1,    s: 1 }
]

function getFilter(progress) {
  const p = Math.max(0, Math.min(100, progress || 0))
  for (let i = 0; i < FILTER_STAGES.length - 1; i++) {
    const s0 = FILTER_STAGES[i]
    const s1 = FILTER_STAGES[i + 1]
    if (p >= s0.p && p <= s1.p) {
      const range = s1.p - s0.p
      const t = range === 0 ? 0 : (p - s0.p) / range
      return {
        grayscale: +lerp(s0.g, s1.g, t).toFixed(2),
        blur: +lerp(s0.b, s1.b, t).toFixed(1),
        contrast: +lerp(s0.c, s1.c, t).toFixed(2),
        brightness: +lerp(s0.br, s1.br, t).toFixed(2),
        saturate: +lerp(s0.s, s1.s, t).toFixed(2),
        filter: `grayscale(${lerp(s0.g * 100, s1.g * 100, t).toFixed(0)}%) blur(${lerp(s0.b, s1.b, t).toFixed(1)}px) contrast(${lerp(s0.c, s1.c, t).toFixed(2)}) brightness(${lerp(s0.br, s1.br, t).toFixed(2)}) saturate(${lerp(s0.s, s1.s, t).toFixed(2)})`
      }
    }
  }
  return { grayscale: 0, blur: 0, contrast: 1, brightness: 1, saturate: 1, filter: 'none' }
}

function visualState(progress) {
  return getFilter(progress)
}

function buildThreadedItems(memoryItems) {
  const items = memoryItems || []
  const idMap = {}
  const roots = []

  items.forEach((item) => {
    idMap[item.memoryId || item._id] = { ...item, children: [] }
  })

  items.forEach((item) => {
    const node = idMap[item.memoryId || item._id]
    if (item.parentId && idMap[item.parentId]) {
      idMap[item.parentId].children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

Page({
  data: {
    objectId: '',
    object: null,
    card: null,
    memoryItems: [],
    threadedItems: [],
    contentText: '',
    filterStyle: 'grayscale(100%) blur(18px) contrast(0.6) brightness(0.8) saturate(0)',
    recording: false,
    recordDuration: 0,
    recordDurationText: '00:00',
    playingId: '',
    audioProgress: 0,
    memoryClues: null,
    clueCount: 0,
    clueTarget: 6,
    newClues: [],
    generating: false,
    kindText: {
      question: '家人问',
      memory: '补充',
      answer: '我回答'
    },
    CLUE_LABELS
  },

  onLoad(options) {
    this.setData({ objectId: options.objectId })
    this._recordTimer = null
    this._audioContext = null
    this.bindRecorder()
    this.initAudioContext()
    this.loadData()
  },

  onUnload() {
    if (this._recordTimer) {
      clearInterval(this._recordTimer)
      this._recordTimer = null
    }
    if (this._audioContext) {
      this._audioContext.stop()
      this._audioContext.destroy()
      this._audioContext = null
    }
    this._pausedId = ''
  },

  bindRecorder() {
    recorder.onStart(() => {
      this.setData({ recording: true, recordDuration: 0, recordDurationText: '00:00' })
      this._recordTimer = setInterval(() => {
        const d = this.data.recordDuration + 1
        const m = Math.floor(d / 60)
        const s = d % 60
        this.setData({
          recordDuration: d,
          recordDurationText: `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        })
      }, 1000)
    })

    recorder.onStop((res) => {
      this.setData({ recording: false })
      if (this._recordTimer) {
        clearInterval(this._recordTimer)
        this._recordTimer = null
      }

      const duration = Math.round(res.duration / 1000)
      if (duration < 2) {
        wx.showToast({ title: '录制时间太短，至少 2 秒', icon: 'none' })
        return
      }
      if (res.tempFilePath) {
        this.handleRecordedAudio(res.tempFilePath, duration)
      }
    })

    recorder.onError(() => {
      this.setData({ recording: false })
      if (this._recordTimer) {
        clearInterval(this._recordTimer)
        this._recordTimer = null
      }
      wx.showToast({ title: '录音失败，请重试', icon: 'none' })
    })
  },

  loadData() {
    if (demoStore.DEMO_MODE) {
      const object = demoStore.getObject(this.data.objectId)
      const memoryItems = demoStore.getMemoryItems(this.data.objectId)

      if (!object) {
        wx.showToast({ title: '找不到演示藏品', icon: 'none' })
        return
      }

      const clues = object.memoryClues || { targetCount: 6, discoveredTypes: [], labels: {} }
      const progress = object.memoryClues
        ? calcRepairProgressFromClues(object.memoryClues)
        : (object.repairProgress || 0)
      const cCount = (clues.discoveredTypes || []).length
      const cTarget = clues.targetCount || 6
      const filter = visualState(progress)
      this.setData({
        object,
        card: object.finalCard || null,
        memoryItems,
        threadedItems: buildThreadedItems(memoryItems),
        memoryClues: clues,
        clueCount: cCount,
        clueTarget: cTarget,
        filterStyle: filter.filter
      })
      return
    }

    const db = wx.cloud.database()
    db.collection('objects').doc(this.data.objectId).get({
      success: (objectRes) => {
        const object = objectRes.data
        const clues = object.memoryClues || { targetCount: 6, discoveredTypes: [], labels: {} }
        const progress = object.memoryClues
          ? calcRepairProgressFromClues(object.memoryClues)
          : (object.repairProgress || 0)
        const cCount = (clues.discoveredTypes || []).length
        const cTarget = clues.targetCount || 6
        const filter = visualState(progress)
        this.setData({
          object,
          card: object.finalCard || null,
          memoryClues: clues,
          clueCount: cCount,
          clueTarget: cTarget,
          filterStyle: filter.filter
        })
      },
      fail: (err) => {
        console.error('[db:objects:get] failed', err)
        wx.showToast({ title: '加载藏品失败', icon: 'none' })
      }
    })

    db.collection('memoryItems')
      .where({ objectId: this.data.objectId })
      .orderBy('createdAt', 'asc')
      .get({
        success: (res) => {
          const items = res.data || []
          this.setData({
            memoryItems: items,
            threadedItems: buildThreadedItems(items)
          })
        },
        fail: (err) => {
          console.error('[db:memoryItems:list] failed', err)
        }
      })
  },

  onInput(event) {
    this.setData({ contentText: event.detail.value })
  },

  applyRepairUpdate(result, extra) {
    const { repairDelta, repairProgress, repairReason, newClues, clueCount, clueTarget, memoryClues } = result
    const progress = repairProgress || 0
    const cCount = clueCount || 0
    const cTarget = clueTarget || 6
    const filter = visualState(progress)
    const updates = {
      filterStyle: filter.filter,
      newClues: newClues || [],
      clueCount: cCount,
      clueTarget: cTarget
    }
    if (memoryClues) updates.memoryClues = memoryClues
    if (this.data.object) {
      updates['object.repairProgress'] = progress
      updates['object.status'] = progress >= 100 ? 'completed' : this.data.object.status
      if (memoryClues) updates['object.memoryClues'] = memoryClues
    }
    if (extra) Object.assign(updates, extra)
    this.setData(updates)
    wx.showToast({ title: repairReason || `记忆修复 +${repairDelta}%`, icon: 'none', duration: 2500 })
  },

  submitByKind(event) {
    const kind = event.currentTarget.dataset.kind
    const contentText = this.data.contentText.trim()

    if (!contentText) {
      wx.showToast({ title: '先写点什么吧', icon: 'none' })
      return
    }

    if (demoStore.DEMO_MODE) {
      const result = demoStore.addMemoryItem(this.data.objectId, {
        kind,
        source: 'text',
        contentText
      })
      const merged = [...this.data.memoryItems, result.memoryItem]
      this.applyRepairUpdate(result, {
        contentText: '',
        memoryItems: merged,
        threadedItems: buildThreadedItems(merged)
      })
      return
    }

    wx.cloud.callFunction({
      name: 'addContribution',
      data: {
        objectId: this.data.objectId,
        kind,
        source: 'text',
        contentText
      },
      success: (res) => {
        this.applyRepairUpdate(res.result, { contentText: '' })
        this.loadData()
      },
      fail: (err) => {
        console.error('[cloud:addContribution:text] failed', err)
        wx.showToast({ title: '提交失败', icon: 'none' })
      }
    })
  },

  toggleRecord() {
    if (this.data.recording) {
      recorder.stop()
    } else {
      this.startRecord()
    }
  },

  startRecord() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.record'] === false) {
          wx.showModal({
            title: '需要麦克风权限',
            content: '录音需要麦克风权限，请在设置中开启。',
            confirmText: '去设置',
            success: (modalRes) => {
              if (modalRes.confirm) wx.openSetting()
            }
          })
          return
        }
        recorder.start({
          duration: 60000,
          format: 'mp3',
          fail: () => {
            wx.showToast({ title: '录音启动失败，请重试', icon: 'none' })
          }
        })
      }
    })
  },

  handleRecordedAudio(tempFilePath, duration) {
    if (demoStore.DEMO_MODE) {
      this.persistDemoAudio(tempFilePath, duration)
      return
    }
    this.uploadCloudAudio(tempFilePath, duration)
  },

  persistDemoAudio(tempFilePath, duration) {
    const fs = wx.getFileSystemManager()
    const savedFilePath = `${wx.env.USER_DATA_PATH}/audio_${Date.now()}.mp3`
    try {
      fs.saveFileSync(tempFilePath, savedFilePath)
      const result = demoStore.addMemoryItem(this.data.objectId, {
        kind: 'answer',
        source: 'audio',
        contentText: '我用语音讲了一段这件老东西的故事',
        audioUrl: savedFilePath,
        audioDuration: duration
      })
      if (!result) {
        wx.showToast({ title: '语音保存失败', icon: 'none' })
        return
      }
      const merged = [...this.data.memoryItems, result.memoryItem]
      this.applyRepairUpdate(result, {
        memoryItems: merged,
        threadedItems: buildThreadedItems(merged)
      })
    } catch (e) {
      console.error('[demo:saveFile] failed', e)
      wx.showToast({ title: '语音保存失败', icon: 'none' })
    }
  },

  uploadCloudAudio(tempFilePath, duration) {
    wx.showLoading({ title: '上传中 0%' })
    const cloudPath = `audio/${this.data.objectId}/${Date.now()}.mp3`
    const uploadTask = wx.cloud.uploadFile({
      cloudPath,
      filePath: tempFilePath,
      success: (uploadRes) => {
        wx.hideLoading()
        wx.cloud.callFunction({
          name: 'addContribution',
          data: {
            objectId: this.data.objectId,
            kind: 'answer',
            source: 'audio',
            contentText: '我留下了一段语音',
            audioUrl: uploadRes.fileID,
            audioDuration: duration
          },
          success: (res) => {
            this.applyRepairUpdate(res.result)
            this.loadData()
          },
          fail: (err) => {
            console.error('[cloud:addContribution:audio] failed', err)
            wx.showToast({ title: '语音保存失败', icon: 'none' })
          }
        })
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('[cloud:uploadFile:audio] failed', err)
        wx.showToast({ title: '上传失败，请重试', icon: 'none' })
      }
    })

    uploadTask.onProgressUpdate((res) => {
      wx.showLoading({ title: `上传中 ${res.progress}%` })
    })
  },

  initAudioContext() {
    this._audioContext = wx.createInnerAudioContext()
    this._pausedId = ''

    this._audioContext.onPlay(() => {
      this._pausedId = ''
    })
    this._audioContext.onPause(() => {
      this._pausedId = this.data.playingId
      this.setData({ playingId: '' })
    })
    this._audioContext.onEnded(() => {
      this.setData({ playingId: '', audioProgress: 0 })
      this._pausedId = ''
    })
    this._audioContext.onStop(() => {
      this.setData({ playingId: '', audioProgress: 0 })
      this._pausedId = ''
    })
    this._audioContext.onTimeUpdate(() => {
      const duration = this._audioContext.duration
      if (duration > 0) {
        this.setData({
          audioProgress: Math.round((this._audioContext.currentTime / duration) * 100)
        })
      }
    })
    this._audioContext.onError((err) => {
      console.error('[audio:error]', err)
      this.setData({ playingId: '', audioProgress: 0 })
      this._pausedId = ''
      wx.showToast({ title: '播放失败', icon: 'none' })
    })
  },

  playAudio(event) {
    const memoryId = event.currentTarget.dataset.memoryId
    const audioUrl = event.currentTarget.dataset.audioUrl
    if (!audioUrl || !this._audioContext) return

    // 正在播放中 → 暂停
    if (this.data.playingId === memoryId) {
      this._audioContext.pause()
      return
    }

    // 之前暂停的同一条 → 续播
    if (this._pausedId === memoryId) {
      this._audioContext.play()
      this.setData({ playingId: memoryId })
      return
    }

    // 不同音频 → 停掉旧的重播新的
    this._audioContext.stop()
    this._audioContext.src = audioUrl
    this._audioContext.play()
    this.setData({ playingId: memoryId, audioProgress: 0 })
  },

  formatDuration(seconds) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  },

  generateCard() {
    this.setData({ generating: true })

    if (demoStore.DEMO_MODE) {
      demoStore.generateCard(this.data.objectId)
      this.loadData()
      this.setData({ generating: false })
      return
    }

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
