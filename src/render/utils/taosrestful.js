import axios from 'axios'

export async function sendRequest(sqlStr, payload, tableDis) {
  try {
    let res = await axios.post(`http://${payload.ip}:${payload.port}/rest/sql`, sqlStr, {
      auth: {
        username: payload.user,
        password: payload.password,
      },
      timeout: payload.timeout,
    })
    if (res.data.status == 'succ') {
      // console.log(res.data.data)
      // console.log(res.data.rows)
      // console.log(res.data.head)
      let head = res.data.head
      let resData = res.data.data.map((item) => Object.fromEntries(head.map((a, b) => [a, item[b]])))
      return { res: true, count: res.data.rows, data: resData, describe: tableDis || [] }
    } else {
      return { res: false, msg: res.data.desc, code: res.data.code }
    }
  } catch (err) {
    if (err.response) {
      return { res: false, msg: err.response.data.desc, code: err.response.data.code }
    } else {
      return { res: false, msg: '连接错误', code: -1 }
    }
  }
}
export function showDatabases(payload) {
  return sendRequest('SHOW DATABASES', payload)
}
export function testConnect(payload) {
  return sendRequest('SELECT SERVER_VERSION()', payload).then((a) => {
    if (a.res === false && a.code === -1) {
      return false
    } else {
      return true
    }
  })
}
export function getVersion(payload) {
  //获取服务器版本
  return sendRequest('SELECT SERVER_VERSION()', payload).then((a) => {
    if (a.res === false) {
      return 'unkown'
    } else {
      return a.data[0]['server_version()']
    }
  })
}
//添加数据库
export function createDatabase(dbName, payload, safe = true, keep = null, update = false, comp = null, replica = null, quorum = null, blocks = null) {
  let sqlStr = 'CREATE DATABASE '
  if (safe) {
    sqlStr += 'IF NOT EXISTS '
  }
  sqlStr += dbName

  if (keep) {
    sqlStr += ` KEEP ${keep}`
  }
  if (comp) {
    sqlStr += ` COMP ${comp}`
  }
  if (replica) {
    sqlStr += ` REPLICA ${replica}`
  }
  if (quorum) {
    sqlStr += ` QUORUM ${quorum}`
  }
  if (blocks) {
    sqlStr += ` BLOCKS ${blocks}`
  }
  if (update) {
    sqlStr += ` UPDATE 1`
  }
  // console.log(sqlStr)
  return sendRequest(sqlStr, payload)
}
// alterDatabase(dbName,keep=null,comp=null,replica=null,quorum=null,blocks=null){
//         let sqlStr = 'ALTER DATABASE '
//         sqlStr += dbName
//         if(keep != null){
//             sqlStr += ` KEEP ${keep}`
//         }
//         if(comp != null){
//             sqlStr += ` COMP ${comp}`
//         }
//         if(replica != null){
//             sqlStr += ` REPLICA ${replica}`
//         }
//         if(quorum != null){
//             sqlStr += ` QUORUM ${quorum}`
//         }
//         if(blocks != null){
//             sqlStr += ` BLOCKS ${blocks}`
//         }
//         // console.log(sqlStr)
//         return sendRequest(sqlStr)
//     },
//    useDatabase(dbName){
//     database = dbName
//    },
export function dropDatabase(dbName, payload, safe = true) {
  return sendRequest(`DROP DATABASE ${safe ? 'IF EXISTS' : ''} ${dbName}`, payload)
}
export function showSuperTables(dbName, payload, like = null) {
  let likeStr = like ? ` LIKE '%${like}%'` : ''
  return sendRequest(`SHOW ${dbName}.STABLES  ${likeStr}`, payload)
}
export function createSuperTables(dbName, payload, colArray, tagArray, superTableName) {
  var colStr = ''
  var tagStr = ''
  for (let i = 0; i < colArray.length; i++) {
    if (!colArray[i].isTag) {
      colStr += colArray[i].name + ' ' + colArray[i].type + ','
    }
  }
  for (let i = 0; i < tagArray.length; i++) {
    tagStr += tagArray[i].name + ' ' + tagArray[i].type + ','
  }
  colStr = colStr.slice(0, colStr.length - 1)
  tagStr = tagStr.slice(0, tagStr.length - 1)
  var sql = `CREATE STABLE ${superTableName} (${colStr}) TAGS (${tagStr})`
  console.log(sql)
  sendRequest(`USE ${dbName}`, payload)
  return sendRequest(sql, payload)
}
export function showTables(dbName, payload, like = null) {
  let likeStr = like ? ` LIKE '%${like}%'` : ''
  return sendRequest(`SHOW ${dbName}.TABLES  ${likeStr}`, payload)
}
export function disTable(tableName, dbName, payload) {
  return sendRequest(`DESCRIBE ${dbName}.${tableName}`, payload)
}
export function dropTable(tableName, dbName, payload, safe = false) {
  return sendRequest(`DROP TABLE ${safe ? 'IF EXISTS' : ''} ${dbName}.${tableName}`, payload)
}
export function insertData(tableName, data, dbName = null) {
  let dbN = dbName ? dbName : database
  let fields = ''
  let values = ''
  for (const [key, value] of Object.entries(data)) {
    fields += key + ','
    values += value + ','
  }
  // console.log(`INSERT INTO ${dbN}.${tableName} (${fields.slice(0,-1)}) VALUES (${values.slice(0,-1)})` )
  return sendRequest(`INSERT INTO ${dbN}.${tableName} (${fields.slice(0, -1)}) VALUES (${values.slice(0, -1)})`)
}
export function timeWhere(primaryKey, where, startTime, endTime) {
  where = where || ''
  if (where) {
    where += startTime ? ` and ${primaryKey} > '${startTime}' ` : ''
    if (where) {
      where += endTime ? ` and ${primaryKey} < '${endTime}' ` : ''
    } else {
      where += endTime ? `${primaryKey} < '${endTime}' ` : ''
    }
  } else {
    where += startTime ? `${primaryKey} > '${startTime}' ` : ''
    if (where) {
      where += endTime ? ` and ${primaryKey} < '${endTime}' ` : ''
    } else {
      where += endTime ? `${primaryKey} < '${endTime}' ` : ''
    }
  }
  return where
}
//查询数据
export async function selectData(tableName, dbName, payload, fields = null, where = null, limit = null, offset = null, desc = null, startTime = null, endTime = null) {
  //首先查询一次，获取表的整体情况
  const res = await disTable(tableName, dbName, payload)
  let primaryKey = 'ts'
  if (res.res && res.data.length > 0) {
    //获取第一项，时间戳
    primaryKey = res.data[0].Field
  } else {
    return { res: false, msg: 'distable error', code: 99 }
  }
  //组装where子句  //TODO
  where = timeWhere(primaryKey, where, startTime, endTime)
  let sqlStr = 'SELECT '
  let fieldStr = '*'
  if (fields && fields.length > 0) {
    fieldStr = ''
    fields.forEach(function (field) {
      fieldStr += field + ','
    })
    fieldStr = fieldStr.slice(0, -1)
  }
  sqlStr += fieldStr + ` FROM ${dbName}.${tableName} `
  if (where) {
    sqlStr += ` WHERE ${where} `
  }
  if (desc === 'DESC') {
    sqlStr += ` ORDER BY ${primaryKey} ${desc} `
  }
  if (limit != null) {
    sqlStr += ` LIMIT ${limit} `
  }
  if (offset != null) {
    sqlStr += ` OFFSET ${offset} `
  }
  //把总数数出来
  if (limit != null) {
    return sendRequest(sqlStr, payload, res.data).then((res_1) => {
      return countDataIn(tableName, dbName, primaryKey, payload, where).then((count) => {
        res_1.count = count
        return new Promise((resolve, reject) => {
          resolve(res_1)
        })
      })
    })
  } else {
    return sendRequest(sqlStr, payload, res.data)
  }
}
export function getTableTag(tableName, dbName, payload, tag) {
  let sqlStr = 'SELECT ' + tag.join(',') + ` FROM ${dbName}.${tableName}`
  return sendRequest(sqlStr, payload)

}
export function countDataIn(tableName, dbName, primaryKey, payload, where = '', startTime = null, endTime = null) {
  where = timeWhere(primaryKey, where, startTime, endTime)
  let sqlStr = 'SELECT '
  let fieldStr = 'count(*)'
  sqlStr += fieldStr + ` FROM ${dbName}.${tableName} `
  if (where) {
    sqlStr += ` WHERE ${where} `
  }
  // console.log(sqlStr)
  return sendRequest(sqlStr, payload).then((result) => {
    if (result.res && result.data.length > 0) {
      return new Promise((resolve, reject) => {
        resolve(result.data[0]['count(*)'])
      })
    } else {
      return new Promise((resolve, reject) => {
        resolve(0)
      })
    }
  })
}
export function rawSql(sqlStr, payload) {
  return sendRequest(sqlStr, payload)
}
export function rawSqlWithDB(sqlStr, dbName, payload) {
  // let dbN = dbName ? dbName : database
  return sendRequest(`USE ${dbName}`, payload).then((a) => {
    return sendRequest(sqlStr, payload)
  })
}
