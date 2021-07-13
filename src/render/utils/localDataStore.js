//存储数据在本地
export function getLinks() {
  let links = localStorage.getItem('links')
  links = links ? JSON.parse(links) : []
  return links
}
export function setLinks(links) {
  links = JSON.stringify(links) //将json数据转换为字符串存储
  return localStorage.setItem('links', links)
}
export function deleteALink(key) {
  let links = getLinks()
  links.splice(key, 1)
  return setLinks(links)
}
export function AddALink(theLink) {
  //添加一个连接，如果本地就存了，更新，没存新增
  let links = getLinks()
  for (let i = 0; i < links.length; i++) {
    if (theLink.host == links[i].host && theLink.port == links[i].port) {
      //更新
      links[i] = theLink
      return setLinks(links)
    }
  }
  //新增
  links.push(theLink)
  return setLinks(links)
}
