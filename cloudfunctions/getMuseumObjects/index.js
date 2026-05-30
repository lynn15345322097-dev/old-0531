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

  return {
    objects: res.data
  }
}
