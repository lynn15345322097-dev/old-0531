const app = getApp()

Page({
  data: {
    mode: 'choose',    // 'choose' | 'create' | 'join'
    familyName: '',
    userName: '',
    relation: '',
    inviteCode: '',
    loading: false,
    relations: ['爷爷', '奶奶', '爸爸', '妈妈', '孙女', '孙子', '其他']
  },

  startCreate() {
    this.setData({ mode: 'create' })
  },

  startJoin() {
    this.setData({ mode: 'join' })
  },

  backToChoose() {
    this.setData({ mode: 'choose', loading: false })
  },

  onFamilyName(event) {
    this.setData({ familyName: event.detail.value })
  },

  onUserName(event) {
    this.setData({ userName: event.detail.value })
  },

  onInviteCode(event) {
    this.setData({ inviteCode: event.detail.value })
  },

  onRelation(event) {
    this.setData({ relation: this.data.relations[event.detail.value] })
  },

  submitCreate() {
    const familyName = this.data.familyName.trim()
    const userName = this.data.userName.trim()

    if (!familyName) {
      wx.showToast({ title: '请输入家庭名称', icon: 'none' })
      return
    }
    if (!userName) {
      wx.showToast({ title: '请输入名字或昵称', icon: 'none' })
      return
    }

    this.setData({ loading: true })

    wx.cloud.callFunction({
      name: 'createFamily',
      data: {
        familyName,
        userName,
        relation: this.data.relation
      },
      success: (res) => {
        const result = res.result
        app.globalData.user = result.user
        app.globalData.family = {
          familyId: result.familyId,
          familyName: result.familyName,
          inviteCode: result.inviteCode
        }
        app.globalData.needOnboarding = false

        wx.showToast({ title: `创建成功！邀请码：${result.inviteCode}`, icon: 'none', duration: 3000 })
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' })
        }, 1500)
      },
      fail: (err) => {
        this.setData({ loading: false })
        wx.showToast({ title: err.errMsg || '创建失败', icon: 'none' })
      }
    })
  },

  submitJoin() {
    const inviteCode = this.data.inviteCode.trim()
    const userName = this.data.userName.trim()

    if (!inviteCode) {
      wx.showToast({ title: '请输入邀请码', icon: 'none' })
      return
    }
    if (inviteCode.length !== 6) {
      wx.showToast({ title: '邀请码应为 6 位数字', icon: 'none' })
      return
    }
    if (!userName) {
      wx.showToast({ title: '请输入名字或昵称', icon: 'none' })
      return
    }

    this.setData({ loading: true })

    wx.cloud.callFunction({
      name: 'joinFamily',
      data: {
        inviteCode,
        userName,
        relation: this.data.relation
      },
      success: (res) => {
        const result = res.result
        app.globalData.user = result.user
        app.globalData.family = result.family
        app.globalData.needOnboarding = false

        wx.showToast({ title: `已加入「${result.family.familyName}」`, icon: 'success' })
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' })
        }, 1000)
      },
      fail: (err) => {
        this.setData({ loading: false })
        wx.showToast({ title: err.errMsg || '加入失败，检查邀请码', icon: 'none' })
      }
    })
  }
})
