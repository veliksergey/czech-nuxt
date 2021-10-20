<template>
  <v-row justify='center' class='mt-16'>
    <v-col cols='12' sm='8' md='5' lg='4' style='text-align: center'>
      <v-progress-circular :size='150' color='primary' indeterminate width='6'/>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'LoadingCircle'
}
</script>

<style scoped>

</style>
