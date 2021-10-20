export const state = () => ({
  types: [],
})

export const getters = {
  types: state => state.types,
}

export const mutations = {
  SET_TYPES(state, types) {
    state.types = types;
  }
}

export const actions = {
  async getTypesShort({commit, state}) {
    if (state.types.length) return state.types;
    try {
      const types = await this.$axios.$get('event-types/short');
      commit('SET_TYPES', types);
      return types;
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}
