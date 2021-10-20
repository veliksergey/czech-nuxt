<template>
  <v-dialog
    v-model='opened'
    max-width='700px'
    @click:outside='close'
    @keydown.esc='close'
  >

    <v-card :loading='isUploading || isLoading'>
      <v-card-title>
        Документы для
        {{selectedUser.username}}
        ({{selectedUser.first_name}} {{selectedUser.last_name}})
      </v-card-title>
      <v-card-text v-if='!gSignedIn'>
        Необходимо привязать ваш Google Account к Google Drive где хранятся документы пользователей.
        <br>
        Доступ к этим данным предоставляет администратор в приложении
        <a href='https://drive.google.com/' target='_blank'>Google Drive</a>.
      </v-card-text>
      <v-card-text v-if='gSignedIn'>

        <!-- file list -->
        <v-list>
          <v-list-item v-if='!isLoading && !fileList.length'>
            <span class='secondary--text'>
              Данный пользователь не имеет загруженных файлов
            </span>
          </v-list-item>
          <v-list-item
            v-for='file in fileList'
            :key='file.id'
            >
            <v-list-item-title>
              {{file.name}}
            </v-list-item-title>
            <!-- view btn -->
            <v-btn icon :href='file.webViewLink' target='_blank'>
              <v-icon>mdi-open-in-new</v-icon>
            </v-btn>
            <!-- download btn -->
            <v-btn icon :href='file.webContentLink'>
              <v-icon>mdi-download</v-icon>
            </v-btn>
            <v-btn icon @click='openDeleteDialog(file)' color='error'>
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item>
        </v-list>

        <v-form ref='form' @submit.prevent='uploadFile'>
          <!-- file input -->
          <v-file-input
            id='fileToUpload'
            ref='fileToUpload'
            v-model='file'
            label='Файл для загрузки'
            :disabled='isUploading'
          />
          <!-- fileName input -->
          <v-text-field
            label='Название файла'
            v-model='fileName'
            required
            :disabled='isUploading'
          />
          <!-- upload btn -->
          <v-btn
            type='submit'
            color='primary'
            block
            :disabled='isUploading'
            :loading='isUploading'
          >
            <v-icon left>mdi-upload</v-icon>
            Загрузить
          </v-btn>
        </v-form>

      </v-card-text>
      <v-card-actions>

        <!-- gUser info -->
        <div v-if='gSignedIn && gUser'>
          <!-- gAvatar -->
          <v-avatar size='32'>
            <img :src='gUser.imageUrl'/>
          </v-avatar>
          <span class='button'>{{gUser.fullName}}</span>
        </div>
        <v-spacer/>

        <!-- login btn -->
        <v-btn
          @click='login'
          type='button'
          v-if='!gSignedIn'
          color='primary'
          >
          <v-icon left>mdi-google-drive</v-icon>
          Привязать
        </v-btn>

        <!-- logout btn -->
        <v-btn
          @click='logout'
          type='button'
          v-if='gSignedIn'
          small
          >
          <v-icon left>mdi-google-drive</v-icon>
          Отвязать
        </v-btn>

      </v-card-actions>

      <!-- deleteDialog -->
      <ConfirmDeleteDialog
        v-if='deleteDialog'
        :opened='deleteDialog'
        :data='fileToDelete'
        @close='closeDeleteDialog($event)'
        />
    </v-card>

  </v-dialog>
</template>

<script>
import {createNamespacedHelpers} from 'vuex';
const {mapMutations, mapActions, mapGetters} = createNamespacedHelpers('users');

export default {
  name: 'UserDocumentsDialog',
  props: {
    opened: {
      type: Boolean,
      required: true,
    }
  },
  data() {
    return {
      drive: null,
      FOLDER_ID: this.$config.G_FOLDER_ID,
      gSignedIn: null,
      gUser: null,
      file: null,
      fileName: null,
      isUploading: false,
      isLoading: false,
      fileList: [],
      deleteDialog: false,
      fileToDelete: null,
    }
  },
  computed: {
    ...mapGetters(['selectedUser']),
  },

  methods: {
    ...mapMutations(['SET_SELECTED_USER']),
    close() {
      this.SET_SELECTED_USER();
      this.$emit('close');
    },
    async login() {
      try {
        await this.$gapi.login();
        await this.loadFiles();
      } catch (e) {
        console.error(e);
      }
    },
    async logout() {
      await this.$gapi.logout();
      this.fileList = [];
    },
    filePreName() {
      // return `${this.selectedUser.id}_${this.selectedUser.username}_`;
      return `${this.selectedUser.username}_`;
    },
    async uploadFile() {
      this.isUploading = true;
      const fileExtension = this.file.name.substring(this.file.name.lastIndexOf('.'), this.file.name.length);
      const fileName = this.fileName ? `${this.fileName}${fileExtension}` : this.file.name;
      const metadata = {
        name: `${this.filePreName()}${fileName}`,
        mimeType: this.file.type,
        parents: [this.FOLDER_ID],
        properties: {
          webUserId: this.selectedUser.id,
        }
      };
      const accessToken = (await (await this.$gapi.getGapiClient('auth')).auth.getToken()).access_token;

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
      form.append('file', this.file);

      try {
        const result = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,kind', {
          method: 'POST',
          headers: new Headers({'Authorization': 'Bearer ' + accessToken}),
          body: form
        });

        this.file = null;
        this.fileName = null;
        this.isUploading = false;
        await this.loadFiles();

      } catch (e) {
        console.error(e);
        this.isUploading = false;
      }
    },
    async loadFiles() {
      if (!this.gSignedIn) return;

      this.isLoading = true;
      try {

        const response = await this.drive.files.list({
          fields: "nextPageToken, files(id, name, webViewLink, webContentLink, properties)", // webContentLink
          spaces: "drive",
          // q: `parents='${this.FOLDER_ID}' and trashed=false and name contains '${this.filePreName()}'`,
          // query: shared folder + not deleted + files with property webUserId = selectedUser.id
          q: `parents='${this.FOLDER_ID}' and trashed=false and properties has {key='webUserId' and value='${this.selectedUser.id}'}`,
        });
        this.fileList = response.result.files;
        this.isLoading = false;

      } catch (e) {
        console.error(e);
        this.isLoading = false;
      }
    },
    openDeleteDialog(file) {
      this.deleteDialog = true;
      this.fileToDelete = {
        id: file.id,
        table: [
          {key: 'Файл', value: file.name},
        ],
      };
    },
    async closeDeleteDialog(toDelete) {
      try {
        if (toDelete) {
          this.isLoading = true;
          const response = await this.drive.files.delete({
            fileId: this.fileToDelete.id,
          });
          await this.loadFiles();
        }
        this.deleteDialog = false;
        this.fileToDelete = null;
      } catch (e) {
        console.error(e);
        alert('У вас нет доступа к удалению данного файла на сайте. Но это можно сделать в приложении Google Drive.');
      }
      this.isLoading = false;
    },

  },

  async created() {
    this.$gapi.listenUserSignIn(gSignedIn => {
      this.gSignedIn = gSignedIn;
      this.gUser = this.$gapi.getUserData();
      this.loadFiles();
    });
    this.drive = (await this.$gapi.getGapiClient('drive')).client.drive;
  },
}
</script>

<style scoped>

</style>
