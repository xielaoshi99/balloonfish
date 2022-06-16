<script setup>
  import { h, ref } from 'vue'
  import { NIcon, NTag } from 'naive-ui'
  import { getLinks, AddALink, deleteALink } from '../utils/localDataStore'
  import { BookmarkOutline, CaretDownOutline, AddCircleOutline, SettingsOutline } from '@vicons/ionicons5'
  import { useMessage } from 'naive-ui'
  console.log('所有连接', getLinks())
  const linkOptions = ref([])
  const message = useMessage()
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

  function linkAdd() {
    formTitle.value = '新建连接'
    showForm.value = true
  }
  function linkEdit(link) {
    linkForm.value = link
    formTitle.value = '编辑连接'
    showForm.value = true
  }
  function linkDel() {
    this.showModal = true
  }
  function delSubmit() {
    alert('确认删除')
    message.info('已删除', {
      duration: 1200,
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
</script>
<template>
  <n-space justify="center" style="margin: 10px 0">
    <n-button type="primary" @click="linkAdd">
      <n-icon :size="18" :component="AddCircleOutline" />
      新建连接
    </n-button>
    <n-button type="primary" ghost>
      <n-icon :size="18" :component="SettingsOutline" />
    </n-button>
  </n-space>
  <div style="padding: 10px 15px; width: calc(100% - 30px)">
    <n-collapse>
      <n-collapse-item v-for="(link, index) in linkOptions" :key="index">
        <div>表信息</div>
        <template #header>
          <span class="linkname">{{ link.name }}</span>
          <n-tag size="small" type="success">{{ link.version }}</n-tag>
        </template>
        <template #header-extra>
          <div>
            <i title="用户管理" class="connection-right-icon fa fa-user-o font-weight-bold" @click.stop.prevent="editUser(link)"></i>
            <i title="刷新" class="connection-right-icon fa fa-refresh font-weight-bold" @click.stop.prevent="freshDB(link, true)"></i>
            <i title="编辑连接" class="connection-right-icon fa fa-edit font-weight-bold" @click.stop.prevent="linkEdit(link)"></i>
            <i title="删除连接" class="connection-right-icon fa fa-trash-o font-weight-bold" @click.stop.prevent="linkDel(link)"></i>
          </div>
        </template>
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
        <n-button type="primary" @click="handleButtonClick">确认</n-button>
        <n-button type="primary" @click="formClose" ghost>取消</n-button>
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
    /*font-weight: bold;*/
    padding: 3px;
    margin-right: 0px;
    transition: background 0.2s;
    &:hover {
      background: #dcdee0;
      border-radius: 3px;
    }
  }
</style>
