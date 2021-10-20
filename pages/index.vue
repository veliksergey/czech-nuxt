<template>
  <v-row justify='center' class='mt-16'>
    <v-col cols='12' sm='8' md='5' lg='4'>
      <v-form ref='form' v-model='valid' @submit.prevent='submit'>
        <v-card>
          <v-card-title class='primary white--text'>Авторизация</v-card-title>
          <v-card-text>

            <v-alert type='error' dense class='mt-2' v-if='errorMsg'>
              Неправильные данные
            </v-alert>

            <!-- username/email -->
            <v-text-field
              v-model='username'
              type='text'
              label='Логин/Email'
              :rules='rules.username'
              autofocus
            ></v-text-field>

            <!-- password -->
            <v-text-field
              v-model='password'
              type='password'
              label='Пароль'
              :rules='rules.password'
              :type='showPwd ? "text" : "password"'
              :append-icon='showPwd ? "mdi-eye" : "mdi-eye-off"'
              @click:append='showPwd = !showPwd'
            ></v-text-field>

          </v-card-text>
          <v-card-actions>

            <!-- submit btn -->
            <v-btn
              type='submit'
              color='primary'
              block
              :disabled='isLoading'
              :loading='isLoading'
            >
              <v-icon left>mdi-key</v-icon>
              Войти
            </v-btn>

          </v-card-actions>
        </v-card>
      </v-form>
    </v-col>
  </v-row>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
const {mapMutations, mapActions, mapGetters} = createNamespacedHelpers('auth');


export default {
  name: 'home',
  layout: 'unlogged',
  data: () => ({
    username: '',
    password: '',
    showPwd: false,
    valid: false,
    isLoading: false,
    errorMsg: false,
    rules: {
      username: [v => !!v || 'Введите логин или email'],
      password: [v => !!v || 'Введите пароль'],
    },
  }),

  computed: {
    ...mapGetters(['currentUser']),
  },

  methods: {
    ...mapActions(['authUser', 'autoAuth']),
    async submit() {
      this.isLoading = true;
      this.errorMsg = false;

      if (!this.$refs.form.validate()) return;

      const token = await this.$recaptcha.execute('login');

      const response = await this.authUser({
        username: this.username,
        password: this.password,
        token,
      });

      // if error
      if (response.errorMsg) {
        this.errorMsg = response.errorMsg;
        this.isLoading = false;
        return;
      }

      this.isLoading = false;
    }
  },

  async mounted() {
    await this.autoAuth();
    await this.$recaptcha.init();
  },

  watch: {
    currentUser: function(user) {
      if (user && user.id) {

        let redirect = this.$route.query.redirect;
        if (!redirect) {
          redirect = user.sections && user.sections.length ? user.sections[0].key : '';
        }

        this.$router.push(redirect);
      }
    }
  },
}
</script>
