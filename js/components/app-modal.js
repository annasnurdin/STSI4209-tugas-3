// modal konfirmasi
Vue.component('app-modal', {
  template: '#tpl-modal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Konfirmasi'
    },
    message: {
      type: String,
      default: 'Apakah Anda yakin?'
    }
  }
});
