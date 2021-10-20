const defaultCompany = {
  id: 0,
  name: '',
  users_manage: [],
  users_manage_ids: [],
  users_belong: [],
  users_belong_ids: [],
  users_partner: [],
  users_partner_ids: [],
}
const defaultUserBelong = {
  id: 0,
  per_hour: null,
  per_hour_invoice: null,
};
const defaultUserPartner = {
  id: 0,
  percentage: null,
};

export const state = () => ({
  companies: [],
  companiesShort: [],
  selectedCompany: {...defaultCompany},
})

export const getters = {
  companies: state => state.companies,
  companiesShort: state => state.companiesShort,
  selectedCompany: state => state.selectedCompany,
}

export const mutations = {
  SET_COMPANIES(state, companies) {
    state.companies = companies;
  },
  SET_SELECTED_COMPANY(state, company) {
    state.selectedCompany = company ? {...defaultCompany, ...company} : {...defaultCompany};
  },
  ADD_OR_UPDATE_COMPANY(state, company) {
    const idx = state.companies.findIndex(c => c.id === company.id);
    if (idx > -1) Object.assign(state.companies[idx], company);
    else state.companies.unshift(company);
  },
  ADD_USER_COMPANY_BELONG(state) {
    state.selectedCompany.users_belong.push({...defaultUserBelong});
  },
  REMOVE_USER_COMPANY_BELONG(state, idx) {
    state.selectedCompany.users_belong.splice(idx, 1);
  },
  ADD_USER_COMPANY_PARTNER(state) {
    state.selectedCompany.users_partner.push({...defaultUserPartner});
  },
  REMOVE_USER_COMPANY_PARTNER(state, idx) {
    state.selectedCompany.users_partner.splice(idx, 1);
  }
}

export const actions = {
  async getCompanies({commit, state}, {forced = false}) {
    if (state.companies.length && !forced) return;
    try {
      const companies = await this.$axios.$get('companies');
      commit('SET_COMPANIES', companies);
      return companies;
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  async getCompaniesShort({commit, state}, {forced = false}) {
    if (state.companiesShort.length && !forced) return state.companiesShort;
    try {
      const companies = await this.$axios.$get('companies?short=true');
      state.companiesShort = companies;
      return state.companiesShort;
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  async saveCompany({commit, state}) {
    try {
      const company = (state.selectedCompany.id > 0) ?
        await this.$axios.$put(`companies/${state.selectedCompany.id}`, state.selectedCompany) :
        await this.$axios.$post('companies', state.selectedCompany);
      commit('ADD_OR_UPDATE_COMPANY', company);
      commit('SET_SELECTED_COMPANY');
      return company;
      return company;
    } catch (e) {
      return [];
    }
  },
  async deleteCompany({commit, state}, id) {
    try {
      const result = await this.$axios.$delete(`companies/${id}`);
      const deleted = result.deleted || false;

      if (deleted) {
        const idx = state.companies.findIndex(c => c.id === id);
        if (idx > -1) state.companies.splice(idx, 1);
      }

      return deleted;
    } catch {
      return false;
    }
  },
  async checkIfTaken({commit, state}, {id, name}) {
    try {
      const result = await this.$axios.$get(`companies/checkUnique?id=${id}&name=${name}`);
      return result.taken || false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
