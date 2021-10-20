<template>
  <v-menu
    v-model='menu'
    :close-on-content-click='true'
    transition='scale-transition'
    offset-y
    max-width='290px'
    min-width='auto'
  >
    <template v-slot:activator='{on, attrs}'>
      <v-text-field
        clearable
        :value='dateText'
        :label='label'
        :rules='rules'
        prepend-inner-icon='mdi-calendar'
        readonly
        @click:clear='$emit("setDate", "")'
        v-bind='attrs'
        v-on='on'
      />
    </template>
    <v-date-picker
      v-model='date'
      @input='menu = false'
      type='month'
      no-title
      scrollable
    >
      <v-spacer/>
<!--      <v-btn text color='primary' @click='menu = false'>Отмена</v-btn>
      <v-btn text color='primary' @click='$refs.menu.save(selectedEvent.report_month)'>OK</v-btn>-->
    </v-date-picker>
  </v-menu>
</template>

<script>
export default {
  name: 'MonthPicker',
  props: {
    model: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      required: true,
    },
    rules: {
      type: Array,
      required: false,
      default: () => ([]),
    },
  },
  data: () => ({
    menu: false,
  }),

  computed: {
    date: {
      get() {
        return this.model;
      },
      set(date) {
        this.$emit('setDate', date);
      }
    },
    dateText() {
      return this.localDate(this.model, false, true);
    }
  }
}
</script>

<style scoped>

</style>
