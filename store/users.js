const defaultUser = {
  id: 0,
  first_name: '',
  last_name: '',
  email: '',
  username: '',
  password: '',
  permissions: [],
  companies_manage: [],
  companies_manage_ids: [],
  companies_belong: [],
  companies_belong_ids: [],
  companies_partner: [],
  companies_partner_ids: [],
};
const defaultCompanyBelong = {
  id: 0,
  per_hour: null,
  per_hour_invoice: null,
};
const defaultCompanyPartner = {
  id: 0,
  percentage: null,
};

export const state = () => ({
  users: [],
  usersShort: [],
  isLoading: true,
  selectedUser: {...defaultUser},
  permissionTree: [],
});

export const getters = {
  users: state => state.users,
  isLoading: state => state.isLoading,
  selectedUser: state => state.selectedUser,
};

export const mutations = {
  SET_USERS(state, payload) {
    state.users = payload;
  },
  SET_IS_LOADING(state, payload) {
    state.isLoading = payload;
  },
  ADD_OR_UPDATE_USER(state, user) {
    const idx = state.users.findIndex(u => u.id === user.id);
    if (idx > -1) Object.assign(state.users[idx], user);
    else state.users.unshift(user);
  },
  SET_SELECTED_USER(state, user) {
    state.selectedUser = user ? {...defaultUser, ...user} : {...defaultUser};
  },
  ADD_USER_COMPANY_BELONG(state) {
    state.selectedUser.companies_belong.push({...defaultCompanyBelong});
  },
  REMOVE_USER_COMPANY_BELONG(state, idx) {
    state.selectedUser.companies_belong.splice(idx, 1);
  },
  ADD_USER_COMPANY_PARTNER(state) {
    state.selectedUser.companies_partner.push({...defaultCompanyPartner});
  },
  REMOVE_USER_COMPANY_PARTNER(state, idx) {
    state.selectedUser.companies_partner.splice(idx, 1);
  },
}

export const actions = {
  async getUsers({commit, state}) {
    try{
      commit('SET_IS_LOADING', true);
      const users = await this.$axios.$get('users');
      commit('SET_USERS', users);
      commit('SET_IS_LOADING', false);
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  async getUsersShortList({state}, {forced=false, label = true, company_id=''}) {
    // if (state.usersShort.length && !forced && !company_id) return state.usersShort;
    try {
      const users = await this.$axios.$get(`users/short?company_id=${company_id}`);
      if (label) users.forEach(u => u.label = `${u.last_name} ${u.first_name} - ${u.username}`);
      state.usersShort = users;
      return state.usersShort;
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  async getUser({commit, state}, id) {
    try {
      return await this.$axios.$get(`users/${id}`);
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async saveUser({commit, state}) {
    try {
      // update or create user based on id
      const user = (state.selectedUser.id > 0) ?
        await this.$axios.$put(`users/${state.selectedUser.id}`, state.selectedUser) :
        await this.$axios.$post('users', state.selectedUser);
      commit('ADD_OR_UPDATE_USER', user);
      commit('SET_SELECTED_USER');
      return user;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async deleteUser({commit, state}, id) {
    if (state.users.length <= 1) return; // restrict from deleting a user if there is 1 or less user

    try {
      const result = await this.$axios.$delete(`users/${id}`);
      const deleted = result.deleted;

      if (deleted) {
        const idx = state.users.findIndex(u => u.id === id);
        if (idx > -1) state.users.splice(idx, 1);
      }

      return deleted;
    } catch {
      return false;
    }
  },
  async getProfile({}, id) {
    try {
      const user = await this.$axios.$get(`users/${id}/profile`);
      return user || null;
    } catch (e) {
      return false;
    }
  },
  async updateProfile({commit, state}, data) {
    try {
      const user = await this.$axios.$put(`users/${data.id}/profile`, data);
      return user || null;
    } catch (e) {
      return false;
    }
  },
  async getPermissionTree({state}) {
    if (state.permissionTree.length) return state.permissionTree;

    try {
      const settings = await this.$axios.$get('settings?types=sections,permissionTypes');

      const tree = [
        {id: '0', name: 'Сотрудник/Рабочий'},
        {id: 'p', name: 'Партнёр'},
        {id: 'a', name: 'Администратор (все операции, во всех компаниях)'},
      ];

      settings.sections.forEach(section => {
        if (section.key !== 'users') { // don't display users in permission tree
          const branch = {
            id: section.id,
            name: section.title,
            children: [],
          };
          settings.permissionTypes.forEach(permission => {
            branch.children.push({
              id: `${section.id}${permission.id}`,
              name: permission.title,
            });
          });
          tree.push(branch);
        }
      });

      state.permissionTree = tree;
      return state.permissionTree;
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  async getPerHourInfo({commit, state}, {userId, companyId}) {
    try {
      const perHourInfo = await this.$axios.$get(`users/${userId}/perHour?company_id=${companyId}`);
      return perHourInfo || { per_hour: null, per_hour_invoice: null };
    } catch (e) {
      return { per_hour: null, per_hour_invoice: null };
    }
  },
  async checkIfTaken({commit, state}, {id, key, text}) {
    try {
      const result = await this.$axios.$get(`users/checkUnique?id=${id}&key=${key}&text=${text}`);
      return result.taken || false;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
}
