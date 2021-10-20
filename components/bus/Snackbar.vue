<template>
  <v-snackbar
    v-model='model'
    :color='color'
    :timeout='timeout'
    >

    {{text}}

    <template v-slot:action='{attrs}'>
      <v-icon
        v-bind='attrs'
        @click='model = false'
        >mdi-close</v-icon>
    </template>

  </v-snackbar>
</template>

<script>
export default {
  name: 'Test',
  data: () => ({
    model: false,
    text: '',
    color: '',
    timeout: 5000
  }),

  created() {
    this.$nuxt.$on('snackbar-open', ({text, color, timeout}) => {
      this.model = false;
      this.text = text;
      this.color = color || '';
      this.timeout = timeout || 5000;
      this.model = true;
    });
    this.$nuxt.$on('snackbar-close', () => {
      this.model = false;
      this.text = '';
      this.color = '';
      this.timeout = 5000;
    })
  }
}
</script>

<style scoped>

</style>
