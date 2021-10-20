const defaultCat = {
  id: 0,
  name: '',
  weight: 0,
  company_id: 0,
}

export const state = () => ({
  categories: [],
  selectedCategory: {...defaultCat},
  isLoading: true,
});

export const getters = {
  categories: state => state.categories,
  selectedCategory: state => state.selectedCategory,
  isLoading: state =>state.isLoading,
}

export const mutations = {
  SET_CATEGORIES(state, categories) {
    state.categories = categories;
  },
  SET_SELECTED_CATEGORY(state, category) {
    state.selectedCategory = category ? {...defaultCat, ...category} : {...defaultCat};
  },
  ADD_OR_UPDATE_CATEGORY(state, category) {
    const idx = state.categories.findIndex(c => c.id === category.id);
    if (idx > -1) Object.assign(state.categories[idx], category);
    else state.categories.unshift(category);
  },
}

export const actions = {
  async getCategories({commit, state}, {forced = false}) {
    if (!forced && state.categories.length) return state.categories;
    try {
      state.isLoading = true;
      const categories = await this.$axios.$get('expense-categories');
      commit('SET_CATEGORIES', categories);
      state.isLoading = false;
    } catch (e) {
      console.error(e);
      state.isLoading = false;
      return false;
    }
  },
  async saveCategory({commit, state}) {
    try {
      const category = (state.selectedCategory.id > 0) ?
        await this.$axios.$put(`expense-categories/${state.selectedCategory.id}`, state.selectedCategory) :
        await this.$axios.$post('expense-categories', state.selectedCategory);
      commit('ADD_OR_UPDATE_CATEGORY', category);
      commit('SET_SELECTED_CATEGORY');
      return category;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async deleteCategory({commit, state}, id) {
    try {
      const result = await this.$axios.$delete(`expense-categories/${id}`);
      const deleted = result.deleted || false;

      if (deleted) {
        const idx = state.categories.findIndex(c => c.id === id);
        if (idx > -1) state.categories.splice(idx, 1);
      }

      return deleted;
    } catch {
      return false;
    }
  },
  async checkIfTaken({commit, state}, {id, name}) {
    try {
      const result = await this.$axios.$get(`expense-categories/checkUnique?id=${id}&name=${name}`);
      return result.taken || false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
