<template>
  <h1>11111</h1>
  <button @click="count++">count is: {{ count }}</button>
  <p>
    Edit
    <code>components/HelloWorld.vue</code>
    to test hot module replacement.
  </p>
</template>

<script>
  export default {
    name: 'HelloWorld',

    data() {
      return {
        count: 0,
      }
    },
  }
</script>
