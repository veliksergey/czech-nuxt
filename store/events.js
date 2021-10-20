const defaultEvent = {
  id: 0,
  company_id: 0,
  user_id: 0,
  type_id: 0,
  report_month: '',
  notes: '',
  date_to: '',
  date_from: '',
  amount: '',
  hours: '',
  per_hour: '',
  per_hour_invoice: '',
  signed: false,
  signed_amount: '',
  signed_date: '',
}
const defaultFilter = {
  id: '',
  // date_range: [],
  type_id: '',
  username: '',
  first_name: '',
  last_name: '',
  company_name: '',
  per_hour: '',
  amount_from: '',
  amount_to: '',
  amount_invoice_from: '',
  amount_invoice_to: '',
  report_month: '', // new Date().toISOString().substr(0, 7),
  date: '',
}
const defaultOptions = {
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
  sortDesc: [],
}

export const state = () => ({
  events: [],
  total: 0,
  isLoading: true,
  selectedEvent: {...defaultEvent},
  options: {...defaultOptions},
  search: '',
  filter: {...defaultFilter},
  filterDialog: false,
});

export const getters = {
  events: state => state.events,
  total: state => state.total,
  isLoading: state => state.isLoading,
  selectedEvent: state => state.selectedEvent,
  filter: state => state.filter,
  filterCount: state => {
    const found = Object.keys(state.filter).filter(key => {
      if (key === 'date_range') return state.filter.date_range.length > 0;
      return !!state.filter[key];
    });
    return found ? found.length : 0;
  },
  filterDialog: state => state.filterDialog,
  options: state => state.options,
  search: state => state.search,
}

function takeCareOfEventDates(event) {
  if (event.date_from) event.date_from = event.date_from.substring(0, 10);
  if (event.date_to) event.date_to = event.date_to.substring(0, 10);
  return event;
}

export const mutations = {
  SET_EVENTS(state, events) {
    state.events = events;
  },
  SET_TOTAL(state, total) {
    state.total = total;
  },
  SET_IS_LOADING(state, payload) {
    state.isLoading = payload;
  },
  ADD_OR_UPDATE_EVENT(state, event) {
    const idx = state.events.findIndex(e => e.id === event.id);
    if (idx > -1) Object.assign(state.events[idx], event);
    else state.events.unshift(event);
  },
  SET_SELECTED_EVENT(state, event) {
    if (event) state.selectedEvent = {...defaultEvent, ...takeCareOfEventDates(event)};
    else state.selectedEvent = {...defaultEvent};
  },
  CLEAR_SELECTED_EVENT(state) {
    state.selectedEvent = {
      ...defaultEvent,
      report_month: state.selectedEvent.report_month,
    };
  },
  MOVE_TO_NEXT_EMPLOYEE(state, users) {
    const userIdx = users.findIndex(u => u.id === state.selectedEvent.user_id);
    if (userIdx > -1 && userIdx < users.length - 1) {
      state.selectedEvent.user_id = users[userIdx + 1].id;
      return true;
    }
    return false;
  },
  SET_OPTIONS(state, options) {
    state.options = options || {...defaultOptions};
  },
  SET_SEARCH(state, search) {
    state.search = search || '';
  },
  SET_FILTER(state, filter) {
    state.filter = filter ? {...defaultFilter, filter} : {...defaultFilter};
  },
  SET_FILTER_DIALOG(state, showDialog) {
    state.filterDialog = !!showDialog;
  },
}

export const actions = {
  async moveToNextEmployee({commit, state}, users) {
    state.selectedEvent = {...defaultEvent, ...{
        company_id: state.selectedEvent.company_id,
        user_id: state.selectedEvent.user_id,
        type_id: state.selectedEvent.type_id,
        report_month: state.selectedEvent.report_month,
        date_to: state.selectedEvent.date_to,
    }}
    const userIdx = users.findIndex(u => u.id === state.selectedEvent.user_id);
    if (userIdx > -1 && userIdx < users.length - 1) {
      state.selectedEvent.user_id = users[userIdx + 1].id;
      return true;
    }
    state.selectedEvent.user_id = null;
    return false;
  },
  async getEvents({commit, state}) {
    try {
      commit('SET_IS_LOADING', true);

      const search = state.search.toLowerCase();
      const {page, itemsPerPage, sortBy, sortDesc} = state.options;

      Object.keys(state.filter).forEach(key => {
        if (!state.filter[key]) state.filter[key] = ''; // to prevent null(s) in query
      })

      const params = new URLSearchParams({search, page, itemsPerPage, sortBy, sortDesc, ...state.filter});
      const result = await this.$axios.$get('events', {params});

      commit('SET_EVENTS', result.results);
      commit('SET_TOTAL', result.total);
      commit('SET_IS_LOADING', false);
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  async getEvent({commit, state}, id) {
    try {
      return await this.$axios.$get(`events/${id}`);
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async saveEvent({commit, state}, actionOnSave) {
    try {
      const event = (state.selectedEvent.id > 0) ?
        await this.$axios.$put(`events/${state.selectedEvent.id}`, state.selectedEvent) :
        await this.$axios.$post('events', state.selectedEvent);
      commit('ADD_OR_UPDATE_EVENT', event);
      return event;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async deleteEvent({commit, state}, id) {
    try {
      const result = await this.$axios.$delete(`events/${id}`);
      const deleted = result.deleted;

      if (deleted) {
        const idx = state.events.findIndex(e => e.id === id);
        if (idx > -1) state.events.splice(idx, 1);
      }

      return deleted;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
