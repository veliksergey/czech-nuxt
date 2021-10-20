<template>
  <v-card>
    <v-form @submit.prevent='close'>
      <v-card-title>Фильтр</v-card-title>
      <v-card-text>
        <v-container>
          <v-row>

            <!-- username -->
            <v-col cols='12' sm='6'>
              <v-text-field
                v-model='filter.username'
                type='text'
                clearable
                outlined
                prepend-inner-icon='mdi-account'
                label='Username'/>
            </v-col>

            <!-- company_name -->
            <v-col cols='12' sm='6'>
              <v-text-field
                v-model='filter.company_name'
                type='text'
                clearable
                outlined
                prepend-inner-icon='mdi-domain'
                label='Компания'/>
            </v-col>

            <!-- first_name -->
            <v-col cols='12' sm='6'>
              <v-text-field
                v-model='filter.first_name'
                type='text'
                clearable
                outlined
                prepend-inner-icon='mdi-account-circle'
                label='Имя'/>
            </v-col>

            <!-- last_name -->
            <v-col cols='12' sm='6'>
              <v-text-field
                v-model='filter.last_name'
                type='text'
                clearable
                outlined
                prepend-inner-icon='mdi-account-circle'
                label='Фамилия'/>
            </v-col>

            <!-- event type -->
            <v-col cols='12' sm='6'>
              <v-select
                v-model='filter.type_id'
                :items='types'
                :loading='!types.length'
                item-value='id'
                item-text='name'
                label='Тип события'
                outlined
                prepend-inner-icon='mdi-arrow-right'
              />
            </v-col>

            <!-- per_hour -->
            <v-col cols='12' sm='6'>
              <v-text-field
                v-model='filter.per_hour'
                type='number'
                clearable
                outlined
                prepend-inner-icon='mdi-cash'
                label='За час'/>
            </v-col>

            <!-- date -->
            <v-col cols='12' sm='6'>
              <v-menu
                ref='dateMenu'
                v-model='dateMenu'
                :close-on-content-click='true'
                :return-value.sync='filter.date'
                transition='scale-transition'
                offset-y
                max-width='290px'
                min-width='auto'
              >
                <template v-slot:activator='{on, attrs}'>
                  <v-text-field
                    v-model='filter.date'
                    label='Дата (месяц)'
                    prepend-inner-icon='mdi-calendar'
                    readonly
                    clearable
                    outlined
                    v-bind='attrs'
                    v-on='on'
                  />
                </template>
                <v-date-picker
                  v-model='filter.date'
                  type='month'
                  no-title
                  scrollable
                  @input='$refs.dateMenu.save(filter.date)'
                >
                  <v-spacer/>
                  <v-btn text color='primary' @click='dateMenu = false'>Отмена</v-btn>
                  <v-btn text color='primary' @click='$refs.dateMenu.save(filter.date)'>OK</v-btn>
                </v-date-picker>
              </v-menu>
            </v-col>
            <!-- date -->

            <!-- report_month -->
            <v-col cols='12' sm='6'>
              <v-menu
                ref='reportMonthMenu'
                v-model='reportMonthMenu'
                :close-on-content-click='true'
                :return-value.sync='filter.report_month'
                transition='scale-transition'
                offset-y
                max-width='290px'
                min-width='auto'
              >
                <template v-slot:activator='{on, attrs}'>
                  <v-text-field
                    v-model='filter.report_month'
                    label='Отчёт за'
                    prepend-inner-icon='mdi-calendar'
                    readonly
                    clearable
                    outlined
                    v-bind='attrs'
                    v-on='on'
                  />
                </template>
                <v-date-picker
                  v-model='filter.report_month'
                  type='month'
                  no-title
                  scrollable
                  @input='$refs.reportMonthMenu.save(filter.report_month)'
                >
                  <v-spacer/>
                  <v-btn text color='primary' @click='reportMonthMenu = false'>Отмена</v-btn>
                  <v-btn text color='primary' @click='$refs.reportMonthMenu.save(filter.report_month)'>OK</v-btn>
                </v-date-picker>
              </v-menu>
            </v-col>
            <!-- report_month -->

            <!-- amount_from -->
            <v-col cols='12' sm='6'>
              <v-text-field
                v-model='filter.amount_from'
                type='number'
                clearable
                outlined
                prepend-inner-icon='mdi-cash-multiple'
                label='Сумма от'/>
            </v-col>

            <!-- amount_to -->
            <v-col cols='12' sm='6'>
              <v-text-field
                v-model='filter.amount_to'
                type='number'
                clearable
                outlined
                prepend-inner-icon='mdi-cash-multiple'
                label='Сумма до'/>
            </v-col>

            <!-- amount_invoice_from -->
            <v-col cols='12' sm='6'>
              <v-text-field
                v-model='filter.amount_invoice_from'
                type='number'
                clearable
                outlined
                prepend-inner-icon='mdi-cash-multiple'
                label='Фактура от'/>
            </v-col>

            <!-- amount_invoice_to -->
            <v-col cols='12' sm='6'>
              <v-text-field
                v-model='filter.amount_invoice_to'
                type='number'
                clearable
                outlined
                prepend-inner-icon='mdi-cash-multiple'
                label='Фактура до'/>
            </v-col>

            <!-- ID -->
            <v-col cols='12' sm='6'>
              <v-text-field
                v-model='filter.id'
                type='number'
                clearable
                outlined
                prepend-inner-icon='mdi-numeric-1-circle'
                label='ID'/>
            </v-col>

          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>

        <!-- reset btn -->
        <v-btn type='button' @click='$emit("reload", {reset: true})'>
          <v-icon left>mdi-refresh</v-icon>
          Сбросить
        </v-btn>

        <!-- search btn -->
        <v-btn type='submit' color='primary'>
          <v-icon left>mdi-magnify</v-icon>
          Поиск
        </v-btn>

      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
const {mapMutations, mapActions, mapGetters} = createNamespacedHelpers('events');

export default {
  name: 'EventFilterDialog',

  data: () => ({
    reportMonthMenu: false,
    dateMenu: false,
  }),
  computed: {
    ...mapGetters(['filter', 'filterDialog']),
    types() {
      return this.$store.state.eventTypes.types;
    }
  },

  methods: {
    ...mapMutations(['SET_FILTER_DIALOG']),
    ...mapActions(['getEvents']),
    close: async function() {
      this.SET_FILTER_DIALOG(false);
      await this.getEvents();
    },
  },

  mounted() {
    this.$store.dispatch('eventTypes/getTypesShort');
  },
}
</script>

<style scoped>

</style>
