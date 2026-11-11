Vue.component('ba-stock-table', {
  template: '#tpl-stock',
  props: {
    stok: {
      type: Array,
      default: function() { return []; }
    },
    upbjjList: {
      type: Array,
      default: function() { return []; }
    },
    kategoriList: {
      type: Array,
      default: function() { return []; }
    }
  },
  data: function() {
    return {
      filterUpbjj: '',
      filterKategori: '',
      filterReorder: false,
      sortBy: 'judul',
      sortOrder: 'asc',

      isEdit: false,
      editIndex: -1,
      form: {
        kode: '',
        judul: '',
        kategori: '',
        upbjj: '',
        lokasiRak: '',
        harga: '',
        qty: '',
        safety: '',
        catatanHTML: ''
      },
      errors: {},

      hoverItem: null,

      showModalHapus: false,
      itemMauDihapus: null,
      pesanModalHapus: ''
    };
  },
  computed: {
    // filter & sortir data stok
    filteredStok: function() {
      var self = this;
      var result = this.stok.slice();

      // filter daerah
      if (this.filterUpbjj !== '') {
        result = result.filter(function(item) {
          return item.upbjj === self.filterUpbjj;
        });
      }

      // filter kategori (jika daerah dipilih)
      if (this.filterUpbjj !== '' && this.filterKategori !== '') {
        result = result.filter(function(item) {
          return item.kategori === self.filterKategori;
        });
      }

      // filter re-order (stok < safety atau stok = 0)
      if (this.filterReorder) {
        result = result.filter(function(item) {
          return Number(item.qty) < Number(item.safety) || Number(item.qty) === 0;
        });
      }

      // sortir data
      result.sort(function(a, b) {
        var keyA = a[self.sortBy];
        var keyB = b[self.sortBy];

        if (self.sortBy === 'judul') {
          var comp = String(keyA || '').localeCompare(String(keyB || ''));
          return self.sortOrder === 'asc' ? comp : -comp;
        } else {
          var numA = Number(keyA) || 0;
          var numB = Number(keyB) || 0;
          return self.sortOrder === 'asc' ? numA - numB : numB - numA;
        }
      });

      return result;
    },

    // daftar kategori sesuai daerah yang dipilih
    kategoriTersedia: function() {
      if (!this.filterUpbjj) return this.kategoriList;

      var self = this;
      var set = {};
      this.stok.forEach(function(item) {
        if (item.upbjj === self.filterUpbjj && item.kategori) {
          set[item.kategori] = true;
        }
      });

      var arr = Object.keys(set);
      return arr.length > 0 ? arr : this.kategoriList;
    }
  },
  watch: {
    // reset filter kategori saat daerah berubah
    filterUpbjj: function() {
      this.filterKategori = '';
    }
  },
  methods: {
    // validasi form stok
    validasi: function() {
      this.errors = {};
      if (!this.form.kode || !this.form.kode.trim()) this.errors.kode = 'Kode MK wajib diisi';
      if (!this.form.judul || !this.form.judul.trim()) this.errors.judul = 'Nama MK wajib diisi';
      if (!this.form.kategori) this.errors.kategori = 'Pilih kategori mata kuliah';
      if (!this.form.upbjj) this.errors.upbjj = 'Pilih UT-Daerah';
      if (!this.form.lokasiRak || !this.form.lokasiRak.trim()) this.errors.lokasiRak = 'Lokasi rak wajib diisi';
      if (this.form.harga === '' || Number(this.form.harga) <= 0) this.errors.harga = 'Harga harus lebih dari 0';
      if (this.form.qty === '' || Number(this.form.qty) < 0) this.errors.qty = 'Jumlah stok minimal 0';
      if (this.form.safety === '' || Number(this.form.safety) < 0) this.errors.safety = 'Safety stock minimal 0';

      return Object.keys(this.errors).length === 0;
    },

    // simpan data baru atau update data lama
    simpanStok: function() {
      if (!this.validasi()) return;

      var payload = {
        kode: this.form.kode.toUpperCase().trim(),
        judul: this.form.judul.trim(),
        kategori: this.form.kategori,
        upbjj: this.form.upbjj,
        lokasiRak: this.form.lokasiRak.toUpperCase().trim(),
        harga: Number(this.form.harga),
        qty: Number(this.form.qty),
        safety: Number(this.form.safety),
        catatanHTML: this.form.catatanHTML.trim() || '-'
      };

      if (this.isEdit && this.editIndex >= 0) {
        this.$set(this.stok, this.editIndex, payload);
      } else {
        var ada = this.stok.some(function(s) { return s.kode === payload.kode; });
        if (ada) {
          this.errors.kode = 'Kode MK sudah terdaftar dalam stok!';
          return;
        }
        this.stok.push(payload);
      }

      this.$emit('stock-updated');
      this.batalEdit();
    },

    // isi form untuk edit
    mulaiEdit: function(item) {
      var idx = this.stok.indexOf(item);
      if (idx === -1) return;

      this.isEdit = true;
      this.editIndex = idx;
      this.form = Object.assign({}, item);
      this.errors = {};
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // batalkan edit
    batalEdit: function() {
      this.isEdit = false;
      this.editIndex = -1;
      this.form = {
        kode: '',
        judul: '',
        kategori: '',
        upbjj: '',
        lokasiRak: '',
        harga: '',
        qty: '',
        safety: '',
        catatanHTML: ''
      };
      this.errors = {};
    },

    // buka modal konfirmasi hapus
    konfirmasiHapus: function(item) {
      this.itemMauDihapus = item;
      this.pesanModalHapus = 'Apakah Anda yakin ingin menghapus data bahan ajar "' + item.kode + ' - ' + item.judul + '"?';
      this.showModalHapus = true;
    },

    // eksekusi hapus baris
    eksekusiHapus: function() {
      if (this.itemMauDihapus) {
        var idx = this.stok.indexOf(this.itemMauDihapus);
        if (idx !== -1) {
          this.stok.splice(idx, 1);
          if (this.isEdit && this.editIndex === idx) {
            this.batalEdit();
          }
          this.$emit('stock-updated');
        }
      }
      this.showModalHapus = false;
      this.itemMauDihapus = null;
    },

    // batal hapus
    batalHapus: function() {
      this.showModalHapus = false;
      this.itemMauDihapus = null;
    },

    // reset nilai filter
    resetFilter: function() {
      this.filterUpbjj = '';
      this.filterKategori = '';
      this.filterReorder = false;
      this.sortBy = 'judul';
      this.sortOrder = 'asc';
    }
  }
});
