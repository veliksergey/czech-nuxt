<template>
  <v-card>
    <v-toolbar dense dark color='primary'>
      <v-toolbar-title>Категории расходов</v-toolbar-title>
      <v-spacer/>

      <!-- search field -->
      <v-text-field
        v-model='search'
        append-icon='mdi-magnify'
        label='Поиск'
        single-line
        hide-details
        autofocus
        clearable
        />

      <!-- refresh btn -->
      <v-btn icon @click='getCategories({forced: true})' :disabled='isLoading'>
        <v-icon>mdi-refresh</v-icon>
      </v-btn>

      <!-- add btn -->
      <v-btn icon @click='openFormDialog(null)'>
        <v-icon>mdi-plus</v-icon>
      </v-btn>

    </v-toolbar>

    <v-data-table
      :headers='headers'
      :items='categories'
      class='elevation-1'
      :loading='isLoading'
      :search='search'
      >

      <!-- actions -->
      <template v-slot:item.actions='{item}'>
        <v-icon @click='openFormDialog(item)'>mdi-pencil</v-icon>
        <v-icon @click='openDeleteDialog(item)'>mdi-delete</v-icon>
      </template>

    </v-data-table>

    <!-- form dialog -->
    <ExpenseCatFormDialog
      v-if='formDialog'
      :opened='formDialog'
      @close='closeFormDialog'
      />

    <!-- delete dialog -->
    <ConfirmDeleteDialog
      v-if='deleteDialog'
      :opened='deleteDialog'
      :data='catToDelete'
      @close='closeDeleteDialog($event)'
      />
  </v-card>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
const {mapMutations, mapActions, mapGetters} = createNamespacedHelpers('expenseCat');
import ExpenseCatFormDialog from '~/components/expense_categories/ExpenseCatFormDialog';

export default {
  name: 'expenseCategories',
  components: {ExpenseCatFormDialog},
  head: () => ({
    title: 'Категории расходов',
  }),
  data: () => ({
    headers: [
      {text: 'ID', value: 'id',},
      {text: 'Название', value: 'name',},
      {text: 'Компания', value: 'company_name',},
      {text: 'Вес/порядок', value: 'weight',},
      {text: '', value: 'actions', sortable: false},
    ],
    search: '',
    formDialog: false,
    deleteDialog: false,
    catToDelete: null,
  }),
  computed: {
    ...mapGetters(['categories', 'selectedCategory', 'isLoading']),
  },

  methods: {
    ...mapMutations(['SET_SELECTED_CATEGORY']),
    ...mapActions(['getCategories', 'deleteCategory']),
    openFormDialog(category) {
      this.formDialog = true;
      !category || this.SET_SELECTED_CATEGORY(category);
    },
    closeFormDialog() {
      this.formDialog = false;
    },
    openDeleteDialog(category) {
      this.deleteDialog = true;
      this.catToDelete = {
        id: category.id,
        table: [
          {key: 'Название', value: category.name},
        ],
      };
    },
    async closeDeleteDialog(toDelete) {
      if (toDelete) await this.deleteCategory(this.catToDelete.id);
      this.deleteDialog = false;
      this.catToDelete = null;
    },
  },

  mounted() {
    this.getCategories({forced: true});
  }
}
</script>

<style scoped>

</style>
