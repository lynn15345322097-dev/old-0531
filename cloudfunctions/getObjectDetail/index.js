const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event) => {
  if (!event.objectId) {
    throw new Error('objectId is required')
  }

  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  const userQuery = await db.collection('users').where({ openid }).limit(1).get()
  const user = userQuery.data.length ? userQuery.data[0] : null
  if (!user || !user.familyId) {
    throw new Error('用户不存在，请先登录')
  }

  const objectRes = await db.collection('objects').doc(event.objectId).get()
  const object = objectRes.data
  if (!object) {
    throw new Error('藏品不存在')
  }
  if (object.familyId !== user.familyId) {
    throw new Error('你不属于该藏品所属的家庭')
  }

  const memoryItemsRes = await db.collection('memoryItems')
    .where({ objectId: event.objectId })
    .orderBy('createdAt', 'asc')
    .get()

  const memoryItems = memoryItemsRes.data.filter((item) => {
    return item.familyId === user.familyId
  })

  return {
    object,
    memoryItems,
    isUploader: object.uploaderOpenid === openid
  }
}
