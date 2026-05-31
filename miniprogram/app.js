const demoStore = require('./utils/demoStore')

App({
  globalData: {
    user: null,
    family: null,
    needOnboarding: true
  },

  onLaunch() {
    if (demoStore.DEMO_MODE) {
      this.globalData.user = demoStore.getUser()
      this.globalData.family = demoStore.getFamily()
      this.globalData.needOnboarding = false
      return
    }

    if (!wx.cloud) {
      wx.showModal({
        title: '云开发不可用',
        content: '请使用支持云开发的微信开发者工具打开项目。',
        showCancel: false
      })
      return
    }

    wx.cloud.init({
      env: wx.cloud.DYNAMIC_CURRENT_ENV,
      traceUser: true
    })

    this.login()
  },

  login() {
    wx.cloud.callFunction({
      name: 'login',
      success: (res) => {
        const result = res.result
        this.globalData.user = result.user
        this.globalData.family = result.family
        this.globalData.needOnboarding = result.needOnboarding

        // 未绑定家庭时，跳转 onboarding
        if (result.needOnboarding) {
          wx.redirectTo({ url: '/pages/onboarding/onboarding' })
        }
      },
      fail: (err) => {
        console.error('[cloud:login] failed', err)
        wx.showToast({ title: '登录失败，请重试', icon: 'none' })
      }
    })
  }
})
