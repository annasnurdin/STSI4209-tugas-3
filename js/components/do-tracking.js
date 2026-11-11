Vue.component('do-tracking', {
  template: '#tpl-tracking',
  props: {
    tracking: {
      type: Object,
      default: function() { return {}; }
    }
  },
  data: function() {
    return {
      inputSearch: '',
      activeKeyword: '',
      inputProgress: '',
      progressError: ''
    };
  },
  computed: {
    // cari data tracking via nomor DO atau NIM
    hasilTracking: function() {
      if (!this.activeKeyword) return null;
      var q = this.activeKeyword.trim().toLowerCase();

      var keys = Object.keys(this.tracking);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var item = this.tracking[key];
        var noDO = (item.nomorDO || key).toLowerCase();
        var nim = (item.nim || '').toLowerCase();

        if (noDO === q || nim === q) {
          return item;
        }
      }

      return null;
    }
  },
  methods: {
    // cari tracking
    cariDO: function() {
      this.activeKeyword = this.inputSearch.trim();
    },

    // reset pencarian
    resetSearch: function() {
      this.inputSearch = '';
      this.activeKeyword = '';
      this.progressError = '';
    },

    // pilih DO dari daftar
    pilihDO: function(no) {
      this.inputSearch = no;
      this.activeKeyword = no;
    },

    // tambah baris progress perjalanan
    tambahProgress: function() {
      this.progressError = '';
      if (!this.inputProgress.trim()) {
        this.progressError = 'Keterangan progress tidak boleh kosong';
        return;
      }

      if (!this.hasilTracking) return;

      var now = new Date();
      var year = now.getFullYear();
      var month = String(now.getMonth() + 1).padStart(2, '0');
      var day = String(now.getDate()).padStart(2, '0');
      var hours = String(now.getHours()).padStart(2, '0');
      var mins = String(now.getMinutes()).padStart(2, '0');
      var secs = String(now.getSeconds()).padStart(2, '0');
      var waktuStr = year + '-' + month + '-' + day + ' ' + hours + ':' + mins + ':' + secs;

      if (!this.hasilTracking.perjalanan) {
        this.$set(this.hasilTracking, 'perjalanan', []);
      }

      this.hasilTracking.perjalanan.push({
        waktu: waktuStr,
        keterangan: this.inputProgress.trim()
      });

      this.$emit('progress-added');
      this.inputProgress = '';
    }
  }
});
