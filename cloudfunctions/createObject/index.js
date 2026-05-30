const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const now = db.serverDate()

  if (!event.imageOriginal) {
    throw new Error('imageOriginal is required')
  }

  // 从用户记录获取 familyId
  const userQuery = await db.collection('users').where({ openid }).limit(1).get()
  if (!userQuery.data.length || !userQuery.data[0].familyId) {
    throw new Error('请先创建或加入一个家庭')
  }

  const familyId = userQuery.data[0].familyId

  const countRes = await db.collection('objects').where({ familyId }).count()
  const objectNo = `No.${String(countRes.total + 1).padStart(3, '0')}`

  // 前置生成 objectId 作为文档 _id，一次 add 完成，避免二次 update
  const _id = `${openid}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const object = {
    _id,
    objectId: _id,
    objectNo,
    familyId,
    uploaderId: openid,
    title: '未知藏品',
    displayTitle: '未知藏品',
    imageOriginal: event.imageOriginal,
    imageProcessed: event.imageProcessed || event.imageOriginal,
    repairProgress: 0,
    status: 'repairing',
    finalCard: null,
    aiGenerated: false,
    createdAt: now,
    updatedAt: now,
    completedAt: null
  }

  await db.collection('objects').add({ data: object })

  return {
    objectId: _id,
    object
  }
}
