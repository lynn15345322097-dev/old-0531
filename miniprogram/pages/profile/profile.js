const demoStore = require('../../utils/demoStore')
const { decorateMember } = require('../../utils/memberDisplay')
const app = getApp()

Page({
  data: {
    family: null,
    user: null,
    inviteCode: '',
    demoMode: demoStore.DEMO_MODE,
    demoMembers: []
  },

  onShow() {
    if (demoStore.DEMO_MODE) {
      const family = demoStore.getFamily()
      const user = demoStore.getUser()
      app.globalData.family = family
      app.globalData.user = user
      app.globalData.needOnboarding = false
      this.setData({
        family,
        user: decorateMember(user),
        inviteCode: family.inviteCode || '',
        demoMembers: demoStore.getDemoMembers().map(decorateMember)
      })
      return
    }

    const family = app.globalData.family
    const user = app.globalData.user

    // 如果 globalData 没有，从数据库查
    if (!family || !user) {
      this.loadFromDB()
    } else {
      this.setData({
        family,
        user: decorateMember(user),
        inviteCode: family.inviteCode || ''
      })
    }
  },

  loadFromDB() {
    const db = wx.cloud.database()
    const user = app.globalData.user
    if (!user || !user.familyId) {
      this.setData({ user: user || null })
      return
    }

    db.collection('families').where({ familyId: user.familyId }).limit(1).get({
      success: (res) => {
        if (res.data.length) {
          const family = res.data[0]
          app.globalData.family = family
          this.setData({
            family,
            user: decorateMember(user),
            inviteCode: family.inviteCode || ''
          })
        }
      }
    })
  },

  copyInviteCode() {
    if (!this.data.inviteCode) return
    wx.setClipboardData({
      data: this.data.inviteCode,
      success: () => {
        wx.showToast({ title: '邀请码已复制', icon: 'success' })
      }
    })
  },

  switchDemoUser(event) {
    if (!demoStore.DEMO_MODE) return
    const openid = event.currentTarget.dataset.openid
    const user = demoStore.setDemoUser(openid)
    if (!user) {
      wx.showToast({ title: '切换失败', icon: 'none' })
      return
    }

    app.globalData.user = user
    const displayUser = decorateMember(user)
    this.setData({ user: displayUser })
    wx.showToast({ title: `已切换为${displayUser.displayName}`, icon: 'success' })
  },

  resetDemoData() {
    if (!demoStore.DEMO_MODE) return
    demoStore.resetDemo()
    const family = demoStore.getFamily()
    const user = demoStore.getUser()
    app.globalData.family = family
    app.globalData.user = user
    this.setData({
      family,
      user: decorateMember(user),
      inviteCode: family.inviteCode || '',
      demoMembers: demoStore.getDemoMembers().map(decorateMember)
    })
    wx.showToast({ title: '初始展品已恢复', icon: 'success' })
  }
})
