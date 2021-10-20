import Vue from 'vue';

Vue.filter('localDate', (value, includeTime=false, excludeDay=false) => localDate(value, includeTime, excludeDay));
Vue.filter('localCurrency', (value) => localCurrency(value));
Vue.filter('localNumber', (value, decimals) => localNumber(value, decimals));
Vue.mixin({
  methods: {
    localDate(value, includeTime=false, excludeDay=false) {return localDate(value, includeTime, excludeDay)},
    localCurrency(value) {return localCurrency(value)},
    localNumber(value, decimals) {return localNumber(value, decimals)},
  },
});


const localDate = (value, includeTime, excludeDay) => {
  if (!value) return '';

  const date = new Date(value);
  const convertedDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());

  const options = {
    month: 'short',
    year: 'numeric',
  };
  if (!excludeDay) options.day = '2-digit';

  return convertedDate.toLocaleString(['ru-RU'], options)
}
const localCurrency = (value) => localNumber(value); // &euro; // &#75;&#269;
const localNumber = (value, decimals=2) => {
  if (!value) return '';
  return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
