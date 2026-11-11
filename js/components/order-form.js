Vue.component('order-form', {
  template: '#tpl-order',
  props: {
    pengirimanList: {
      type: Array,
      default: function() { return []; }
    },
    paket: {
      type: Array,
      default: function() { return []; }
    },
    tracking: {
      type: Object,
      default: function() { return {}; }
    }
  },
  data: function() {
    return {
      formDO: {
        nim: '',
        nama: '',
        ekspedisi: '',
        paketKode: '',
        tanggalKirim: '',
        total: 0
      },
      errors: {},
      successMessage: ''
    };
  },
  computed: {
    // generate nomor DO: DO[tahun]-[urutan 3 digit]
    nomorDOBaru: function() {
      var tahun = new Date().getFullYear();
      var prefix = "DO" + tahun + "-";
      var maxSeq = 0;

      var keys = Object.keys(this.tracking || {});
      keys.forEach(function(key) {
        if (key.indexOf(prefix) === 0) {
          var seq = parseInt(key.replace(prefix, ""), 10);
          if (!isNaN(seq) && seq > maxSeq) {
            maxSeq = seq;
          }
        }
      });

      var next = maxSeq + 1;
      var strSeq = next < 10 ? ("00" + next) : (next < 100 ? ("0" + next) : ("" + next));
      return prefix + strSeq;
    },

    // data paket terpilih
    selectedPaket: function() {
      var kode = this.formDO.paketKode;
      if (!kode) return null;
      return this.paket.find(function(p) { return p.kode === kode; }) || null;
    }
  },
  watch: {
    // update harga saat pilihan paket berganti
    'formDO.paketKode': function(newKode) {
      if (this.selectedPaket) {
        this.formDO.total = this.selectedPaket.harga;
      } else {
        this.formDO.total = 0;
      }
    }
  },
  created: function() {
    this.setTanggalHariIni();
  },
  methods: {
    // default tanggal hari ini (yyyy-mm-dd)
    setTanggalHariIni: function() {
      var d = new Date();
      var year = d.getFullYear();
      var month = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      this.formDO.tanggalKirim = year + '-' + month + '-' + day;
    },

    // validasi form DO
    validasi: function() {
      this.errors = {};
      if (!this.formDO.nim.trim()) this.errors.nim = 'NIM mahasiswa wajib diisi';
      if (!this.formDO.nama.trim()) this.errors.nama = 'Nama mahasiswa wajib diisi';
      if (!this.formDO.ekspedisi) this.errors.ekspedisi = 'Pilih jasa ekspedisi';
      if (!this.formDO.paketKode) this.errors.paketKode = 'Pilih paket bahan ajar';
      if (!this.formDO.tanggalKirim) this.errors.tanggalKirim = 'Tanggal kirim wajib diisi';

      return Object.keys(this.errors).length === 0;
    },

    // terbitkan DO baru
    simpanDO: function() {
      if (!this.validasi()) return;

      var noDO = this.nomorDOBaru;
      var pkt = this.selectedPaket;
      var now = new Date();
      var jam = String(now.getHours()).padStart(2, '0');
      var menit = String(now.getMinutes()).padStart(2, '0');
      var detik = String(now.getSeconds()).padStart(2, '0');
      var waktuSekarang = jam + ':' + menit + ':' + detik;

      var itemDO = {
        nomorDO: noDO,
        nim: this.formDO.nim.trim(),
        nama: this.formDO.nama.trim(),
        status: "Dalam Perjalanan",
        ekspedisi: this.formDO.ekspedisi,
        tanggalKirim: this.formDO.tanggalKirim,
        paket: this.formDO.paketKode,
        namaPaket: pkt ? pkt.nama : this.formDO.paketKode,
        total: Number(this.formDO.total),
        perjalanan: [
          {
            waktu: this.formDO.tanggalKirim + " " + waktuSekarang,
            keterangan: "Penerimaan di Loket Pengiriman: PUSLABA Universitas Terbuka"
          }
        ]
      };

      this.$emit('order-created', itemDO);

      this.successMessage = 'DO berhasil diterbitkan: ' + noDO;
      var self = this;
      setTimeout(function() {
        self.successMessage = '';
      }, 4000);

      // reset form
      this.formDO.nim = '';
      this.formDO.nama = '';
      this.formDO.ekspedisi = '';
      this.formDO.paketKode = '';
      this.setTanggalHariIni();
      this.errors = {};
    }
  }
});
