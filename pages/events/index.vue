<template>
  <v-card>

    <v-toolbar dense dark color='primary'>
      <v-toolbar-title>События</v-toolbar-title>
      <v-spacer/>

      <!-- search field -->
      <v-text-field
        v-model='searchTxt'
        append-icon='mdi-magnify'
        placeholder='Поиск по ID, сотрудникам, компаниям, суммам, фактуре, часам'
        single-line
        hide-details
        autofocus
        clearable
        @keyup.enter='reload({search: true,})'
        @click:clear='reload({search: true})'
        />
      <v-spacer/>

      <!-- filter btn/dialog -->
      <v-dialog v-model='fDialog' max-width='700px'>
        <template v-slot:activator='{on, attrs}'>
          <v-btn icon v-bind='attrs' v-on='on'>
            <v-badge overlap color='green' v-if='filterCount > 0'>
              <span v-bind='attrs' v-on='on' slot='badge'>{{ filterCount }}</span>
              <v-icon>mdi-filter</v-icon>
            </v-badge>
            <v-icon v-else>mdi-filter</v-icon>
          </v-btn>
        </template>
        <EventFilterDialog @reload='reload($event)'/>
      </v-dialog>

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
      :items='events'
      class='elevation-1'
      :loading='isLoading'
      :options.sync='listOptions'
      :server-items-length='total'
      :footer-props='footer'
      multi-sort
      show-expand
      single-expand
    >

      <!-- date_from, date_to -->
      <template v-slot:item.date_to='{item}'>
        <span v-if='item.date_from'>{{item.date_from | localDate}} - <br></span>
        {{item.date_to | localDate}}
      </template>

      <!-- event type -->
      <template v-slot:item.type_short_name='{item}'>
        <v-tooltip bottom>
          <template v-slot:activator='{on, attrs}'>
            <span v-bind='attrs' v-on='on' v-html='item.type_short_name'></span>
          </template>
          <span>{{item.type_full_name}}</span>
        </v-tooltip>
      </template>

      <!-- employee/user -->
      <template v-slot:item.user_username='{item}'>
        <v-tooltip bottom>
          <template v-slot:activator='{on, attrs}'>
            <span v-bind='attrs' v-on='on'>{{item.user_username}}</span>
          </template>
          <span>{{item.user_first_name}} {{item.user_last_name}}</span>
        </v-tooltip>
      </template>

      <!-- hours -->
      <template v-slot:item.hours='{item}'>
        {{item.hours | localNumber}}
      </template>

      <!-- per_hour -->
      <template v-slot:item.per_hour='{item}'>
        <span v-html='localCurrency(item.per_hour)'></span>
      </template>

      <!-- amount -->
      <template v-slot:item.amount='{item}'>
        <span v-html='localCurrency(item.amount)'></span>
      </template>

      <!-- per_hour_invoice -->
      <template v-slot:item.per_hour_invoice='{item}'>
        <span v-html='localCurrency(item.per_hour_invoice)'></span>
      </template>

      <!-- amount_invoice -->
      <template v-slot:item.amount_invoice='{item}'>
        <span v-html='localCurrency(item.amount_invoice)'></span>
      </template>

      <!-- actions (edit and delete btns) -->
      <template v-slot:item.actions='{item}'>
        <v-icon :disabled='isLoading' @click='openFormDialog(item)'>mdi-pencil</v-icon>
        <v-icon :disabled='isLoading' @click='openDeleteDialog(item)'>mdi-delete</v-icon>
      </template>

      <!-- expanded -->
      <template v-slot:expanded-item='{headers, item}'>
        <td :colspan='headers.length' class='pt-5 pb-5'>
          <v-row>
            <v-col cols='12' sm='6'>
              Заметки: <strong>{{item.notes}}</strong> <br>
              Сотрудник: <strong>{{item.user_first_name}} {{item.user_last_name}}</strong> <br>
              Отчёт за: <strong>{{item.report_month}}</strong> <br>
              Добавлено: <strong>{{item.created_username}}</strong>
              - <strong>{{item.created_at | localDate}}</strong> <br>
              <template v-if='item.created_at !== item.updated_at'>
                Редактировано: <strong>{{item.updated_username}}</strong>
                - <strong>{{item.updated_at | localDate}}</strong> <br>
              </template>
            </v-col>
            <v-col cols='12' sm='6'>
              Signature: {{item.signed}}
            </v-col>
          </v-row>
        </td>
      </template>

    </v-data-table>

    <!-- formDialog -->
    <EventFormDialog
      v-if='formDialog'
      :opened='formDialog'
      @close='closeFormDialog'
      />

    <!-- confirmDeleteDialog -->
    <ConfirmDeleteDialog
      v-if='deleteDialog'
      :opened='deleteDialog'
      :data='eventToDelete'
      @close='closeDeleteDialog($event)'
    />
  </v-card>
</template>

<script>
import EventFilterDialog from '~/components/events/EventFilterDialog';
import EventFormDialog from '~/components/events/EventFormDialog';
import {createNamespacedHelpers} from 'vuex';
const {mapMutations, mapActions, mapGetters} = createNamespacedHelpers('events');

export default {
  name: 'events',
  components: {EventFilterDialog, EventFormDialog},
  head: () => ({
    title: 'События',
  }),
  data: () => ({
    headers: [
      {text: 'ID', value: 'id'},
      {text: 'Дата', value: 'date_to'},
      {text: 'Тип', value: 'type_short_name'},
      {text: 'Сотрудник', value: 'user_username'},
      {text: 'Компания', value: 'company_name'},
      {text: 'Часов', value: 'hours', align: 'right',},
      {text: 'За час', value: 'per_hour', align: 'right',},
      {text: 'Сумма', value: 'amount', align: 'right',},
      {text: 'За час (Ф)', value: 'per_hour_invoice', align: 'right',},
      {text: 'Фактура', value: 'amount_invoice', align: 'right',},
      {text: '', value: 'actions', sortable: false,},
      { text: '', value: 'data-table-expand',},
      // signed, signed_amount, signed_date,
      // notes,
      // report_month, created_by, created_at, updated_by, updated_at
    ],
    footer: {
      itemsPerPageOptions: [10, 50, 100, 500,],
    },
    isHolding: false,
    searchTimer: null,
    deleteDialog: false,
    eventToDelete: null,
    formDialog: false,
  }),
  computed: {
    ...mapGetters(['events', 'total', 'isLoading', 'selectedEvent', 'options', 'search', 'filterDialog', 'filterCount']),
    listOptions: {
      get: function() {return this.options},
      set: function(options) {this.SET_OPTIONS(options)}
    },
    searchTxt: {
      get: function() {return this.search},
      set: function(search) {this.SET_SEARCH(search)}
    },
    fDialog: {
      get() {return this.filterDialog},
      set(val) {this.SET_FILTER_DIALOG(val)}
    }
  },

  methods: {
    ...mapMutations(['SET_SELECTED_EVENT', 'SET_OPTIONS', 'SET_FILTER', 'SET_SEARCH', 'SET_FILTER_DIALOG']),
    ...mapActions(['getEvents', 'deleteEvent']),
    async reload({ search, reset }) {
      this.isHolding = true;
      if (this.searchTimer) clearTimeout(this.searchTimer);

      if (search) {
        this.SET_OPTIONS({...this.options, page: 1});
      }
      if (reset) {
        this.SET_OPTIONS();
        this.SET_SEARCH();
        this.SET_FILTER();
      }

      await this.$nextTick();
      await this.getEvents();
      this.isHolding = false;
    },

    openDeleteDialog(event) {
      this.deleteDialog = true;
      this.eventToDelete = {
        id: event.id,
        table: [
          {key: 'ID', value: event.id},
          {key: 'Тип события', value: event.type_short_name},
          {key: 'Сотрудник', value: event.user_username},
          {key: 'Компания', value: event.company_name},
          {key: 'Сумма', value: this.localNumber(event.amount)},
          {key: 'Отчёт за', value: this.localDate(event.report_month)},
        ]
      }
    },
    async closeDeleteDialog(toDelete) {
      if (toDelete) await this.deleteEvent(this.eventToDelete.id);
      this.deleteDialog = false;
      this.eventToDelete = null;
    },
    openFormDialog(event) {
      this.formDialog = true;
      !event || this.SET_SELECTED_EVENT(event);
    },
    closeFormDialog() {
      this.formDialog = false;
    }
  },


  watch: {
    listOptions: {
      async handler() {
        this.isHolding || await this.getEvents();
      },
      deep: true,
    },
    searchTxt: {
      async handler() {
        if (this.isHolding) return;

        if (this.searchTimer) clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => {
          this.SET_OPTIONS({...this.options, page: 1});
          this.getEvents();
        }, 1000);
      }
    },
  }
}
</script>

<style scoped>

</style>
