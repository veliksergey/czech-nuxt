<template>
  <v-card>
    <v-toolbar dense dark color='primary'>
      <v-toolbar-title>Пользователи</v-toolbar-title>
      <v-spacer/>

      <!-- search field -->
      <v-text-field
        v-model='search'
        append-icon='mdi-magnify'
        label='Поиск'
        single-line
        hide-details
        autofocus
        clearable
      />
      <v-spacer/>

      <!-- refresh btn -->
      <v-btn icon @click='getUsers' :disabled='isLoading'>
        <v-icon>mdi-refresh</v-icon>
      </v-btn>

      <!-- add btn -->
      <v-btn icon @click='openFormDialog(null)'>
        <v-icon>mdi-plus</v-icon>
      </v-btn>

    </v-toolbar>

    <v-data-table
      :headers='headers'
      :items='users'
      class='elevation-1'
      :loading='isLoading'
      :search='search'
    >

      <!-- companies_belong -->
      <!-- ToDo: rule to have at least one company,  -->
      <!-- ToDo: same rule in back-end  -->
      <template v-slot:item.companies_belong='{item}'>
        <v-chip x-small
                v-for='company in item.companies_belong'
                :key='company.id'
                v-html='`${company.name} ${localCurrency(company.per_hour)} ${localCurrency(company.per_hour_invoice)}`'
        >
        </v-chip>
      </template>

      <!-- companies_partner -->
      <template v-slot:item.companies_partner='{item}'>
        <v-chip x-small v-for='company in item.companies_partner' :key='company.id'>
          {{company.name}} {{company.percentage}}%
        </v-chip>
      </template>

      <!-- companies_manage -->
      <template v-slot:item.companies_manage='{item}'>
        <v-chip x-small v-for='company in item.companies_manage' :key='company.id'>{{company.name}}</v-chip>
      </template>

      <!-- permissions -->
      <template v-slot:item.permissions='{item}'>
        <v-icon small v-if='item.permissions.includes("a")' color='green'>mdi-key</v-icon>
        <v-icon small v-if='item.permissions.includes("p")' color='blue'>mdi-handshake</v-icon>
        <v-icon small v-if='item.permissions.includes("0")'>mdi-account-hard-hat</v-icon>
        <v-chip x-small :color='!item.permissions.length ? "error" : ""'>{{item.permissions.length}}</v-chip>
      </template>

      <!-- created -->
      <template v-slot:item.created_at='{item}'>
        {{item.created_at | localDate}}
      </template>

      <!-- actions (edit and delete btns) -->
      <template v-slot:item.actions='{item}'>
        <v-icon @click='openFormDialog(item)'>mdi-pencil</v-icon>
        <v-icon @click='openDocumentsDialog(item)'>mdi-file-document</v-icon>
        <v-icon @click='openDeleteDialog(item)'>mdi-delete</v-icon>
      </template>

    </v-data-table>

    <!-- formDialog -->
    <UserFormDialog
      v-if='formDialog'
      :opened='formDialog'
      @close='closeFormDialog'
      />

    <!-- documentsDialog -->
    <UserDocumentsDialog
      v-if='documentsDialog'
      :opened='documentsDialog'
      @close='closeDocumentsDialog'
      />

    <!-- confirmDeleteDialog -->
    <ConfirmDeleteDialog
      v-if='deleteDialog'
      :opened='deleteDialog'
      :data='userToDelete'
      @close='closeDeleteDialog($event)'
      />
  </v-card>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
const {mapMutations, mapActions, mapGetters} = createNamespacedHelpers('users');
import UserFormDialog from '~/components/users/UserFormDialog';
import UserDocumentsDialog from '~/components/users/UserDocumentsDialog'

export default {
  name: 'UserList',
  components: {UserFormDialog, UserDocumentsDialog},
  head: () => ({
    title: 'Пользователи',
  }),
  data: () => ({
    headers: [
      {text: 'ID', value: 'id'},
      {text: 'Имя', value: 'first_name'},
      {text: 'Фамилия', value: 'last_name'},
      {text: 'Username', value: 'username'},
      {text: 'Email', value: 'email'},
      {text: 'Работает в', value: 'companies_belong'},
      {text: 'Партнёр', value: 'companies_partner'},
      {text: 'Управляет', value: 'companies_manage'},
      {text: 'Полномочий', value: 'permissions', align: 'center'},
      {text: 'Добавлен', value: 'created_at'},
      {text: '', value: 'actions', sortable: false,},
    ],
    search: '',
    formDialog: false,
    documentsDialog: false,
    deleteDialog: false,
    userToDelete: null,
  }),

  computed: {
    ...mapGetters(['users', 'isLoading', 'selectedUser']),
  },

  methods: {
    ...mapMutations(['SET_SELECTED_USER']),
    ...mapActions(['getUsers', 'deleteUser']),

    openFormDialog(user) {
      this.formDialog = true;
      !user || this.SET_SELECTED_USER(user);
    },
    closeFormDialog() {
      this.formDialog = false;
    },

    openDocumentsDialog(user) {
      this.SET_SELECTED_USER(user);
      this.documentsDialog = true;
    },
    closeDocumentsDialog() {
      this.documentsDialog = false;
    },

    openDeleteDialog(user) {
      this.deleteDialog = true;
      this.userToDelete = {
        id: user.id,
        table: [
          {key: 'Логин/Username', value: user.username},
          {key: 'Имя', value: user.first_name},
          {key: 'Фамилия', value: user.last_name},
        ],
      };
    },
    async closeDeleteDialog(toDelete) {
      if (toDelete) await this.deleteUser(this.userToDelete.id);
      this.deleteDialog = false;
      this.userToDelete = null;
    },
  },

  async mounted() {
    await this.getUsers();
  }
}
</script>

<style scoped>

</style>
