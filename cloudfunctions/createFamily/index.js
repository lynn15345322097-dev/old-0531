const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

function generateInviteCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const now = db.serverDate()

  if (!event.familyName) {
    throw new Error('familyName is required')
  }

  const userName = event.userName || '家庭成员'
  const role = event.role || 'family'
  const relation = event.relation || '其他'

  // 生成唯一邀请码
  let inviteCode = generateInviteCode()
  let retries = 0
  while (retries < 5) {
    const exist = await db.collection('families').where({ inviteCode }).limit(1).get()
    if (!exist.data.length) break
    inviteCode = generateInviteCode()
    retries++
  }

  const familyId = `${openid}_${Date.now()}`
  await db.collection('families').add({
    data: {
      familyId,
      familyName: event.familyName,
      inviteCode,
      creatorOpenid: openid,
      createdAt: now,
      updatedAt: now
    }
  })

  // 更新或创建用户，绑定到新家庭
  const userQuery = await db.collection('users').where({ openid }).limit(1).get()
  const userData = {
    userId: openid,
    openid,
    familyId,
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
    familyId,
    familyName: event.familyName,
    inviteCode,
    user: userData
  }
}
