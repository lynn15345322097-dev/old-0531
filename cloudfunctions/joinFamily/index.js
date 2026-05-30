const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const now = db.serverDate()

  if (!event.inviteCode) {
    throw new Error('inviteCode is required')
  }

  // 查找家庭
  const familyQuery = await db.collection('families').where({ inviteCode: event.inviteCode }).limit(1).get()
  if (!familyQuery.data.length) {
    throw new Error('邀请码无效，请检查后重试')
  }

  const family = familyQuery.data[0]
  const userName = event.userName || '家庭成员'
  const role = event.role || 'family'
  const relation = event.relation || '其他'

  // 更新或创建用户，绑定到该家庭
  const userQuery = await db.collection('users').where({ openid }).limit(1).get()
  const userData = {
    userId: openid,
    openid,
    familyId: family.familyId,
    name: userName,
    role,
    relation,
    updatedAt: now
  }

  if (userQuery.data.length) {
    await db.collection('users').doc(userQuery.data[0]._id).update({ data: userData })
  } else {
    userData.createdAt = now
    await db.collection('users').add({ data: userData })
  }

  return {
    family,
    user: userData
  }
}
