import Vue from 'vue'
import VueGapi from "vue-gapi";

Vue.use(VueGapi, {
  clientId: '____.apps.googleusercontent.com',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
  scope: 'https://www.googleapis.com/auth/drive',
});
