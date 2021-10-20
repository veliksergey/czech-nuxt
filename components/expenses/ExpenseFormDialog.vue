<template>
  <v-dialog v-model='opened' max-width='600px' persistent>
    <v-form ref='form' v-model='valid' @submit.prevent='submit'>
      <v-card :loading='isSaving'>
        <v-card-title>{{cardTitle}}</v-card-title>
        <v-card-text>

          <!-- category -->
          <v-autocomplete
            v-model='selectedExpense.category_id'
            :rules='rules.category_id'
            :items='categories'
            item-value='id'
            item-text='name'
            label='Категория'
            prepend-inner-icon='mdi-cash'
            :loading='!categories.length'
            />

          <!-- amount -->
          <v-text-field
            v-model.number='selectedExpense.amount'
            :rules='rules.amount'
            label='Сумма'
            type='number'
            />

          <!-- date -->
          <DatePicker
            :model='selectedExpense.date'
            label='Дата'
            @setDate='selectedExpense.date = $event'
            :rules='rules.date'
            />

          <!-- notes -->
          <v-text-field
            v-model.trim='selectedExpense.notes'
            label='Заметки'
            />

        </v-card-text>
        <v-card-actions>

          <!-- cancel btn -->
          <v-btn type='button' @click='cancel'>
            <v-icon left>mdi-cancel</v-icon>
            Отмена
          </v-btn>
          <v-spacer/>

          <!-- save btn -->
          <v-btn
            color='primary'
            type='submit'
            :disabled='isSaving'
            :loading='isSaving'
          >
            <v-icon left>mdi-content-save</v-icon>
            Сохранить
          </v-btn>

        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
const {mapMutations, mapActions, mapGetters} = createNamespacedHelpers('expenses');

export default {
  name: 'ExpenseFormDialog',
  props: {
    opened: {
      type: Boolean,
      required: true,
    },
  },
  data: function() {
    return {
      valid: false,
      isSaving: false,
      rules: {
        amount: [v => v > 0 || 'Введите число больше нуля'],
        date: [v => !!v || 'Выберите дату'],
        category_id: [v => !!v || 'Выберите категорию'],
      }
    }
  },
  computed: {
    ...mapGetters(['selectedExpense']),
    categories() {
      return this.$store.state.expenseCat.categories;
    },
    cardTitle() {
      if (this.selectedExpense.id) return 'Редактировать расход';
      return 'Добавить расход';
    }
  },

  methods: {
    ...mapMutations(['SET_SELECTED_EXPENSE', 'ADD_OR_UPDATE_EXPENSE']),
    ...mapActions(['saveExpense']),
    async submit() {
      if (!this.$refs.form.validate()) return;

      this.isSaving = true;

      // save
      const savedExpense = await this.saveExpense();
      this.isSaving = false;
      if (!savedExpense) return;

      this.$refs.form.resetValidation();
      this.close();
    },
    async cancel() {
      this.close();
    },
    close() {
      this.SET_SELECTED_EXPENSE();
      this.$refs.form.resetValidation();
      this.$emit('close');
    },
    setDefaultDate() {
      if (this.selectedExpense.id) return;
      this.selectedExpense.date = (new Date()).toISOString().substring(0, 10);
    },
  },

  async mounted() {
    this.$store.dispatch('expenseCat/getCategories', {forced: false})

    this.setDefaultDate();
  },
}
</script>

<style scoped>

</style>
