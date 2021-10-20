<template>
  <v-dialog
    v-model='opened'
    max-width='600px'
    persistent
    >
    <v-form ref='form' v-model='valid' @submit.prevent='submit'>
      <v-card :loading='isLoading || !companies.length'>
        <v-card-title>
          Добавить/редактировать категорию расходов {{selectedCategory.name}}
        </v-card-title>
        <v-card-text>

          <!-- name -->
          <v-text-field
            id='name'
            v-model.trim='selectedCategory.name'
            :rules='rules.name'
            :error-messages='errorMsgs.name'
            label='Название'
            counter='30'
            type='text'
            autofocus
            @input='checkUnique($event)'
            />

          <v-autocomplete
            v-model='selectedCategory.company_id'
            :rules='rules.company_id'
            :items='companies'
            item-value='id'
            item-text='name'
            label='Компания'
            :loading='!companies.length'
            />

          <!-- weight -->
          <v-text-field
            v-model='selectedCategory.weight'
            :rules='rules.weight'
            label='Вес/порядок'
            type='number'
          />

        </v-card-text>
        <v-card-actions>

          <!-- cancel btn -->
          <v-btn type='button' @click='close'>
            <v-icon left>mdi-cancel</v-icon>
            Отмена
          </v-btn>
          <v-spacer/>

          <!-- save btn -->
          <v-btn
            color='primary'
            type='submit'
            :disabled='isLoading'
            :loading='isLoading'
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
const {mapMutations, mapActions, mapGetters} = createNamespacedHelpers('expenseCat');

export default {
  name: 'ExpenseCatFormDialog',
  props: {
    opened: {
      type: Boolean,
      required: true,
    },
  },
  data: function() {
    return {
      valid: false,
      isLoading: false,
      timer: null,
      errorMsgs: {name: []},
      rules: {
        name: [v => !!v || 'Введите название'],
        company_id: [v => !!v || 'Выберите компанию'],
        weight: [v => v > -100 && v < 100 || 'От -99 до 99']
      },
    }
  },
  computed: {
    ...mapGetters(['selectedCategory']),
    companies() {
      return this.$store.state.companies.companiesShort;
    },
  },

  methods: {
    ...mapMutations(['SET_SELECTED_CATEGORY']),
    ...mapActions(['saveCategory', 'getCategories', 'checkIfTaken']),
    async submit() {
      if (!this.$refs.form.validate()) return;

      await this.checkUnique(this.selectedCategory.name);
      if (this.errorMsgs.name.length) return;

      this.isLoading = true;

      // save
      const savedCategory = await this.saveCategory();
      this.isLoading = false;
      if (!savedCategory) return;

      this.$refs.form.resetValidation();
      this.close();
    },
    // async cancel() {
    //   await this.getCategories({forced: true});
    //   this.close();
    // },
    close() {
      this.SET_SELECTED_CATEGORY();
      this.$refs.form.resetValidation();
      this.$emit('close');
    },
    async checkUnique(name) {
      const element = this.$refs.form.inputs.find(i => i.id === 'name');
      element.validate();
      if (element && element.errorBucket.length) {
        this.errorMsgs['name'] = [];
        return;
      }

      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(async () => {
        const isTaken = await this.checkIfTaken({id: this.selectedCategory.id, name});
        this.errorMsgs.name = isTaken ? ['Категория расходов с таким названием уже существует'] : [];
      }, 400);
    }
  },

  mounted() {
    // !this.selectedCategory.id || this.$refs.form.validate();
    this.$store.dispatch('companies/getCompaniesShort', {})
  }
}
</script>

<style scoped>

</style>
