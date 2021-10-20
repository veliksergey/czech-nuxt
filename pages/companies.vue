<template>
  <v-card>
    <v-toolbar dense dark color='primary'>
      <v-toolbar-title>Компании</v-toolbar-title>
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
      <v-btn icon @click='getCompanies({forced: true})' :disabled='!companies.length'>
        <v-icon>mdi-refresh</v-icon>
      </v-btn>

      <!-- add btn -->
      <v-btn icon @click='openFormDialog(null)'>
        <v-icon>mdi-plus</v-icon>
      </v-btn>

    </v-toolbar>

    <v-data-table
      :headers='headers'
      :items='companies'
      class='elevation-1'
      :loading='!companies.length'
      :search='search'
      >

      <!-- users_belong -->
      <template v-slot:item.users_belong='{item}'>
        <v-chip x-small
                v-for='user in item.users_belong'
                :key='user.id'
                v-html='`${user.username} ${localCurrency(user.per_hour)} ${localCurrency(user.per_hour_invoice)}`'
        >
        </v-chip>
      </template>

      <!-- users_partner -->
      <template v-slot:item.users_partner='{item}'>
        <v-chip x-small v-for='user in item.users_partner' :key='user.id'>
          {{user.username}} {{user.percentage}}%
        </v-chip>
      </template>

      <!-- users_manage -->
      <template v-slot:item.users_manage='{item}'>
        <v-chip x-small v-for='user in item.users_manage' :key='user.id'>{{user.username}}</v-chip>
      </template>

      <!-- actions -->
      <template v-slot:item.actions='{item}'>
        <v-icon @click='openFormDialog(item)'>mdi-pencil</v-icon>
        <v-icon @click='openDeleteDialog(item)'>mdi-delete</v-icon>
      </template>

    </v-data-table>

    <!-- formDialog -->
    <CompanyFormDialog
      v-if='formDialog'
      :opened='formDialog'
      @close='closeFormDialog'
      />

    <!-- deleteDialog -->
    <ConfirmDeleteDialog
      v-if='deleteDialog'
      :opened='deleteDialog'
      :data='companyToDelete'
      @close='closeDeleteDialog($event)'
      />

  </v-card>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
const {mapMutations, mapActions, mapGetters} = createNamespacedHelpers('companies');
import CompanyFormDialog from '~/components/companies/CompanyFormDialog';

export default {
  name: 'CompanyList',
  components: {CompanyFormDialog},
  head: () => ({
    title: 'Компании',
  }),
  data: () => ({
    headers: [
      {text: 'ID', value: 'id',},
      {text: 'Название', value: 'name',},
      {text: 'Работают', value: 'users_belong',},
      {text: 'Управляют', value: 'users_manage',},
      {text: 'Партнёры', value: 'users_partner',},
      {text: '', value: 'actions', sortable: false,},
    ],
    search: '',
    formDialog: false,
    deleteDialog: false,
    companyToDelete: null,
  }),
  computed: {
    ...mapGetters(['companies', 'selectedCompany']),
  },

  methods: {
    ...mapMutations(['SET_SELECTED_COMPANY']),
    ...mapActions(['getCompanies', 'deleteCompany']),
    openFormDialog(company) {
      this.formDialog = true;
      !company || this.SET_SELECTED_COMPANY(company);
    },
    closeFormDialog() {
      this.formDialog = false;
    },
    openDeleteDialog(company) {
      this.deleteDialog = true;
      this.companyToDelete = {
        id: company.id,
        table: [
          {key: 'Название', value: company.name},
        ],
      };
    },
    async closeDeleteDialog(toDelete) {
      if (toDelete) await this.deleteCompany(this.companyToDelete.id);
      this.deleteDialog = false;
      this.companyToDelete = null;
    },
  },

  mounted() {
    this.getCompanies({forced: true});
  }
}
</script>

<style scoped>

</style>
