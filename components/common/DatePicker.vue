<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    max-width="290px"
    min-width="290px"
  >
    <template v-slot:activator="{on, attrs}">
      <v-text-field
        clearable
        :value="dateText"
        :label="label"
        :rules="rules"
        prepend-icon="mdi-calendar"
        readonly
        @click:clear="$emit('setDate', '')"
        v-bind="attrs"
        v-on="on"
      />
    </template>
    <v-date-picker
      v-model="date"
      @input="menu = false"
    >
    </v-date-picker>
  </v-menu>
</template>

<script>
export default {
  name: "IntDatePicker",
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
      return this.localDate(this.model, false, false);
    }
  },
}
</script>

<style scoped>

</style>
