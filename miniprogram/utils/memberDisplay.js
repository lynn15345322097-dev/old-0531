function displayMember(relation, name) {
  if (relation && name && relation !== name) return `${relation}：${name}`
  return relation || name || '家人'
}

function decorateMember(record) {
  if (!record) return record
  return {
    ...record,
    displayName: displayMember(record.relation, record.name)
  }
}

module.exports = {
  displayMember,
  decorateMember
}
