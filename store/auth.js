export const state = () => ({
  currentUser: null, // id, username, permissions, expiresIn, token, sections
  currentTimer: null,
});

export const getters = {
  currentUser: state => state.currentUser,
  currentTimer: state => state.currentTimer,
};

export const mutations = {
  SET_CURRENT_USER(state, currentUser) {
    state.currentUser = currentUser || null;
  },
  SET_CURRENT_TIMER(state, duration) {
    if (!duration) {
      clearTimeout(state.currentTimer);
      return;
    }
    state.currentTimer = setTimeout(() => {
      // this.logout(state);
      clearTimeout(state.currentTimer);
      state.currentUser = null;
      clearLocalCurrent();
    }, duration * 1000);
  },
  SET_SECTIONS(state, sections) {
    state.currentUser.sections = sections;
  },
};

export const actions = {
  async authUser({commit, state}, data) {
    commit('SET_CURRENT_USER');
    try {
      const response = await this.$axios.$post('auth', data);

      if (response.errorMsg) {
        return response;
      }

      const {id, username, permissions, expiresIn, token, sections} = response;

      // if failing to set currentUser due to missing field
      if (!id || !username || !permissions.length || !expiresIn || !token) {
        return { errorMsg: 'Произошла ошибка' };
      }

      // set timer && user
      commit('SET_CURRENT_TIMER', expiresIn);
      commit('SET_CURRENT_USER', {id, username, permissions, expiresIn, token, sections});

      // set local current
      setLocalCurrent({
        id,
        username,
        permissions,
        expiresIn: new Date((new Date().getTime()) + expiresIn * 1000),
        token,
      });

      return response;

    } catch (e) {
      return { errorMsg: 'Произошла ошибка' };
    }
  },
  async autoAuth({commit, state}) {

    // get token from localStorage
    const localUser = getLocalCurrent();

    // if no token found
    if (!localUser) return false;

    // if token is expired
    const expiresDifference = localUser.expiresIn.getTime() - (new Date()).getTime();
    if (expiresDifference <= 0) {
      return false;
    }

    // get my sections
    const sections = await this.$axios.$get('settings/mySections');
    localUser.sections = sections;

    commit('SET_CURRENT_USER', localUser);
    commit('SET_CURRENT_TIMER', expiresDifference / 1000);

    return true;
  },
  logout({commit, state}) {
    commit('SET_CURRENT_USER');
    commit('SET_CURRENT_TIMER');
    clearLocalCurrent();
    this.$router.push('/');
  },
};

const getLocalCurrent = () => {
  const jwt = JSON.parse(localStorage.getItem('currentUser'));

  // return false if no jwt in localStorage
  if (!jwt) return false;

  const {id, username, permissions, expiresIn, token} = jwt;
  // if any field in currentUser is missing -> return false
  if (!id || !username || !permissions.length || !expiresIn || !token) {
    return false;
  }

  return {
    id,
    username,
    permissions,
    expiresIn: new Date(expiresIn),
    token,
  }
}
const clearLocalCurrent = () => {
  localStorage.removeItem('currentUser');
}
const setLocalCurrent = (currentUser) => {
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
}
