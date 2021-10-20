export default async function({store, redirect, route}) {
  if (!store.state.auth.currentUser || !store.state.auth.currentUser.id) {
    redirect(`/?redirect=${route.path}`);
  }
}
