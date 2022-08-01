<script setup>
  import { h, ref } from 'vue'
  import { getLinks, AddALink, deleteALink } from '../utils/localDataStore'
  import { guid } from '../utils/funCommon'
  import { BookmarkOutline, CaretDownOutline, AddCircleOutline, SettingsOutline } from '@vicons/ionicons5'
  import { useMessage } from 'naive-ui'
  import { getVersion, showDatabases, createDatabase, dropDatabase, showSuperTables, showTables, dropTable } from '../utils/taosrestful'
  import settings from './settings.vue'
  import dbTree from './dbTree.vue'
  console.log('所有连接', getLinks())
  const linkOptions = ref([])
  const message = useMessage()
  const emit = defineEmits(['dataSel'])
  let formTitle = ref('新建连接')
  linkOptions.value = getLinks()
  let showForm = ref(false)
  let showModal = ref(false)
  let linkForm = ref({
    name: '',
    host: '',
    port: '6041',
    user: '',
    password: '',
  })
  let toDelLink = ref(null)
  function linkAdd() {
    formTitle.value = '新建连接'
    showForm.value = true
  }
  function linkEdit(link) {
    linkForm.value = JSON.parse(JSON.stringify(link))
    formTitle.value = '编辑连接'
    showForm.value = true
  }
  function linkTest() {
    showDatabases(linkForm.value).then((data) => {
      if (data.res) {
        message.info('连接成功', {
          duration: 1200,
        })
      } else {
        message.error(`连接失败：${data.msg}`, {
          duration: 1500,
        })
      }
    })
  }
  async function linkSubmit() {
    let databases = await showDatabases(linkForm.value)
    if (databases.res) {
      let verdata = await getVersion(linkForm.value)
      AddALink({
        id: linkForm.value.id ? linkForm.value.id : guid(),
        name: linkForm.value.name || linkForm.value.host,
        host: linkForm.value.host,
        port: linkForm.value.port,
        user: linkForm.value.user,
        password: linkForm.value.password,
        version: verdata,
      })
      message.success(formTitle.value == '新建连接' ? '添加成功' : '更新成功', {
        duration: 1200,
        onLeave: () => {
          linkOptions.value = getLinks()
        },
      })
      showForm.value = false
    } else {
      message.error(`${formTitle.value == '新建连接' ? '添加' : '更新'}失败：${databases.msg}`, {
        duration: 1500,
      })
    }
  }
  function linkDel(index) {
    toDelLink.value = index
    this.showModal = true
  }
  function delSubmit() {
    deleteALink(toDelLink.value)
    message.info('已删除', {
      duration: 1200,
      onLeave: () => {
        linkOptions.value = getLinks()
      },
    })
  }
  function formClose() {
    showForm.value = false
    linkForm.value = { name: '', host: '', port: '6041', user: '', password: '' }
  }
  function editUser(link) {
    if (link.user != 'root') {
      message.warning('请使用root用户登录', {
        duration: 1500,
      })
    } else {
      message.info('root', {
        duration: 1200,
      })
    }
  }
  function handleDataSel(type, data) {
    emit('dataSel', type, data)
  }
</script>
<template>
  <n-space justify="center" style="margin: 10px 0">
    <n-button type="primary" @click="linkAdd">
      <n-icon :size="18" :component="AddCircleOutline" />
      新建连接
    </n-button>
    <settings></settings>
  </n-space>
  <div style="padding: 10px 15px; width: calc(100% - 30px)">
    <n-collapse>
      <n-collapse-item v-for="(link, index) in linkOptions" :key="index">
        <template #header>
          <span class="linkname">{{ link.name }}</span>
          <n-tag size="small" type="success">{{ link.version }}</n-tag>
        </template>
        <template #header-extra>
          <div>
            <i title="用户管理" class="connection-right-icon fa fa-user-o font-weight-bold" @click.stop.prevent="editUser(link)"></i>
            <i title="刷新" class="connection-right-icon fa fa-refresh font-weight-bold" @click.stop.prevent="freshDB(link, true)"></i>
            <i title="编辑连接" class="connection-right-icon fa fa-edit font-weight-bold" @click.stop.prevent="linkEdit(link)"></i>
            <i title="删除连接" class="connection-right-icon fa fa-trash-o font-weight-bold" @click.stop.prevent="linkDel(index)"></i>
          </div>
        </template>
        <db-tree :link="link" @dataSel="handleDataSel"></db-tree>
      </n-collapse-item>
    </n-collapse>
  </div>

  <n-modal
    v-model:show="showForm"
    preset="card"
    :style="{
      width: '600px',
    }"
    :title="formTitle"
    :bordered="false"
    :segmented="{ content: 'soft', footer: 'soft' }"
    :on-after-leave="formClose"
  >
    <n-form ref="formRef" :model="linkForm" label-placement="left" label-width="auto" require-mark-placement="right-hanging" size="medium">
      <n-form-item label="名称" path="name">
        <n-input v-model:value="linkForm.name" placeholder="" />
      </n-form-item>
      <n-form-item label="主机" path="host">
        <n-input v-model:value="linkForm.host" placeholder="" />
      </n-form-item>
      <n-form-item label="端口" path="port">
        <n-input v-model:value="linkForm.port" placeholder="" />
      </n-form-item>
      <n-form-item label="用户名" path="user">
        <n-input v-model:value="linkForm.user" placeholder="" />
      </n-form-item>
      <n-form-item label="密码" path="password">
        <n-input v-model:value="linkForm.password" placeholder="" type="password" />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="right">
        <n-button type="primary" @click="linkTest" ghost>测试连接</n-button>
        <n-button type="primary" @click="formClose" ghost>取消</n-button>
        <n-button type="primary" @click="linkSubmit">确认</n-button>
      </n-space>
    </template>
  </n-modal>
  <n-modal v-model:show="showModal" preset="dialog" title="系统提示" content="确认删除此连接?" positive-text="确认" negative-text="算了" @positive-click="delSubmit" />
</template>
<style lang="scss" scoped>
  .linkname {
    font-size: 15px;
    margin-right: 5px;
  }
  .connection-right-icon {
    display: inline-block;
    font-size: 16px;
    padding: 3px;
    margin-right: 0px;
    transition: background 0.2s;
    &:hover {
      background: #dcdee0;
      border-radius: 3px;
    }
  }
</style>
