// badge status stok dan pengiriman
Vue.component('status-badge', {
  template: '#tpl-status-badge',
  props: {
    type: {
      type: String,
      default: 'stock'
    },
    qty: {
      type: [Number, String],
      default: 0
    },
    safety: {
      type: [Number, String],
      default: 0
    },
    statusText: {
      type: String,
      default: ''
    }
  }
});
