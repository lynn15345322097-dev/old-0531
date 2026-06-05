const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  // 从用户记录获取 familyId
  const userQuery = await db.collection('users').where({ openid }).limit(1).get()
  const familyId = userQuery.data.length ? userQuery.data[0].familyId : null
  if (!familyId) {
    return { objects: [] }
  }

  const where = { familyId }

  if (event.status && event.status !== 'all') {
    where.status = event.status
    // "已入馆"要求已生成展品卡
    if (event.status === 'completed') {
      where.finalCard = db.command.neq(null)
    }
  }

  const res = await db.collection('objects')
    .where(where)
    .orderBy('createdAt', 'desc')
    .get()

  // 计算每件藏品的参与人数
  const participantCounts = {}
  if (res.data.length) {
    const objectIds = res.data.map((obj) => obj._id || obj.objectId)
    const counts = {}
    for (const object of res.data) {
      const objectId = object._id || object.objectId
      counts[objectId] = new Set()
      if (object.uploaderOpenid) {
        counts[objectId].add(object.uploaderOpenid)
      }
    }
    const memoryRes = await db.collection('memoryItems')
      .where({ objectId: db.command.in(objectIds), familyId })
      .field({ objectId: true, authorOpenid: true })
      .get()
    for (const item of memoryRes.data) {
      if (!counts[item.objectId]) counts[item.objectId] = new Set()
      counts[item.objectId].add(item.authorOpenid)
    }
    for (const [objectId, openids] of Object.entries(counts)) {
      participantCounts[objectId] = openids.size
    }
  }

  return {
    objects: res.data,
    participantCounts
  }
}
