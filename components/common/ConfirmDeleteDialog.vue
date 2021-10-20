<template>
<v-dialog
  v-model='opened'
  max-width='600px'
  @click:outside='close(false)'
  @keydown.esc='close(false)'>

  <v-card :loading='isLoading'>
    <v-card-title>
      Вы уверены что хотите удалить эту запись?
    </v-card-title>
    <v-card-text v-if='Object.keys(data).length'>

      <!-- table -->
      <table>
        <tr v-for='row in data.table'>
          <td>{{ row.key }}:</td>
          <td class='font-weight-bold'>{{ row.value }}</td>
        </tr>
      </table>

    </v-card-text>
    <v-card-actions>

      <!-- cancel btn -->
      <v-btn
        color='success'
        type='button'
        @click='close(false)'
      >
        Отмена
      </v-btn>

      <v-spacer></v-spacer>

      <!-- delete btn -->
      <v-btn
        color='error'
        type='button'
        :disabled='isLoading'
        :loading='isLoading'
        @click='close(true)'
      >
        <v-icon>mdi-delete</v-icon>
        Удалить
      </v-btn>

    </v-card-actions>
  </v-card>

</v-dialog>
</template>

<script>
export default {
  name: 'ConfirmDeleteDialog',
  props: {
    opened: {
      type: Boolean,
      required: true,
    },
    data: {
      type: Object,
      required: false,
      default: () => { return {};},
    }
  },
  data: () => ({
    isLoading: false,
  }),

  methods: {
    close(toDelete = false) {
      if (toDelete) this.isLoading = true;
      this.$emit('close', toDelete);
    },
  },
}
</script>

<style scoped>

</style>
