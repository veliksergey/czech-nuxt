import colors from 'vuetify/es5/util/colors'
import ru from 'vuetify/es5/locale/ru';
import path from 'path';
import fs from 'fs';

export default {

  publicRuntimeConfig: {
    G_FOLDER_ID: process.env.G_FOLDER_ID,
    // G_CLIENT_ID: process.env.G_CLIENT_ID,
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s | WebsiteName',
    title: 'Office',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~plugins/axios',
    '~plugins/filters',
    '~plugins/commonComponents',
    {src: '~plugins/gapi', mode: 'client'}
    // '~plugins/gapi',
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    '@nuxtjs/recaptcha',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    baseUrl: process.env.AXIOS_URL,
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en',
      name: 'Office',
      short_name: 'Office',
    },
    icon: {
      fileName: 'office_icon.png'
    },
  },

  recaptcha: {
    hideBadge: true,
    language: 'ru',
    siteKey: process.env.RECAPTCHA_SITE_KEY,
    version: 3,
    // size: 'normal',
  },



  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    // theme: {
    //   dark: true,
    //   themes: {
    //     dark: {
    //       primary: colors.blue.darken2,
    //       accent: colors.grey.darken3,
    //       secondary: colors.amber.darken3,
    //       info: colors.teal.lighten1,
    //       warning: colors.amber.base,
    //       error: colors.deepOrange.accent4,
    //       success: colors.green.accent3
    //     }
    //   },
    // },
    lang: {
      locales: {ru},
      current: 'ru'
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  },

  server: {
    port: 3003,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '/certs/____.key')),
      cert: fs.readFileSync(path.resolve(__dirname, '/certs/____.cer')),
    }
  },
}
