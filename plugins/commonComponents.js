import Vue from 'vue';
import ConfirmDeleteDialog from '~/components/common/ConfirmDeleteDialog';
import MonthPicker from '~/components/common/MonthPicker';
import DatePicker from '~/components/common/DatePicker';

const components = {ConfirmDeleteDialog, MonthPicker, DatePicker};

Object.entries(components)
.forEach(([name, component]) => {
  Vue.component(name, component);
})
