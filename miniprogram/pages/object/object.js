const demoStore = require('../../utils/demoStore')
const { CLUE_LABELS } = require('../../utils/repairWeights')
const { displayMember } = require('../../utils/memberDisplay')
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

const REPAIR_OPTIONS = [0, 10, 20, 30, 50]

function getRelationClass(relation) {
  const map = {
    '奶奶': 'grandma',
    '爷爷': 'grandpa',
    '爸爸': 'dad',
    '妈妈': 'mom',
    '孙子': 'grandson',
    '孙女': 'grandson'
  }
  return map[relation] || 'family'
}

function decorateMemoryItems(memoryItems, object) {
  const uploaderOpenid = object && object.uploaderOpenid
  const decorated = (memoryItems || []).map((item) => {
    const percent = typeof item.repairPercent === 'number' ? item.repairPercent : null
    const repairOptionIndex = percent === null ? 0 : Math.max(0, REPAIR_OPTIONS.indexOf(percent))
    return {
      ...item,
      repairPercent: percent,
      repairPercentText: percent === null ? '未评定' : `+${percent}%`,
      repairOptionIndex,
      displayName: displayMember(item.authorRelation, item.authorName),
      relationClass: getRelationClass(item.authorRelation),
      isObjectAdmin: !!uploaderOpenid && item.authorOpenid === uploaderOpenid,
      quotedDisplayName: item.quotedAuthorName || '家人',
      replies: []
    }
  })
  const byId = {}
  decorated.forEach((item) => {
    byId[item.memoryId || item._id] = item
  })

  function rootIdFor(item) {
    const ownId = item.memoryId || item._id
    let current = item
    const seen = {}
    while (current.parentId && byId[current.parentId] && !seen[current.parentId]) {
      seen[current.parentId] = true
      current = byId[current.parentId]
    }
    return current.memoryId || current._id || ownId
  }

  decorated.forEach((item) => {
    item.rootMemoryId = rootIdFor(item)
  })

  return decorated
}

function buildMemoryGroups(memoryItems) {
  const groups = []
  const roots = {}
  ;(memoryItems || []).forEach((item) => {
    const ownId = item.memoryId || item._id
    if (!item.parentId || item.rootMemoryId === ownId) {
      roots[ownId] = { ...item, replies: [] }
      groups.push(roots[ownId])
    }
  })
  ;(memoryItems || []).forEach((item) => {
    const ownId = item.memoryId || item._id
    if (item.parentId && item.rootMemoryId !== ownId) {
      const root = roots[item.rootMemoryId]
      if (root) root.replies.push({ ...item, replies: [] })
      else groups.push({ ...item, replies: [] })
    }
  })
  return groups
}

function decorateCard(card) {
  if (!card) return null
  return {
    ...card,
    perspectives: (card.perspectives || []).map((item) => ({
      ...item,
      displayName: displayMember(item.relation, item.person)
    }))
  }
}

function decorateObject(object) {
  if (!object) return object
  const image = object.imageProcessed || object.imageOriginal || ''
  return {
    ...object,
    displayImage: image,
    uploaderDisplayName: displayMember(object.uploaderRelation, object.uploaderName)
  }
}

function buildQuotePayload(quoting) {
  return {
    parentId: quoting ? quoting.parentId : null,
    quotedAuthorName: quoting ? quoting.authorName : '',
    quotedExcerpt: quoting ? quoting.excerpt : ''
  }
}

Page({
  data: {
    objectId: '',
    object: null,
    card: null,
    memoryItems: [],
    memoryGroups: [],
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
    isUploader: false,
    quoting: null,
    quotingPanelOpen: false,
    repairOptions: REPAIR_OPTIONS,
    repairOptionLabels: REPAIR_OPTIONS.map((p) => p === 0 ? '不计入修复' : `+${p}%`),
    kindText: {
      question: '提问',
      memory: '补充'
    },
    CLUE_LABELS
  },

  onLoad(options) {
    this.setData({ objectId: options.objectId })
    this._recordTimer = null
    this._audioContext = null
    this._discardRecording = false
    this.bindRecorder()
    this.initAudioContext()
    this.loadData()
  },

  onHide() {
    this.stopActiveRecording(true)
  },

  onUnload() {
    this.stopActiveRecording(true)
    if (this._recordTimer) {
      clearInterval(this._recordTimer)
      this._recordTimer = null
    }
    if (this._autoGenTimer) {
      clearTimeout(this._autoGenTimer)
      this._autoGenTimer = null
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
      const shouldDiscard = this._discardRecording
      this._discardRecording = false
      this.setData({ recording: false })
      if (this._recordTimer) {
        clearInterval(this._recordTimer)
        this._recordTimer = null
      }
      if (shouldDiscard) return

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

  stopActiveRecording(discard) {
    if (!this.data.recording) return
    this._discardRecording = !!discard
    try {
      recorder.stop()
    } catch (e) {
      console.error('[recorder:stop] failed', e)
    }
    if (this._recordTimer) {
      clearInterval(this._recordTimer)
      this._recordTimer = null
    }
    this.setData({ recording: false })
  },

  loadData() {
    if (demoStore.DEMO_MODE) {
      const object = demoStore.getObject(this.data.objectId)
      const memoryItems = demoStore.getMemoryItems(this.data.objectId)

      if (!object) {
        wx.showToast({ title: '找不到预览藏品', icon: 'none' })
        return
      }

      const clues = object.memoryClues || { targetCount: 6, discoveredTypes: [], labels: {} }
      const progress = object.repairProgress || 0
      const cCount = (clues.discoveredTypes || []).length
      const cTarget = clues.targetCount || 6
      const filter = visualState(progress)
      const displayObject = decorateObject(object)
      const decoratedMemoryItems = decorateMemoryItems(memoryItems, displayObject)
      this.setData({
        object: displayObject,
        card: decorateCard(object.finalCard),
        memoryItems: decoratedMemoryItems,
        memoryGroups: buildMemoryGroups(decoratedMemoryItems),
        memoryClues: clues,
        clueCount: cCount,
        clueTarget: cTarget,
        filterStyle: filter.filter,
        isUploader: demoStore.isUploader(this.data.objectId)
      })
      this.resolveObjectImage(displayObject)
      return
    }

    wx.cloud.callFunction({
      name: 'getObjectDetail',
      data: { objectId: this.data.objectId },
      success: (res) => {
        const result = res.result || {}
        const object = result.object
        const memoryItems = result.memoryItems || []
        const clues = object.memoryClues || { targetCount: 6, discoveredTypes: [], labels: {} }
        const progress = object.repairProgress || 0
        const cCount = (clues.discoveredTypes || []).length
        const cTarget = clues.targetCount || 6
        const filter = visualState(progress)
        const displayObject = decorateObject(object)
        const decoratedMemoryItems = decorateMemoryItems(memoryItems, displayObject)
        this.setData({
          object: displayObject,
          card: decorateCard(object.finalCard),
          memoryItems: decoratedMemoryItems,
          memoryGroups: buildMemoryGroups(decoratedMemoryItems),
          memoryClues: clues,
          clueCount: cCount,
          clueTarget: cTarget,
          filterStyle: filter.filter,
          isUploader: !!result.isUploader
        })
        this.resolveObjectImage(displayObject)
      },
      fail: (err) => {
        console.error('[cloud:getObjectDetail] failed', err)
        wx.showToast({ title: '加载藏品失败', icon: 'none' })
      }
    })
  },

  onInput(event) {
    this.setData({ contentText: event.detail.value })
  },

  resolveObjectImage(object) {
    const fileID = object && (object.imageProcessed || object.imageOriginal)
    if (!fileID || demoStore.DEMO_MODE || !wx.cloud || !/^cloud:\/\//.test(fileID)) return

    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: (res) => {
        const file = res.fileList && res.fileList[0]
        if (file && file.tempFileURL) {
          this.setData({ 'object.displayImage': file.tempFileURL })
        }
      },
      fail: (err) => {
        console.error('[cloud:getTempFileURL:object-image] failed', err)
      }
    })
  },

  applyRepairUpdate(result, extra) {
    // 只刷新线索/新发现的提示，不再回写 repairProgress（由发起者评定决定）。
    const { repairReason, newClues, clueCount, clueTarget, memoryClues } = result
    const cCount = clueCount || 0
    const cTarget = clueTarget || 6
    const updates = {
      newClues: newClues || [],
      clueCount: cCount,
      clueTarget: cTarget
    }
    if (memoryClues) updates.memoryClues = memoryClues
    if (this.data.object && memoryClues) {
      updates['object.memoryClues'] = memoryClues
    }
    if (extra) Object.assign(updates, extra)
    this.setData(updates)
    wx.showToast({ title: repairReason || '已保存', icon: 'none', duration: 2500 })
    this.scheduleAutoGenerateCard()
  },

  scheduleAutoGenerateCard() {
    // 提交记忆成功后防抖触发，4 秒内多次提交只跑一次；手动按钮保留兜底。
    if (this._autoGenTimer) clearTimeout(this._autoGenTimer)
    this._autoGenTimer = setTimeout(() => {
      this._autoGenTimer = null
      if (this.data.generating) return
      this.generateCard({ silent: true })
    }, 4000)
  },

  onQuote(event) {
    const memoryId = event.currentTarget.dataset.id
    const memory = this.data.memoryItems.find((item) => (item.memoryId || item._id) === memoryId)
    if (!memory) return
    const excerpt = (memory.contentText || '').slice(0, 30)
    this.setData({
      quoting: {
        parentId: memory.rootMemoryId || memory.memoryId || memory._id,
        authorName: memory.displayName || displayMember(memory.authorRelation, memory.authorName),
        excerpt
      },
      quotingPanelOpen: true,
      contentText: ''
    })
  },

  clearQuote() {
    this.setData({ quoting: null, quotingPanelOpen: false })
  },

  onQuoteInput(event) {
    this.setData({ contentText: event.detail.value })
  },

  submitFromPanel() {
    this.submitByKind({ currentTarget: { dataset: { kind: 'memory' } } })
  },

  noop() {},

  onPickRepair(event) {
    if (!this.data.isUploader) return
    const memoryId = event.currentTarget.dataset.id
    const index = Number(event.detail.value)
    const percent = REPAIR_OPTIONS[index]
    if (typeof percent !== 'number') return

    if (demoStore.DEMO_MODE) {
      const result = demoStore.setMemoryRepair(memoryId, percent)
      if (!result) {
        wx.showToast({ title: '评定失败', icon: 'none' })
        return
      }
      this.loadData()
      wx.showToast({
        title: result.status === 'completed' ? '修复已完成' : `本条 +${percent}%`,
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '保存中' })
    wx.cloud.callFunction({
      name: 'setMemoryRepair',
      data: { memoryId, repairPercent: percent },
      success: (res) => {
        wx.hideLoading()
        const r = res.result || {}
        this.loadData()
        wx.showToast({
          title: r.status === 'completed' ? '修复已完成' : `本条 +${percent}%`,
          icon: 'none'
        })
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('[cloud:setMemoryRepair] failed', err)
        wx.showToast({ title: '评定失败', icon: 'none' })
      }
    })
  },

  submitByKind(event) {
    const kind = event.currentTarget.dataset.kind
    const contentText = this.data.contentText.trim()

    if (!contentText) {
      wx.showToast({ title: '先写点什么吧', icon: 'none' })
      return
    }

    const quoting = this.data.quoting
    const payload = {
      kind,
      source: 'text',
      contentText,
      ...buildQuotePayload(quoting)
    }

    if (demoStore.DEMO_MODE) {
      const result = demoStore.addMemoryItem(this.data.objectId, payload)
      const merged = decorateMemoryItems([...this.data.memoryItems, result.memoryItem], this.data.object)
      this.applyRepairUpdate(result, {
        contentText: '',
        quoting: null,
        quotingPanelOpen: false,
        memoryItems: merged,
        memoryGroups: buildMemoryGroups(merged)
      })
      return
    }

    wx.cloud.callFunction({
      name: 'addContribution',
      data: {
        objectId: this.data.objectId,
        ...payload
      },
      success: (res) => {
        this.applyRepairUpdate(res.result, { contentText: '', quoting: null, quotingPanelOpen: false })
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
        kind: 'memory',
        source: 'audio',
        contentText: '留下了一段语音记忆',
        audioUrl: savedFilePath,
        audioDuration: duration,
        ...buildQuotePayload(this.data.quoting)
      })
      if (!result) {
        wx.showToast({ title: '语音保存失败', icon: 'none' })
        return
      }
      const merged = decorateMemoryItems([...this.data.memoryItems, result.memoryItem], this.data.object)
      this.applyRepairUpdate(result, {
        memoryItems: merged,
        memoryGroups: buildMemoryGroups(merged),
        quoting: null
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
            kind: 'memory',
            source: 'audio',
            contentText: '留下了一段语音记忆',
            audioUrl: uploadRes.fileID,
            audioDuration: duration,
            ...buildQuotePayload(this.data.quoting)
          },
          success: (res) => {
            this.applyRepairUpdate(res.result, { quoting: null })
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

  generateCard(options) {
    const silent = !!(options && options.silent)
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
        if (!silent) wx.showToast({ title: '生成失败', icon: 'error' })
      },
      complete: () => {
        this.setData({ generating: false })
      }
    })
  }
})
