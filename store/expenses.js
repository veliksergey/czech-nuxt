const defaultExpense = {
  id: 0,
  category_id: 0,
  amount: '',
  date: '',
  notes: '',
}
const defaultOptions = {
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
  sortDesc: [],
}

export const state = () => ({
  expenses: [],
  total: 0,
  isLoading: true,
  selectedExpense: {...defaultExpense},
  options: {...defaultOptions},
  search: '',
});

export const getters = {
  expenses: state => state.expenses,
  total: state => state.total,
  isLoading: state => state.isLoading,
  selectedExpense: state => state.selectedExpense,
  options: state => state.options,
  search: state => state.search,
}

export const mutations = {
  SET_EXPENSES(state, expenses) {
    state.expenses = expenses;
  },
  SET_TOTAL(state, total) {
    state.total = total;
  },
  SET_IS_LOADING(state, loading) {
    state.isLoading = loading;
  },
  ADD_OR_UPDATE_EXPENSE(state, expense) {
    const idx = state.expenses.findIndex(e => e.id === expense.id);
    if (idx > -1) Object.assign(state.expenses[idx], expense);
    else state.expenses.unshift(expense);
  },
  SET_SELECTED_EXPENSE(state, expense) {
    if (expense) {
      if (expense.date) expense.date = expense.date.substring(0, 10);
      state.selectedExpense = {...defaultExpense, ...expense};
      return;
    }
    state.selectedExpense = {...defaultExpense};
  },
  SET_OPTIONS(state, options) {
    state.options = options || {...defaultOptions};
  },
  SET_SEARCH(state, search) {
    state.search = search || '';
  },
}

export const actions = {
  async getExpenses({commit, state}) {
    try {
      commit('SET_IS_LOADING', true);

      const search = state.search.toLowerCase();
      const {page, itemsPerPage, sortBy, sortDesc} = state.options;

      const params = new URLSearchParams({search, page, itemsPerPage, sortBy, sortDesc});
      const result = await this.$axios.$get('expenses', {params});

      commit('SET_EXPENSES', result.results);
      commit('SET_TOTAL', result.total);
      commit('SET_IS_LOADING', false);
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  async saveExpense({commit, state}) {
    try {
      const expense = (state.selectedExpense.id > 0) ?
        await this.$axios.$put(`expenses/${state.selectedExpense.id}`, state.selectedExpense) :
        await this.$axios.$post('expenses', state.selectedExpense);
      commit('ADD_OR_UPDATE_EXPENSE', expense);
      commit('SET_SELECTED_EXPENSE');
      return expense;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async deleteExpense({commit, state}, id) {
    try {
      const result = await this.$axios.$delete(`expenses/${id}`);
      const deleted = result.deleted;

      if (deleted) {
        const idx = state.expenses.findIndex(e => e.id === id);
        if (idx > -1) state.expenses.splice(idx, 1);
      }

    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
