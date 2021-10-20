<template>
  <v-card>
    <v-toolbar dense dark color='primary'>
      <v-toolbar-title>Расходы</v-toolbar-title>
      <v-spacer/>

      <!-- search field -->
      <v-text-field
        v-model='searchTxt'
        append-icon='mdi-magnify'
        placeholder='Поиск по ID, сумме, компаниям, категориям'
        single-line
        hide-details
        autofocus
        clearable
        @keyup.enter='reload({search: true})'
        @click:clear='reload({search: true})'
        />
      <v-spacer/>

      <!-- refresh btn -->
      <v-btn icon @click='reload({reset: true})' :disabled='isLoading'>
        <v-icon>mdi-refresh</v-icon>
      </v-btn>

      <!-- add btn -->
      <v-btn icon @click='openFormDialog(null)'>
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-toolbar>

    <v-data-table
      :headers='headers'
      :items='expenses'
      class='elevation-1'
      :loading='isLoading'
      :options.sync='listOptions'
      :server-items-length='total'
      :footer-props='footer'
      multi-sort
      show-expand
      single-expand
      >

      <!-- date -->
      <template v-slot:item.date='{item}'>
        {{item.date | localDate}}
      </template>

      <!-- actions (edit and delete btns) -->
      <template v-slot:item.actions='{item}'>
        <v-icon :disabled='isLoading' @click='openFormDialog(item)'>mdi-pencil</v-icon>
        <v-icon :disabled='isLoading' @click='openDeleteDialog(item)'>mdi-delete</v-icon>
      </template>

      <!-- expanded -->
      <template v-slot:expanded-item='{headers, item}'>
        <td :colspan='headers.length' class='pt-5 pb-5'>
          Заметки: <strong>{{item.notes}}</strong> <br>
          Добавлено: <strong>{{item.created_username}}</strong>
          - <strong>{{item.created_at | localDate}}</strong> <br>
          Редактировано: <strong>{{item.updated_username}}</strong>
          - <strong>{{item.updated_at | localDate}}</strong> <br>
        </td>
      </template>

    </v-data-table>

    <!-- formDialog -->
    <ExpenseFormDialog
      v-if='formDialog'
      :opened='formDialog'
      @close='closeFormDialog'
      />

    <!-- confirmDeleteDialog -->
    <ConfirmDeleteDialog
      v-if='deleteDialog'
      :opened='deleteDialog'
      :data='expenseToDelete'
      @close='closeDeleteDialog($event)'
    />
  </v-card>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
const {mapMutations, mapActions, mapGetters} = createNamespacedHelpers('expenses');
import ExpenseFormDialog from '~/components/expenses/ExpenseFormDialog';

export default {
  name: 'expenses',
  components: {ExpenseFormDialog},
  head: () => ({
    title: 'Расходы'
  }),
  data: () => ({
    headers: [
      {text: 'ID', value: 'id'},
      {text: 'Сумма', value: 'amount'},
      {text: 'Дата', value: 'date'},
      {text: 'Категория', value: 'category_name'},
      {text: 'Компания', value: 'company_name'},
      {text: '', value: 'actions', sortable: false,},
      {text: '', value: 'data-table-expand',},
    ],
    footer: {
      itemsPerPageOptions: [10, 50, 100, 500,],
    },
    isHolding: false,
    searchTimer: null,
    deleteDialog: false,
    expenseToDelete: null,
    formDialog: false,
  }),
  computed: {
    ...mapGetters(['expenses', 'total', 'isLoading', 'selectedExpense', 'options', 'search']),
    listOptions: {
      get: function() {return this.options},
      set: function(options) {this.SET_OPTIONS(options)}
    },
    searchTxt: {
      get: function() {return this.search},
      set: function(search) {this.SET_SEARCH(search)}
    },
  },

  methods: {
    ...mapMutations(['SET_SELECTED_EXPENSE', 'SET_OPTIONS', 'SET_SEARCH']),
    ...mapActions(['getExpenses', 'deleteExpense']),
    async reload({search, reset}) {
      this.isHolding = true;
      if (this.searchTimer) clearTimeout(this.searchTimer);

      if (search) {
        this.SET_OPTIONS({...this.options, page: 1});
      }
      if (reset) {
        this.SET_OPTIONS();
        this.SET_SEARCH();
      }

      await this.$nextTick();
      await this.getExpenses();
      this.isHolding = false;
    },

    openDeleteDialog(expense) {
      this.deleteDialog = true;
      this.expenseToDelete = {
        id: expense.id,
        table: [
          {key: 'ID', value: expense.id},
          {key: 'Сумма', value: expense.amount},
          {key: 'Категория', value: expense.category_name},
        ]
      }
    },
    async closeDeleteDialog(toDelete) {
      if (toDelete) await this.deleteExpense(this.expenseToDelete.id);
      this.deleteDialog = false;
      this.expenseToDelete = null;
    },
    openFormDialog(expense) {
      this.formDialog = true;
      !expense || this.SET_SELECTED_EXPENSE(expense);
    },
    closeFormDialog() {
      this.formDialog = false;
    }
  },


  watch: {
    listOptions: {
      async handler() {
        this.isHolding || await this.getExpenses();
      },
      deep: true,
    },
    searchTxt: {
      async handler() {
        if (this.isHolding) return;

        if (this.searchTimer) clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => {
          this.SET_OPTIONS({...this.options, page: 1});
          this.getExpenses();
        }, 1000);
      }
    }
  }
}
</script>

<style scoped>

</style>
