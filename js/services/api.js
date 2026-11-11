var ApiService = {
  // ambil data json & sync localstorage
  fetchData: function() {
    return fetch('data/dataBahanAjar.json')
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        var savedStok = localStorage.getItem('sitta_stok_data');
        if (savedStok) {
          data.stok = JSON.parse(savedStok);
        }

        var savedTracking = localStorage.getItem('sitta_tracking_data');
        if (savedTracking) {
          data.tracking = JSON.parse(savedTracking);
        }

        return data;
      });
  },

  // simpan stok ke localstorage
  saveStok: function(stok) {
    localStorage.setItem('sitta_stok_data', JSON.stringify(stok));
  },

  // simpan tracking ke localstorage
  saveTracking: function(tracking) {
    localStorage.setItem('sitta_tracking_data', JSON.stringify(tracking));
  }
};
