// filter mata uang rupiah
Vue.filter('rupiah', function(val) {
  if (val === null || val === undefined || isNaN(val)) return 'Rp 0';
  return 'Rp ' + Number(val).toLocaleString('id-ID');
});

// filter jumlah unit
Vue.filter('buah', function(val) {
  if (val === null || val === undefined || isNaN(val)) return '0 buah';
  return Number(val) + ' buah';
});

// filter format tanggal 
Vue.filter('formatTanggal', function(val) {
  if (!val) return '-';
  var bulanIndo = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  var parts = String(val).split(' ')[0].split('-');
  if (parts.length === 3) {
    var thn = parts[0];
    var bln = parseInt(parts[1], 10) - 1;
    var tgl = parseInt(parts[2], 10);
    if (!isNaN(bln) && bln >= 0 && bln < 12 && !isNaN(tgl)) {
      return tgl + ' ' + bulanIndo[bln] + ' ' + thn;
    }
  }
  return val;
});

// root instance
var app = new Vue({
  el: '#app',
  data: {
    currentTab: 'dashboard',
    loading: true,
    upbjjList: [],
    kategoriList: [],
    pengirimanList: [],
    paket: [],
    stok: [],
    tracking: {}
  },

  watch: {
    // auto-save perubahan stok
    stok: {
      deep: true,
      handler: function(val) {
        ApiService.saveStok(val);
      }
    },

    // auto-save perubahan tracking
    tracking: {
      deep: true,
      handler: function(val) {
        ApiService.saveTracking(val);
      }
    }
  },

  created: function() {
    var self = this;
    ApiService.fetchData().then(function(data) {
      self.upbjjList = data.upbjjList || [];
      self.kategoriList = data.kategoriList || [];
      self.pengirimanList = data.pengirimanList || [];
      self.paket = data.paket || [];
      self.stok = data.stok || [];
      self.tracking = data.tracking || {};
      self.loading = false;
    });
  },

  methods: {
    // navigasi tab
    setTab: function(tabName) {
      this.currentTab = tabName;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    onStockUpdated: function() {
      ApiService.saveStok(this.stok);
    },

    onOrderCreated: function(newDO) {
      this.$set(this.tracking, newDO.nomorDO, newDO);
      ApiService.saveTracking(this.tracking);
    },

    onProgressAdded: function() {
      ApiService.saveTracking(this.tracking);
    }
  }
});
