export default function({$axios, redirect }) {
  $axios.onRequest(config => {

    // close snackbar (in case it's open)
    $nuxt.$emit('snackbar-close');

    const localUser = JSON.parse(localStorage.getItem('currentUser'));
    if (localUser && localUser.token) {
      config.headers['Authorization'] = 'Bearer ' + localUser.token;
    }

    return config;
  });

  $axios.onError(err => {
    console.error(err);

    const { response: { data: {errorMsg}  } } = err;

    $nuxt.$emit('snackbar-open', {
      text: errorMsg || 'Произошла ошибка на сервере..',
      color: 'error',
    })
  })
}
