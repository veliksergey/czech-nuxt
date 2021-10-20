<template>
  <v-dialog
    v-model='opened'
    max-width='600px'
    persistent
    >
    <v-form ref='form' v-model='valid' @submit.prevent='submit'>
      <v-card :loading='isLoading || !companies.length'>

        <v-tabs centered show-arrows v-model='tab'>
          <v-tab key='info'>
            <v-icon left>mdi-information</v-icon>
            Инфо
          </v-tab>
          <v-tab key='employees'>
            <v-icon left>mdi-account-hard-hat</v-icon>
            Сотрудники
          </v-tab>
          <v-tab key='partners'>
            <v-icon left>mdi-handshake</v-icon>
            Партнёры
          </v-tab>
        </v-tabs>

        <v-card-text>
          <v-tabs v-model='tab' vertical>

            <!-- info tab -->
            <v-tab-item key='info'>
              <!-- name -->
              <v-text-field
                id='name'
                v-model.trim='selectedCompany.name'
                :rules='rules.name'
                :error-messages='errorMsgs.name'
                label='Название'
                counter='30'
                type='text'
                autofocus
                @input='checkUnique($event)'
                />

              <!-- users_manage -->
              <v-autocomplete
                v-model='selectedCompany.users_manage_ids'
                :items='users'
                item-value='id'
                item-text='label'
                label='Под управлением пользователей'
                multiple
                :loading='!users.length'
                chips
                deletable-chips
              />
            </v-tab-item>

            <!-- users_belong_to tab -->
            <v-tab-item key='employees'>

              <!-- if no users -->
              <div v-if='!selectedCompany.users_belong.length'>Пользователи не выбраны</div>

              <div v-for='(user, counter) in selectedCompany.users_belong' :key='counter'>

                <v-card-title>
                  Пользователь #{{counter+1}}: {{user.username}}
                  <v-spacer/>
                  <!-- delete icon -->
                  <v-btn icon @click='REMOVE_USER_COMPANY_BELONG(counter)'>
                    <v-icon class='right' color='error'>mdi-delete</v-icon>
                  </v-btn>
                </v-card-title>

                <v-autocomplete
                  v-model='user.id'
                  :items='users'
                  item-value='id'
                  item-text='username'
                  label='Сотрудник'
                  :loading='!users.length'
                  :rules='rules.employee'
                  />

                <v-text-field
                  v-model='user.per_hour'
                  label='За час'
                  type='number'
                  />

                <v-text-field
                  v-model='user.per_hour_invoice'
                  label='За час (по фактуре)'
                  type='number'
                  />

                <v-divider class='mt-5 mb-5' v-show='counter < selectedCompany.users_belong.length - 1'/>
              </div>
            </v-tab-item>

            <!-- partners tab -->
            <v-tab-item key='partners'>

              <!-- if no users -->
              <div v-if='!selectedCompany.users_partner.length'>Пользователи не выбраны</div>

              <div v-for='(user, counter) in selectedCompany.users_partner' :key='counter'>

                <v-card-title>
                  Пользователь #{{counter+1}}: {{user.username}}
                  <v-spacer/>
                  <!-- delete icon -->
                  <v-btn icon @click='REMOVE_USER_COMPANY_PARTNER(counter)'>
                    <v-icon class='right' color='error'>mdi-delete</v-icon>
                  </v-btn>
                </v-card-title>

                <v-autocomplete
                  v-model='user.id'
                  :rules='rules.employee'
                  :items='users'
                  item-value='id'
                  item-text='label'
                  label='Партнёр'
                  :loading='!users.length'
                  />

                <v-text-field
                  v-model='user.percentage'
                  :rules='rules.percentage'
                  label='Процент дохода'
                  type='number'
                  />

                <v-divider class='mt-5 mb-5' v-show='counter < selectedCompany.users_partner.length - 1'/>
              </div>

            </v-tab-item>

          </v-tabs>
        </v-card-text>
        <v-card-actions>

          <!-- cancel btn -->
          <v-btn type='button' @click='cancel'>
            <v-icon left>mdi-cancel</v-icon>
            Отмена
          </v-btn>
          <v-spacer/>

          <!-- add btn -->
          <v-btn
            v-if='tab >= 1'
            color='accent'
            type='button'
            @click='addUser'
            >
            <v-icon left>mdi-plus</v-icon>
            Добавить
          </v-btn>

          <!-- save btn -->
          <v-btn
            color='primary'
            type='submit'
            :disabled='isLoading'
            :loading='isLoading'
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
const {mapMutations, mapActions, mapGetters} = createNamespacedHelpers('companies');

export default {
  name: 'CompanyFormDialog',
  props: {
    opened: {
      type: Boolean,
      required: true,
    },
  },
  data: function() {
    return {
      valid: false,
      isLoading: false,
      tab: null,
      timer: null,
      errorMsgs: {name: []},
      rules: {
        name: [v => !!v || 'Введите название'],
        employee: [v => !!v || 'Выберите сотрудника'],
        percentage: [
          v => !!v || 'Укажите процент',
          v => v > 0 && v <= 100 || 'Процент не может быть менее нуля или более 100',
        ],
      },
    }
  },
  computed: {
    ...mapGetters(['companies', 'selectedCompany']),
    users() {
      return this.$store.state.users.usersShort;
    },
    currentUser() {
      return this.$store.state.auth.currentUser;
    },
  },

  methods: {
    ...mapMutations(['SET_SELECTED_COMPANY', 'ADD_USER_COMPANY_BELONG', 'REMOVE_USER_COMPANY_BELONG', 'ADD_USER_COMPANY_PARTNER', 'REMOVE_USER_COMPANY_PARTNER']),
    ...mapActions(['getCompanies', 'saveCompany', 'checkIfTaken']),
    async submit() {
      if (!this.$refs.form.validate()) return;

      await this.checkUnique(this.selectedCompany.name);
      if (this.errorMsgs.name.length) return;

      this.isLoading = true;

      // save
      const savedCompany = await this.saveCompany();
      this.isLoading = false;
      if (!savedCompany) return;

      this.$refs.form.resetValidation();
      this.close();
    },
    async cancel() {
      // const company = await this.getCompany()
      await this.getCompanies({forced: true});
      this.close();
    },
    close() {
      this.SET_SELECTED_COMPANY();
      this.$refs.form.resetValidation();
      this.$emit('close');
    },
    addUser() {
      if (this.tab === 1) this.ADD_USER_COMPANY_BELONG();
      else this.ADD_USER_COMPANY_PARTNER();
    },
    async checkUnique(name) {
      const element = this.$refs.form.inputs.find(i => i.id === 'name');
      element.validate();
      if (element && element.errorBucket.length) {
        this.errorMsgs['name'] = [];
        return;
      }

      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(async () => {
        const isTaken = await this.checkIfTaken({id: this.selectedCompany.id, name});
        this.errorMsgs.name = isTaken ? ['Компания с таким названием уже существует'] : [];
      }, 400);
    }
  },

  mounted() {
    this.getCompanies({forced: true});
    this.$store.dispatch('users/getUsersShortList', {});

    if (this.selectedCompany.id) this.$refs.form.validate();
    else if(!this.selectedCompany.users_manage_ids.includes(this.currentUser.id)) {
      this.selectedCompany.users_manage_ids.push(this.currentUser.id);
    }
  },
}
</script>
