<template>
<div>
  <v-form ref='form' v-model='valid' @submit.prevent='submit'>
    <v-card>
      <v-card-title class='primary white--text'>Мой профиль</v-card-title>
      <v-card-text v-if='user'>

        <!-- username -->
        <v-text-field
          disabled
          :value='user.username'
          label='Логин/Username'
          ></v-text-field>

        <!-- email -->
        <v-text-field
          disabled
          :value='user.email'
          label='Email'
          ></v-text-field>

        <!-- first_name -->
        <v-text-field
          disabled
          :value='user.first_name'
          label='Имя'
          ></v-text-field>

        <!-- last_name -->
        <v-text-field
          disabled
          :value='user.last_name'
          label='Фамилия'
          ></v-text-field>

        <!-- ToDo: permissions -->

        <!-- password -->
        <v-text-field
          v-model='user.password'
          :rules='rules.password'
          label='Пароль (если новый)'
          counter='20'
          :type='showPwd ? "text" : "password"'
          :append-icon='showPwd ? "mdi-eye" : "mdi-eye-off"'
          @click:append='showPwd = !showPwd'
          ></v-text-field>

      </v-card-text>
      <v-card-actions>

        <!-- submit btn -->
        <v-btn
          block
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
</div>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
const {mapMutations, mapActions, mapGetters} = createNamespacedHelpers('users');

export default {
  name: 'profile',
  head: () => ({
    title: 'Мой профиль',
  }),
  data: () => ({
    user: null,
    showPwd: false,
    valid: false,
    isLoading: false,
    rules: {
      password: [
        v => !v
          || v.trim().length >= 5 && v.trim().length <= 20
          || 'Пароль должен содержать от 5ти до 20ти символов'
      ],
    }
  }),

  computed: {
    currentUser() {
      return this.$store.state.auth.currentUser;
    },
  },

  methods: {
    ...mapActions(['getProfile', 'updateProfile']),
    async getProfileInfo() {
      const user = await this.getProfile(this.currentUser.id);

      user.password = '';

      this.user = user;
    },
    async submit() {
      if (!this.$refs.form.validate()) {
        return;
      }

      this.isLoading = true;
      this.$nuxt.$emit('snackbar-close');

      // update
      const updatedUser = await this.updateProfile(this.user);

      this.isLoading = false;
      this.$nuxt.$emit('snackbar-open', {
        text: updatedUser.errorMsg ? updatedUser.errorMsg : 'Сохранено',
        color: updatedUser.errorMsg ? 'error' : 'success',
      });

    },
  },

  async mounted() {
    await this.getProfileInfo();
  },
}
</script>

<style scoped>

</style>
