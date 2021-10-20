<template>
  <v-app dark>

    <!-- menu links-->
    <v-navigation-drawer
      v-model="drawer"
      :clipped="clipped"
      app
      v-if='currentUser'
    >
      <v-list v-if='currentUser.sections'>
        <template v-for="(item, i) in currentUser.sections">
          <v-list-item
            :key="item.id"
            :to="`/${item.key}`"
            router
            exact
          >
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title v-text="item.title" />
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>


    <v-app-bar
      :clipped-left="clipped"
      app
      dark
      color='primary'
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />

      <v-toolbar-title v-text="title" />
      <v-spacer />

      <v-btn icon to='/users/profile'>
        <v-icon>mdi-account</v-icon>
      </v-btn>
      <v-btn icon @click='logout'>
        <v-icon>mdi-exit-to-app</v-icon>
      </v-btn>

    </v-app-bar>
    <v-main>
      <v-container fluid>
        <nuxt />
      </v-container>
    </v-main>

    <Snackbar/>

  </v-app>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
const {mapActions, mapGetters} = createNamespacedHelpers('auth');
import LoadingCircle from '~/components/common/LoadingCircle';
import Snackbar from '~/components/bus/Snackbar'

export default {
  components: {LoadingCircle, Snackbar},
  middleware: 'auth',
  data () {
    return {
      clipped: false,
      drawer: true,
      title: 'Название Сайта',
      isLoading: true,
    }
  },

  computed: {
    ...mapGetters(['currentUser', 'currentTimer']),
  },

  methods: {
    ...mapActions(['autoAuth', 'logout']),
  },

  async mounted() {
    if (!this.currentUser) {
      await this.autoAuth();
    }
    this.isLoading = false;
  },
}
</script>
