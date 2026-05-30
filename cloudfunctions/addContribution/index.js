const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const now = db.serverDate()

  if (!event.objectId) {
    throw new Error('objectId is required')
  }

  // 从用户记录获取真实名称和角色
  const userQuery = await db.collection('users').where({ openid }).limit(1).get()
  const user = userQuery.data.length ? userQuery.data[0] : null
  const authorName = user ? (user.name || (event.source === 'audio' ? '老人' : '家庭成员')) : (event.source === 'audio' ? '老人' : '家庭成员')
  const authorRole = user ? (user.role || (event.source === 'audio' ? 'elder' : 'family')) : (event.source === 'audio' ? 'elder' : 'family')

  const type = event.type || 'memory'
  const source = event.source || 'text'
  const contribution = {
    contributionId: '',
    objectId: event.objectId,
    userId: openid,
    authorName,
    authorRole,
    type,
    source,
    contentText: event.contentText || '',
    audioUrl: event.audioUrl || '',
    createdAt: now
  }

  const addRes = await db.collection('contributions').add({ data: contribution })
  await db.collection('contributions').doc(addRes._id).update({
    data: {
      contributionId: addRes._id
    }
  })

  const countRes = await db.collection('contributions').where({ objectId: event.objectId }).count()
  const repairProgress = Math.min(100, countRes.total * 20)
  const status = repairProgress >= 100 ? 'completed' : 'repairing'

  await db.collection('objects').doc(event.objectId).update({
    data: {
      repairProgress,
      status,
      updatedAt: now,
      completedAt: status === 'completed' ? now : null
    }
  })

  return {
    contributionId: addRes._id,
    repairProgress,
    status
  }
}
