const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async () => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const now = db.serverDate()

  const userQuery = await db.collection('users').where({ openid }).limit(1).get()

  if (userQuery.data.length) {
    const user = userQuery.data[0]

    // 已绑定家庭
    if (user.familyId) {
      const familyQuery = await db.collection('families').where({ familyId: user.familyId }).limit(1).get()
      return {
        openid,
        user,
        family: familyQuery.data.length ? familyQuery.data[0] : null,
        needOnboarding: false
      }
    }

    // 用户存在但未绑定家庭
    return {
      openid,
      user,
      family: null,
      needOnboarding: true
    }
  }

  // 首次进入，创建空用户记录
  const user = {
    userId: openid,
    openid,
    familyId: null,
    name: '',
    relation: '',
    createdAt: now,
    updatedAt: now
  }

  const addRes = await db.collection('users').add({ data: user })

  return {
    openid,
    user: { _id: addRes._id, ...user },
    family: null,
    needOnboarding: true
  }
}
