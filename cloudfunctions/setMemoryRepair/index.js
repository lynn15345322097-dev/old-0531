const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

const ALLOWED_PERCENTS = [0, 10, 20, 30, 50]

exports.main = async (event) => {
  if (!event.memoryId) {
    throw new Error('memoryId is required')
  }
  const percent = Number(event.repairPercent)
  if (!ALLOWED_PERCENTS.includes(percent)) {
    throw new Error(`无效的 repairPercent: ${event.repairPercent}`)
  }

  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const now = db.serverDate()

  // 找到这条记忆
  const memoryRes = await db.collection('memoryItems').doc(event.memoryId).get()
  const memory = memoryRes.data
  if (!memory) {
    throw new Error('记忆不存在')
  }

  // 找到对应的藏品
  const objectRes = await db.collection('objects').doc(memory.objectId).get()
  const object = objectRes.data
  if (!object) {
    throw new Error('藏品不存在')
  }

  // 权限校验：只有上传者可以评定
  if (object.uploaderOpenid !== openid) {
    throw new Error('只有发起者可以评定记忆贡献度')
  }

  // 写入这条记忆的评定
  await db.collection('memoryItems').doc(event.memoryId).update({
    data: {
      repairPercent: percent,
      reviewedByOpenid: openid,
      reviewedAt: now
    }
  })

  // 重新汇总同 object 下所有记忆的 repairPercent
  const allRes = await db.collection('memoryItems')
    .where({ objectId: memory.objectId })
    .get()

  let total = 0
  for (const item of allRes.data) {
    if (item.memoryId === event.memoryId) {
      total += percent
    } else if (typeof item.repairPercent === 'number') {
      total += item.repairPercent
    }
  }
  const repairProgress = Math.min(100, total)
  const status = repairProgress >= 100 ? 'completed' : 'repairing'

  await db.collection('objects').doc(memory.objectId).update({
    data: {
      repairProgress,
      status,
      updatedAt: now,
      completedAt: status === 'completed' ? (object.completedAt || now) : null
    }
  })

  return {
    memoryId: event.memoryId,
    repairPercent: percent,
    repairProgress,
    status
  }
}
