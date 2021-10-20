<template>
  <v-dialog v-model='opened' max-width='900' persistent>
    <v-form ref='form' v-model='valid' @submit.prevent='submit'>
      <v-card :loading='isSaving'>
        <v-card-title>{{cardTitle}}</v-card-title>
        <v-card-text>

          <v-container>
            <v-row>

              <!-- company -->
              <v-col cols='12' sm='6' md='3'>
                <v-autocomplete
                  v-model='selectedEvent.company_id'
                  :rules='rules.company_id'
                  :items='companies'
                  item-value='id'
                  item-text='name'
                  label='Компания'
                  prepend-inner-icon='mdi-domain'
                  :loading='!companies.length'
                  @input='onCompanyChange'
                  :disabled='!!selectedEvent.id'
                />
              </v-col>

              <!-- user/employee -->
              <v-col cols='12' sm='6' md='3'>
                <v-autocomplete
                  v-model='selectedEvent.user_id'
                  :rules='rules.user_id'
                  :items='users'
                  item-value='id'
                  item-text='label'
                  label='Сотрудник'
                  prepend-inner-icon='mdi-account-circle'
                  :loading='isLoadingUsers'
                  @input='onUserChange'
                  :disabled='!!selectedEvent.id'
                />
              </v-col>

              <!-- event type -->
              <v-col cols='12' sm='6' md='3'>
                <v-autocomplete
                  v-model='selectedEvent.type_id'
                  :rules='rules.type_id'
                  :items='types'
                  item-value='id'
                  item-text='name'
                  label='Событие'
                  prepend-inner-icon='mdi-arrow-right'
                  :loading='!types.length'
                  @input='onEventTypeChange'
                  :disabled='!!selectedEvent.id'
                />
              </v-col>

              <!-- report month -->
              <v-col cols='12' sm='6' md='3'>
                <MonthPicker
                  :model='selectedEvent.report_month'
                  label='Отчёт за'
                  :rules='rules.report_month'
                  @setDate='selectedEvent.report_month = $event'
                />
              </v-col>
              <!-- report month -->

              <!-- AMOUNT -->
              <template v-if='TYPE_NAME === "amount"'>
                <!-- amount -->
                <v-col cols='12' sm='6'>
                  <v-text-field
                    v-model.number='selectedEvent.amount'
                    :rules='rules.amount'
                    label='Сумма'
                    type='number'
                  />
                </v-col>
              </template>
              <!-- AMOUNT -->

              <!-- SALARY -->
              <template v-if='TYPE_NAME === "salary"'>
                <!-- hours -->
                <v-col cols='12' sm='6'>
                  <v-text-field
                    v-model.number='selectedEvent.hours'
                    :rules='rules.hours'
                    label='Количество часов'
                    type='number'
                    />
                </v-col>

                <!-- per_hour -->
                <v-col cols='12' sm='6'>
                  <v-text-field
                    v-model.number='selectedEvent.per_hour'
                    :rules='rules.per_hour'
                    label='За час'
                    type='number'
                    :loading='isLoadingPerHour'
                    />
                </v-col>

                <!-- per_hour_invoice -->
                <v-col cols='12' sm='6'>
                  <v-text-field
                    v-model.number='selectedEvent.per_hour_invoice'
                    :rules='rules.per_hour'
                    label='За час по фактуре'
                    type='number'
                    :loading='isLoadingPerHour'
                    />
                </v-col>
              </template>
              <!-- SALARY -->

              <!-- DATES -->
              <template v-if='TYPE_NAME === "dates"'>
                <!-- date_from -->
                <v-col cols='12' sm='6'>
                  <DatePicker
                    :model='selectedEvent.date_from'
                    label='Дата от'
                    @setDate='onDateChange("date_from", $event)'
                    :rules='rules.date_from'
                  />
                </v-col>
              </template>
              <!-- DATES -->


              <!-- FOR EVERY TYPE -->
              <template v-if='TYPE_NAME'>
                <!-- date_to -->
                <v-col cols='12' sm='6'>
                  <DatePicker
                    :model='selectedEvent.date_to'
                    :label='TYPE_NAME === "dates" ? "Дата до" : "Дата"'
                    @setDate='onDateChange("date_to", $event)'
                    :rules='rules.date_to'
                  />
                </v-col>

                <!-- notes -->
                <v-col cols='12'>
                  <v-text-field
                    v-model.trim='selectedEvent.notes'
                    label='Заметки'
                  />
                </v-col>
              </template>
              <!-- FOR EVERY TYPE -->

            </v-row>
          </v-container>

        </v-card-text>
        <v-card-actions>

          <!-- cancel btn -->
          <v-btn type='button' @click='cancel'>
            <v-icon left>mdi-cancel</v-icon>
            Отмена
          </v-btn>
          <v-spacer/>

          <!-- after save -->
          <v-select
            v-if='!selectedEvent.id'
            v-model='action'
            :items='actions'
            item-value='value'
            item-text='label'
            hint='При сохранении'
            persistent-hint
            label='При сохранении'
            single-line
            @change='onActionChange'
            />
          <v-spacer/>

          <!-- save btn -->
          <v-btn
            color='primary'
            type='submit'
            :disabled='isSaving || isLoadingUsers || isLoadingPerHour'
            :loading='isSaving || isLoadingUsers || isLoadingPerHour'
            >
            <v-icon left>mdi-content-save</v-icon>
            Сохранить
          </v-btn>

        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
const {mapMutations, mapActions, mapGetters} = createNamespacedHelpers('events');

export default {
  name: 'EventFormDialog.vue',
  props: {
    opened: {
      type: Boolean,
      require: true,
    },
  },
  data: function() {
    return {
      valid: false,
      isSaving: false,
      isLoadingUsers: false,
      isLoadingPerHour: false,
      users: [],
      reportMonthMenu: false,
      rules: {
        company_id: [v => !!v || 'Выберите компанию'],
        user_id: [v => !!v || 'Выберите сотрудника'],
        type_id: [v => !!v || 'Выберите событие'],
        report_month: [v => !!v || 'Выберите месяц'],
        date_from: [
          v => this.TYPE_NAME !== 'dates' || !!v || 'Выберите дату',
          v => this.TYPE_NAME !== 'dates' || !this.selectedEvent.date_to || (new Date(this.selectedEvent.date_from)) <= (new Date(this.selectedEvent.date_to)) || '"Дата от" не может превышать "Дату до"',
        ],
        amount: [v => this.TYPE_NAME !== 'amount' || v > 0 || 'Введите число больше нуля'],
        hours: [v => this.TYPE_NAME !== 'salary' || v > 0 || 'Введите число больше нуля'],
        per_hour: [v => this.TYPE_NAME !== 'salary' || v > 0 || 'Введите число больше нуля'],
        date_to: [
          v => !!v || 'Выберите дату',
          v => this.TYPE_NAME !== 'dates' || !this.selectedEvent.date_to || (new Date(this.selectedEvent.date_from)) <= (new Date(this.selectedEvent.date_to)) || '"Дата от" не может превышать "Дату до"',
        ],
      },
      action: null,
      actions: [
        {value: 'nextEmployee', label: 'К следующему сотруднику'},
        {value: 'clear', label: 'Очистить форму'},
        {value: 'close', label: 'Закрыть'},
        // {value: 'stay', label: 'Ничего'},
      ],
    }
  },
  computed: {
    ...mapGetters(['selectedEvent']),
    companies() {
      return this.$store.state.companies.companiesShort;
    },
    types() {
      return this.$store.state.eventTypes.types;
    },
    TYPE_NAME() { // same logic in backend
      if (this.selectedEvent.type_id === 3) return 'salary';
      if (this.selectedEvent.type_id >= 4) return 'amount';
      if ([1,2].includes(this.selectedEvent.type_id)) return 'dates';
      return false;
    },
    cardTitle() {
      if (this.selectedEvent.id) return 'Редактировать событие';
      return 'Добавить событие';
    }
  },

  methods: {
    ...mapMutations(['SET_SELECTED_EVENT', 'ADD_OR_UPDATE_EVENT', 'MOVE_TO_NEXT_EMPLOYEE', 'CLEAR_SELECTED_EVENT']),
    ...mapActions(['saveEvent', 'getEvent', 'moveToNextEmployee']),
    async submit() {
      if (!this.$refs.form.validate()) return;


      this.isSaving = true;
      const isEditing = !!this.selectedEvent.id;

      // save
      const savedEvent = await this.saveEvent({actionOnSave: this.action, users: this.users});
      this.isSaving = false;
      if (!savedEvent) return;

      // after save
      if (this.action === 'nextEmployee') await this.toNextEmployee();
      else if (this.action === 'clear') this.CLEAR_SELECTED_EVENT();

      this.$refs.form.resetValidation();

      // if isEditing or action === close
      if (isEditing || this.action === 'close') {
        this.close();
      }
      // this.close();
    },
    async cancel() {
      // if (this.selectedEvent.id) {
      //   const event = await this.getEvent(this.selectedEvent.id);
      //   this.ADD_OR_UPDATE_EVENT(event);
      // }
      this.close();
    },
    close() {
      this.SET_SELECTED_EVENT();
      this.$refs.form.resetValidation();
      this.$emit('close');
    },
    async onCompanyChange(company_id) {
      this.isLoadingUsers = true;
      this.users = [];
      this.users = await this.$store.dispatch('users/getUsersShortList', {company_id, forced: true});
      if (!this.users.map(u => u.id).includes(this.selectedEvent.user_id)) this.selectedEvent.user_id = 0;
      this.isLoadingUsers = false;
      await this.getPerHourInfo();
      this.$refs.form.validate();
    },
    async onEventTypeChange() {
      this.$refs.form.validate();
      await this.getPerHourInfo();
    },
    async onUserChange() {
      await this.getPerHourInfo();
    },
    onDateChange(variable, date) {
      this.selectedEvent[variable] = date;
      this.$refs.form.validate();
    },
    async getPerHourInfo() {
      if (this.selectedEvent.id || !this.selectedEvent.company_id || !this.selectedEvent.user_id || this.TYPE_NAME !== 'salary') return;
      this.isLoadingPerHour = true;
      const info = await this.$store.dispatch('users/getPerHourInfo', {
        userId: this.selectedEvent.user_id,
        companyId: this.selectedEvent.company_id
      });
      this.selectedEvent.per_hour = info.per_hour;
      this.selectedEvent.per_hour_invoice = info.per_hour_invoice;
      this.isLoadingPerHour = false;
    },
    setDefaultReportMonth() {
      if (this.selectedEvent.id) return;
      const currentDate = new Date();
      const date = currentDate.setMonth(currentDate.getMonth() - 1);
      const year = new Intl.DateTimeFormat('ru', {year: 'numeric'}).format(date);
      const month = new Intl.DateTimeFormat('ru', {month: 'numeric'}).format(date);

      this.selectedEvent.report_month = `${year}-${month}`;
    },
    setDefaultDateTo(){
      if (this.selectedEvent.id || this.TYPE_NAME === 'dates') return;
      this.selectedEvent.date_to = (new Date()).toISOString().substring(0, 10);
    },
    async toNextEmployee() {
      const movedToNextEmployee = await this.moveToNextEmployee(this.users);
      if (movedToNextEmployee) await this.onUserChange();
    },
    onActionChange(action) {
      localStorage.setItem('eventAfterSaveAction', action);
    }
  },

  async mounted() {
    this.$store.dispatch('companies/getCompaniesShort', {});
    this.$store.dispatch('eventTypes/getTypesShort', {});
    if (this.selectedEvent.id) {
      !this.selectedEvent.company_id || await this.onCompanyChange(this.selectedEvent.company_id);
      this.$refs.form.validate();
    }

    this.setDefaultReportMonth();
    this.setDefaultDateTo();

    this.action = this.selectedEvent.id ? null :
      localStorage.getItem('eventAfterSaveAction') || this.actions[0].value;
  }
}
</script>

<style scoped>

</style>
