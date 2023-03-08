export const dataTypeOption = [
  {
    label: 'int',
    value: 'int',
  },
  {
    label: 'bigint',
    value: 'bigint',
  },
  {
    label: 'float',
    value: 'float',
  },
  {
    label: 'double',
    value: 'double',
  },
  {
    label: 'binary',
    value: 'binary',
  },
  {
    label: 'smallint',
    value: 'smallint',
  },
  {
    label: 'tinyint',
    value: 'tinyint',
  },
  {
    label: 'bool',
    value: 'bool',
  },
  {
    label: 'nchar',
    value: 'nchar',
  },
]
export var privilegeOption = ['write', 'read']
export function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
