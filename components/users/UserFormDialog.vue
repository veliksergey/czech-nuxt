<template>
  <v-dialog v-model='opened' max-width='700px' persistent>
<!--    @click:outside='close'
    @keydown.esc='close'-->

    <v-form ref='form' v-model='valid' @submit.prevent='submit'>
      <v-card :loading='isLoading || !permissionTree.length || !companies.length'>

        <v-tabs centered show-arrows v-model='tab'>
          <v-tab key='info'>
            <v-icon left>mdi-information</v-icon>
            Инфо
          </v-tab>
          <v-tab key='permissions'>
            <v-icon left>mdi-security</v-icon>
            Полномочия
          </v-tab>
          <v-tab key='companies' v-if='selectedUser.permissions.includes("0")'>
            <v-icon left>mdi-domain</v-icon>
            Компании
          </v-tab>
          <v-tab key='partnership' v-if='selectedUser.permissions.includes("p")'>
            <v-icon left>mdi-handshake</v-icon>
            Партнёрство
          </v-tab>
          </v-tabs>

        <v-card-text>
          <v-tabs v-model='tab' vertical>

            <!-- info tab -->
            <v-tab-item key='info'>
              <!-- first_name -->
              <v-text-field
                v-model.trim='selectedUser.first_name'
                :rules='rules.first_name'
                label='Имя'
                counter='20'
                type='text'
                autofocus
              ></v-text-field>

              <!-- last_name -->
              <v-text-field
                v-model.trim='selectedUser.last_name'
                :rules='rules.last_name'
                label='Фамилия'
                counter='20'
                type='text'
              ></v-text-field>

              <!-- email -->
              <v-text-field
                id='email'
                v-model.trim='selectedUser.email'
                :rules='rules.email'
                :error-messages='errorMsgs.email'
                label='Email'
                type='email'
                @input='checkUnique($event, "email")'
              ></v-text-field>

              <!-- username -->
              <v-text-field
                id='username'
                v-model.trim='selectedUser.username'
                :rules='rules.username'
                :error-messages='errorMsgs.username'
                label='Логин/Username'
                type='text'
                counter='20'
                @input='checkUnique($event, "username")'
              ></v-text-field>

              <!-- password -->
              <v-text-field
                v-model='selectedUser.password'
                :rules='rules.password'
                :label='selectedUser.id ? "Пароль (если новый)" : "Пароль"'
                counter='20'
                :type='showPwd ? "text" : "password"'
                :append-icon='showPwd ? "mdi-eye" : "mdi-eye-off"'
                @click:append='showPwd = !showPwd'
              ></v-text-field>

              <!-- companies_manage -->
              <v-autocomplete
                v-model='selectedUser.companies_manage_ids'
                :items='companies'
                item-value='id'
                item-text='name'
                label='Управляет компаниями'
                multiple
                :loading='!companies.length'
                chips
                deletable-chips
                />
            </v-tab-item>

            <!-- permissions tab -->
            <v-tab-item key='permissions'>
              <v-treeview
                v-if='permissionTree.length'
                v-model='selectedUser.permissions'
                selectable
                :items='permissionTree'
              ></v-treeview>
            </v-tab-item>

            <!-- companies_belong_to tab -->
            <v-tab-item key='companies' v-if='selectedUser.permissions.includes("0")'>

              <!-- if no companies -->
              <div v-if='!selectedUser.companies_belong.length'>Компании не указаны</div>

              <div v-for='(company, counter) in selectedUser.companies_belong' :key='counter'>

                <v-card-title>
                  Компания #{{counter+1}}: {{company.name}}
                  <v-spacer/>
                  <!-- delete icon -->
                  <v-btn icon @click='REMOVE_USER_COMPANY_BELONG(counter)'>
                    <v-icon class='right' color='error'>mdi-delete</v-icon>
                  </v-btn>
                </v-card-title>

                <v-autocomplete
                  v-model='company.id'
                  :items='companies'
                  item-value='id'
                  item-text='name'
                  label='Работает в компании'
                  :loading='!companies.length'
                  :rules='rules.companyName'
                >
                </v-autocomplete>

                <v-text-field
                  v-model='company.per_hour'
                  label='За час'
                  type='number'
                ></v-text-field>

                <v-text-field
                  v-model='company.per_hour_invoice'
                  label='За час (по фактуре)'
                  type='number'
                ></v-text-field>

                <v-divider class='mt-5 mb-5' v-show='counter < selectedUser.companies_belong.length - 1'/>
              </div>
            </v-tab-item>

            <!-- partnership tab -->
            <v-tab-item key='partnership' v-if='selectedUser.permissions.includes("p")'>

              <!-- if no companies -->
              <div v-if='!selectedUser.companies_partner.length'>Компании не указаны</div>

              <div v-for='(company, counter) in selectedUser.companies_partner' :key='counter'>

                <v-card-title>
                  Компания #{{counter+1}}: {{company.name}}
                  <v-spacer/>
                  <!-- delete icon -->
                  <v-btn icon @click='REMOVE_USER_COMPANY_PARTNER(counter)'>
                    <v-icon class='right' color='error'>mdi-delete</v-icon>
                  </v-btn>
                </v-card-title>

                <v-autocomplete
                  v-model='company.id'
                  :rules='rules.companyName'
                  :items='companies'
                  item-value='id'
                  item-text='name'
                  label='Партнёр по компании'
                  :loading='!companies.length'
                >
                </v-autocomplete>

                <v-text-field
                  v-model='company.percentage'
                  :rules='rules.percentage'
                  label='Процент дохода'
                  type='number'
                ></v-text-field>

                <v-divider class='mt-5 mb-5' v-show='counter < selectedUser.companies_partner.length - 1'/>
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
            v-if='tab >= 2'
            color='accent'
            type='button'
            @click='addCompany'
          >
            <v-icon left>mdi-plus</v-icon>
            Добавить
          </v-btn>

          <!-- save btn -->
          <v-btn
            color='primary'
            type='submit'
            :disabled='isLoading'
            :loading='isLoading'>
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
const {mapMutations, mapActions, mapGetters} = createNamespacedHelpers('users');

export default {
  name: 'UserFormDialog',
  props: {
    opened: {
      type: Boolean,
      required: true,
    }
  },
  data: function () {
    return {
      valid: false,
      tab: null,
      isLoading: false,
      showPwd: false,
      permissionTree: [],
      timer: null,
      errorMsgs: { email: [], username: [], },
      rules: {
        first_name: [
          v => !!v || 'Введите имя',
          v => v.trim().length >= 2 && v.trim().length <= 20 || 'Имя должно содержать от 2ух до 20ти символов'
        ],
        last_name: [
          v => !!v || 'Введите фамилию',
          v => v.trim.length <= 20 || 'Фамилия не может быть длинее 20ти символов'
        ],
        email: [
          v => !!v || 'Это поля обязательно для заполнения',
          v => /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(v) || 'Неверный формат email',
        ],
        username: [
          v => !!v || 'Это поля обязательно для заполнения',
          v => v.trim().length >= 3 && v.trim().length <= 20 || 'Username должно содержать от 3ёх до 20ти символов'
        ],
        password: [
          v => (!!this.selectedUser.id && !v.length)
            || v.trim().length >= 5 && v.trim().length <= 20
            || 'Пароль должен содержать от 5ти до 20ти символов'
        ],
        companyName: [v => !!v || 'Укажите компанию'],
        percentage: [
          v => !!v || 'Укажите процент',
          v => v > 0 && v <= 100 || 'Процент не может быть менее нуля или более 100',
        ],
      },
    }
  },
  computed: {
    ...mapGetters(['selectedUser']),
    companies() {
      return this.$store.state.companies.companiesShort;
    },
  },

  methods: {
    ...mapMutations(['SET_SELECTED_USER', 'ADD_OR_UPDATE_USER', 'ADD_USER_COMPANY_BELONG', 'REMOVE_USER_COMPANY_BELONG', 'ADD_USER_COMPANY_PARTNER', 'REMOVE_USER_COMPANY_PARTNER']),
    ...mapActions(['saveUser', 'getPermissionTree', 'getUser', 'checkIfTaken']),
    async submit() {
      if (!this.$refs.form.validate()) return;

      await this.checkUnique(this.selectedUser.email, 'email');
      await this.checkUnique(this.selectedUser.username, 'username');
      if (this.errorMsgs.email.length || this.errorMsgs.username.length) return;

      this.isLoading = true;

      // save
      const savedUser = await this.saveUser();
      this.isLoading = false;
      if (!savedUser) return;

      this.close();
    },
    async cancel() {
      if (this.selectedUser.id) {
        const user = await this.getUser(this.selectedUser.id);
        this.ADD_OR_UPDATE_USER(user);
      }
      this.close();
    },
    close() {
      this.SET_SELECTED_USER();
      this.$refs.form.resetValidation();
      this.$emit('close');
    },
    addCompany() {
      if (this.tab === 2) this.ADD_USER_COMPANY_BELONG();
      else this.ADD_USER_COMPANY_PARTNER();
    },
    async checkUnique(text, key) {
      const element = this.$refs.form.inputs.find(i => i.id === key);
      element.validate();
      if (element && element.errorBucket.length) { // if no rule errors in element
        this.errorMsgs[key] = [];
        return;
      }

      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(async () => {
        const isTaken = await this.checkIfTaken({id: this.selectedUser.id, key, text})
        this.errorMsgs[key] = isTaken ? [`Такой ${key} уже занят`] : [];
      }, 400);
    },
  },

  mounted() {
    !this.selectedUser.id || this.$refs.form.validate();
    this.getPermissionTree().then(tree => this.permissionTree = tree);
    this.$store.dispatch('companies/getCompaniesShort', {});
  },
}
</script>

<style scoped>

</style>
