/**
 * Japanese stroke order data and handwriting accuracy evaluation engine.
 * Contains start coordinates (x%, y%), direction hints, and step descriptions.
 */

export const STROKE_ORDER_DATA = {
  // Hiragana (46 Seion)
  'あ': [
    { n: 1, x: 29, y: 37, dir: '→', tip: 'Garis mendatar dari kiri ke kanan' },
    { n: 2, x: 46, y: 30, dir: '↓', tip: 'Garis vertikal melengkung tembus tengah' },
    { n: 3, x: 38, y: 39, dir: '↷', tip: 'Mulai tengah, melingkar ke bawah membulat ke kanan' }
  ],
  'い': [
    { n: 1, x: 30, y: 35, dir: '↓', tip: 'Garis kiri melengkung turun dengan kail halus' },
    { n: 2, x: 65, y: 40, dir: '↓', tip: 'Garis kanan sedikit lebih pendek' }
  ],
  'う': [
    { n: 1, x: 46, y: 32, dir: '↘', tip: 'Garis titik miring pendek di bagian atas' },
    { n: 2, x: 35, y: 47, dir: '↷', tip: 'Lengkungan membulat besar menghadap ke kiri' }
  ],
  'え': [
    { n: 1, x: 46, y: 32, dir: '↘', tip: 'Goresan titik miring di bagian atas' },
    { n: 2, x: 31, y: 47, dir: '→', tip: 'Zig-zag horizontal lalu gelombang dasar ke kanan' }
  ],
  'お': [
    { n: 1, x: 28, y: 41, dir: '→', tip: 'Garis mendatar pendek' },
    { n: 2, x: 43, y: 29, dir: '↓', tip: 'Garis vertikal turun membulat ke kanan' },
    { n: 3, x: 68, y: 39, dir: '↘', tip: 'Titik di sebelah kanan atas' }
  ],
  'か': [
    { n: 1, x: 26, y: 44, dir: '↷', tip: 'Garis horizontal melengkung turun dengan kail' },
    { n: 2, x: 44, y: 30, dir: '↙', tip: 'Garis melintang diagonal dari atas ke kiri' },
    { n: 3, x: 66, y: 38, dir: '↘', tip: 'Titik miring di kanan atas' }
  ],
  'き': [
    { n: 1, x: 32, y: 37, dir: '↗', tip: 'Garis mendatar pertama' },
    { n: 2, x: 30, y: 49, dir: '↗', tip: 'Garis mendatar kedua sedikit lebih panjang' },
    { n: 3, x: 52, y: 30, dir: '↘', tip: 'Garis diagonal menembus dengan kail' },
    { n: 4, x: 34, y: 74, dir: '↷', tip: 'Lengkungan senyum di bawah' }
  ],
  'く': [
    { n: 1, x: 58, y: 29, dir: '↙', tip: 'Sudut melipat dari kanan atas ke tengah lalu ke kanan bawah' }
  ],
  'け': [
    { n: 1, x: 31, y: 31, dir: '↓', tip: 'Garis vertikal kiri berujung kail' },
    { n: 2, x: 46, y: 44, dir: '→', tip: 'Garis mendatar pendek di kanan' },
    { n: 3, x: 64, y: 30, dir: '↓', tip: 'Garis vertikal melengkung tembus ke bawah' }
  ],
  'こ': [
    { n: 1, x: 35, y: 36, dir: '→', tip: 'Garis atas mendatar dengan kait halus di ujung' },
    { n: 2, x: 32, y: 68, dir: '→', tip: 'Lengkungan bawah mendatar melengkung ke atas' }
  ],
  'さ': [
    { n: 1, x: 30, y: 40, dir: '↗', tip: 'Garis mendatar sedikit naik ke kanan' },
    { n: 2, x: 53, y: 30, dir: '↘', tip: 'Garis diagonal tembus dengan kail' },
    { n: 3, x: 36, y: 72, dir: '↷', tip: 'Lengkungan senyum di bawah' }
  ],
  'し': [
    { n: 1, x: 38, y: 30, dir: '↓', tip: 'Tarik vertikal dari atas lalu melengkung naik seperti kail' }
  ],
  'す': [
    { n: 1, x: 26, y: 39, dir: '→', tip: 'Garis mendatar panjang' },
    { n: 2, x: 54, y: 30, dir: '↓', tip: 'Garis vertikal tembus dengan loop memutar di tengah' }
  ],
  'せ': [
    { n: 1, x: 23, y: 48, dir: '→', tip: 'Garis mendatar utama' },
    { n: 2, x: 63, y: 31, dir: '↓', tip: 'Garis vertikal kanan berbelok ke kiri bawah' },
    { n: 3, x: 39, y: 33, dir: '↓', tip: 'Garis vertikal kiri berujung kail ke kanan' }
  ],
  'そ': [
    { n: 1, x: 37, y: 33, dir: '→', tip: 'Goresan zig-zag dari atas lalu melengkung ke kanan bawah' }
  ],
  'た': [
    { n: 1, x: 27, y: 41, dir: '→', tip: 'Garis mendatar pendek' },
    { n: 2, x: 42, y: 30, dir: '↙', tip: 'Garis miring menembus ke kiri bawah' },
    { n: 3, x: 56, y: 48, dir: '→', tip: 'Garis atas di bagian kanan (mirip ko)' },
    { n: 4, x: 51, y: 63, dir: '→', tip: 'Lengkung bawah di bagian kanan' }
  ],
  'ち': [
    { n: 1, x: 28, y: 39, dir: '→', tip: 'Garis mendatar pendek' },
    { n: 2, x: 43, y: 30, dir: '↓', tip: 'Garis miring diagonal lalu membulat besar ke kiri bawah' }
  ],
  'つ': [
    { n: 1, x: 31, y: 45, dir: '↷', tip: 'Tarik mendatar lalu melengkung membulat besar seperti gelombang' }
  ],
  'て': [
    { n: 1, x: 28, y: 38, dir: '→', tip: 'Garis mendatar lalu melengkung setengah lingkaran ke kiri bawah' }
  ],
  'と': [
    { n: 1, x: 37, y: 31, dir: '↘', tip: 'Garis miring pendek ke kanan bawah' },
    { n: 2, x: 56, y: 44, dir: '↷', tip: 'Lengkungan membulat besar ke arah bawah' }
  ],
  'な': [
    { n: 1, x: 27, y: 40, dir: '→', tip: 'Garis mendatar pendek' },
    { n: 2, x: 44, y: 29, dir: '↙', tip: 'Garis miring menembus ke bawah' },
    { n: 3, x: 62, y: 38, dir: '↘', tip: 'Titik miring di kanan atas' },
    { n: 4, x: 58, y: 52, dir: '↓', tip: 'Garis lengkung dengan loop di bawah' }
  ],
  'に': [
    { n: 1, x: 32, y: 32, dir: '↓', tip: 'Garis vertikal kiri berujung kail' },
    { n: 2, x: 51, y: 38, dir: '→', tip: 'Garis mendatar atas di kanan' },
    { n: 3, x: 47, y: 63, dir: '→', tip: 'Garis mendatar bawah di kanan' }
  ],
  'ぬ': [
    { n: 1, x: 31, y: 36, dir: '↙', tip: 'Garis miring dari kanan atas ke kiri bawah' },
    { n: 2, x: 31, y: 43, dir: '↷', tip: 'Garis lengkung besar dengan loop simpul di kanan bawah' }
  ],
  'ね': [
    { n: 1, x: 39, y: 30, dir: '↓', tip: 'Garis vertikal lurus di sebelah kiri' },
    { n: 2, x: 26, y: 41, dir: '→', tip: 'Garis zig-zag melengkung memutar dengan simpul kanan' }
  ],
  'の': [
    { n: 1, x: 50, y: 35, dir: '↙', tip: 'Mulai tengah miring ke kiri bawah lalu melingkar besar ke atas dan kanan' }
  ],
  'は': [
    { n: 1, x: 31, y: 31, dir: '↓', tip: 'Garis vertikal kiri berujung kail' },
    { n: 2, x: 46, y: 42, dir: '→', tip: 'Garis mendatar di kanan' },
    { n: 3, x: 62, y: 31, dir: '↓', tip: 'Garis vertikal tembus dengan loop simpul membulat' }
  ],
  'ひ': [
    { n: 1, x: 28, y: 38, dir: '→', tip: 'Tarik mendatar pendek, turun membulat ke bawah, lalu naik dan turun' }
  ],
  'ふ': [
    { n: 1, x: 45, y: 32, dir: '↘', tip: 'Titik miring di atas' },
    { n: 2, x: 49, y: 36, dir: '↷', tip: 'Garis lengkung tengah berbentuk kail' },
    { n: 3, x: 35, y: 64, dir: '↙', tip: 'Titik miring di kiri' },
    { n: 4, x: 66, y: 55, dir: '↘', tip: 'Titik miring di kanan' }
  ],
  'へ': [
    { n: 1, x: 26, y: 60, dir: '↗', tip: 'Naik miring pendek ke kanan lalu turun panjang ke kanan bawah' }
  ],
  'ほ': [
    { n: 1, x: 32, y: 31, dir: '↓', tip: 'Garis vertikal kiri berujung kail' },
    { n: 2, x: 46, y: 35, dir: '→', tip: 'Garis mendatar atas di kanan' },
    { n: 3, x: 45, y: 49, dir: '→', tip: 'Garis mendatar kedua di kanan' },
    { n: 4, x: 62, y: 35, dir: '↓', tip: 'Garis vertikal turun dengan simpul membulat' }
  ],
  'ま': [
    { n: 1, x: 32, y: 37, dir: '→', tip: 'Garis mendatar atas' },
    { n: 2, x: 32, y: 50, dir: '→', tip: 'Garis mendatar kedua sedikit lebih pendek' },
    { n: 3, x: 51, y: 30, dir: '↓', tip: 'Garis vertikal tembus dengan loop simpul di bawah' }
  ],
  'み': [
    { n: 1, x: 34, y: 34, dir: '→', tip: 'Tarik mendatar miring ke kiri bawah, buat simpul lalu tarik ke kanan' },
    { n: 2, x: 68, y: 46, dir: '↙', tip: 'Garis miring melengkung di kanan' }
  ],
  'む': [
    { n: 1, x: 26, y: 38, dir: '→', tip: 'Garis mendatar pendek' },
    { n: 2, x: 40, y: 30, dir: '↓', tip: 'Garis vertikal turun buat simpul lalu melengkung naik' },
    { n: 3, x: 65, y: 39, dir: '↘', tip: 'Titik di kanan atas' }
  ],
  'め': [
    { n: 1, x: 34, y: 34, dir: '↙', tip: 'Garis miring dari kanan atas ke kiri bawah' },
    { n: 2, x: 33, y: 37, dir: '↷', tip: 'Mulai kiri melingkar membulat ke kanan tembus' }
  ],
  'も': [
    { n: 1, x: 45, y: 30, dir: '↓', tip: 'Garis vertikal lurus turun membelok ke kanan atas' },
    { n: 2, x: 28, y: 40, dir: '→', tip: 'Garis mendatar pertama' },
    { n: 3, x: 28, y: 56, dir: '→', tip: 'Garis mendatar kedua' }
  ],
  'や': [
    { n: 1, x: 34, y: 40, dir: '↷', tip: 'Lengkung kait mendatar lalu turun melengkung' },
    { n: 2, x: 46, y: 30, dir: '↘', tip: 'Titik miring pendek di kiri atas' },
    { n: 3, x: 54, y: 35, dir: '↙', tip: 'Garis lurus miring memotong' }
  ],
  'ゆ': [
    { n: 1, x: 33, y: 34, dir: '↓', tip: 'Garis vertikal turun membulat ke kanan atas' },
    { n: 2, x: 54, y: 30, dir: '↓', tip: 'Garis vertikal lurus memotong ke bawah' }
  ],
  'よ': [
    { n: 1, x: 30, y: 34, dir: '→', tip: 'Garis mendatar pendek' },
    { n: 2, x: 50, y: 30, dir: '↓', tip: 'Garis vertikal turun dengan simpul ke kiri lalu mendatar' }
  ],
  'ら': [
    { n: 1, x: 46, y: 32, dir: '↘', tip: 'Titik miring pendek di atas' },
    { n: 2, x: 36, y: 44, dir: '↷', tip: 'Garis vertikal turun lalu melengkung membulat' }
  ],
  'り': [
    { n: 1, x: 37, y: 30, dir: '↓', tip: 'Garis kiri pendek dengan kail halus' },
    { n: 2, x: 58, y: 34, dir: '↓', tip: 'Garis kanan panjang turun melengkung' }
  ],
  'る': [
    { n: 1, x: 35, y: 34, dir: '→', tip: 'Tarik mendatar, miring ke kiri bawah, melingkar membulat dengan loop simpul di ujung' }
  ],
  'れ': [
    { n: 1, x: 39, y: 30, dir: '↓', tip: 'Garis vertikal lurus di sebelah kiri' },
    { n: 2, x: 26, y: 42, dir: '→', tip: 'Zig-zag horizontal lalu gelombang melengkung ke kanan luar' }
  ],
  'ろ': [
    { n: 1, x: 35, y: 34, dir: '→', tip: 'Tarik mendatar, miring ke kiri bawah, melingkar membulat tanpa simpul di ujung' }
  ],
  'わ': [
    { n: 1, x: 39, y: 30, dir: '↓', tip: 'Garis vertikal lurus di sebelah kiri' },
    { n: 2, x: 26, y: 42, dir: '→', tip: 'Zig-zag mendatar lalu melingkar membulat ke kanan' }
  ],
  'を': [
    { n: 1, x: 28, y: 37, dir: '→', tip: 'Garis mendatar atas' },
    { n: 2, x: 44, y: 29, dir: '↙', tip: 'Garis miring turun lalu melingkar mendatar' },
    { n: 3, x: 39, y: 66, dir: '↷', tip: 'Lengkungan bawah membulat' }
  ],
  'ん': [
    { n: 1, x: 47, y: 34, dir: '↙', tip: 'Miring ke kiri bawah, naik miring ke kanan atas, lalu ombak memanjang ke kanan' }
  ],

  // Katakana (46 Seion)
  'ア': [
    { n: 1, x: 29, y: 34, dir: '→', tip: 'Garis mendatar lalu melipat miring ke kiri bawah' },
    { n: 2, x: 62, y: 35, dir: '↙', tip: 'Garis lengkung panjang dari kanan ke kiri bawah' }
  ],
  'イ': [
    { n: 1, x: 48, y: 22, dir: '↙', tip: 'Garis miring dari atas ke kiri bawah' },
    { n: 2, x: 50, y: 46, dir: '↓', tip: 'Garis vertikal lurus ke bawah' }
  ],
  'ウ': [
    { n: 1, x: 50, y: 29, dir: '↓', tip: 'Titik vertikal tengah di atas' },
    { n: 2, x: 30, y: 39, dir: '↓', tip: 'Titik kiri pendek' },
    { n: 3, x: 32, y: 39, dir: '→', tip: 'Garis mendatar lalu melengkung tajam ke kiri bawah' }
  ],
  'エ': [
    { n: 1, x: 30, y: 38, dir: '→', tip: 'Garis mendatar atas' },
    { n: 2, x: 50, y: 38, dir: '↓', tip: 'Garis vertikal tengah' },
    { n: 3, x: 26, y: 73, dir: '→', tip: 'Garis mendatar bawah lebih panjang' }
  ],
  'オ': [
    { n: 1, x: 28, y: 42, dir: '→', tip: 'Garis mendatar' },
    { n: 2, x: 56, y: 30, dir: '↓', tip: 'Garis vertikal dengan kail ke kiri' },
    { n: 3, x: 50, y: 43, dir: '↙', tip: 'Garis miring ke kiri bawah' }
  ],
  'カ': [
    { n: 1, x: 28, y: 41, dir: '→', tip: 'Garis mendatar melipat turun dengan kait' },
    { n: 2, x: 47, y: 30, dir: '↙', tip: 'Garis miring diagonal tembus ke kiri bawah' }
  ],
  'キ': [
    { n: 1, x: 44, y: 31, dir: '→', tip: 'Garis mendatar pertama' },
    { n: 2, x: 28, y: 46, dir: '→', tip: 'Garis mendatar kedua lebih panjang' },
    { n: 3, x: 46, y: 30, dir: '↙', tip: 'Garis miring melintang ke kiri bawah' }
  ],
  'ク': [
    { n: 1, x: 48, y: 29, dir: '↙', tip: 'Garis miring pendek ke kiri bawah' },
    { n: 2, x: 39, y: 44, dir: '→', tip: 'Garis mendatar lalu melengkung panjang ke kiri bawah' }
  ],
  'ケ': [
    { n: 1, x: 42, y: 30, dir: '↙', tip: 'Garis miring pendek ke kiri bawah' },
    { n: 2, x: 32, y: 49, dir: '→', tip: 'Garis mendatar memotong' },
    { n: 3, x: 56, y: 46, dir: '↙', tip: 'Garis melengkung ke kiri bawah' }
  ],
  'コ': [
    { n: 1, x: 31, y: 37, dir: '→', tip: 'Garis mendatar atas lalu berbelok turun' },
    { n: 2, x: 30, y: 71, dir: '→', tip: 'Garis mendatar bawah menutup ke kanan' }
  ],
  'サ': [
    { n: 1, x: 25, y: 44, dir: '→', tip: 'Garis mendatar panjang' },
    { n: 2, x: 40, y: 31, dir: '↓', tip: 'Garis vertikal kiri' },
    { n: 3, x: 61, y: 31, dir: '↓', tip: 'Garis vertikal kanan melengkung ke kiri' }
  ],
  'シ': [
    { n: 1, x: 37, y: 33, dir: '↘', tip: 'Titik atas' },
    { n: 2, x: 29, y: 47, dir: '↘', tip: 'Titik kedua di bawahnya' },
    { n: 3, x: 31, y: 75, dir: '↗', tip: 'Sabetan dari kiri bawah naik ke kanan atas' }
  ],
  'ス': [
    { n: 1, x: 32, y: 36, dir: '→', tip: 'Garis mendatar melipat miring ke kiri bawah' },
    { n: 2, x: 58, y: 48, dir: '↘', tip: 'Garis miring ke kanan bawah' }
  ],
  'セ': [
    { n: 1, x: 27, y: 49, dir: '→', tip: 'Garis mendatar lalu turun melipat' },
    { n: 2, x: 66, y: 24, dir: '↓', tip: 'Garis vertikal kanan lalu berbelok ke kiri' }
  ],
  'ソ': [
    { n: 1, x: 31, y: 35, dir: '↘', tip: 'Titik miring kiri atas' },
    { n: 2, x: 67, y: 34, dir: '↙', tip: 'Sabetan miring panjang dari kanan atas ke kiri bawah' }
  ],
  'タ': [
    { n: 1, x: 48, y: 29, dir: '↙', tip: 'Garis miring pendek ke kiri bawah' },
    { n: 2, x: 39, y: 44, dir: '→', tip: 'Garis mendatar melipat melengkung ke kiri bawah' },
    { n: 3, x: 35, y: 50, dir: '↘', tip: 'Garis melintang pendek di dalam' }
  ],
  'チ': [
    { n: 1, x: 64, y: 32, dir: '↙', tip: 'Garis miring pendek atas dari kanan ke kiri' },
    { n: 2, x: 26, y: 50, dir: '→', tip: 'Garis mendatar memotong' },
    { n: 3, x: 52, y: 46, dir: '↷', tip: 'Garis vertikal melengkung membulat ke kiri bawah' }
  ],
  'ツ': [
    { n: 1, x: 29, y: 36, dir: '↘', tip: 'Titik kiri pertama' },
    { n: 2, x: 46, y: 33, dir: '↘', tip: 'Titik tengah kedua' },
    { n: 3, x: 70, y: 35, dir: '↙', tip: 'Sabetan melengkung panjang dari kanan atas ke kiri bawah' }
  ],
  'テ': [
    { n: 1, x: 34, y: 34, dir: '→', tip: 'Garis mendatar atas' },
    { n: 2, x: 26, y: 48, dir: '→', tip: 'Garis mendatar kedua lebih panjang' },
    { n: 3, x: 50, y: 49, dir: '↙', tip: 'Garis lengkung dari tengah ke kiri bawah' }
  ],
  'ト': [
    { n: 1, x: 43, y: 31, dir: '↓', tip: 'Garis vertikal panjang' },
    { n: 2, x: 43, y: 42, dir: '↘', tip: 'Garis miring cabang ke kanan bawah' }
  ],
  'ナ': [
    { n: 1, x: 26, y: 45, dir: '→', tip: 'Garis mendatar' },
    { n: 2, x: 50, y: 31, dir: '↙', tip: 'Garis miring melengkung ke kiri bawah' }
  ],
  'ニ': [
    { n: 1, x: 32, y: 39, dir: '→', tip: 'Garis mendatar atas' },
    { n: 2, x: 26, y: 69, dir: '→', tip: 'Garis mendatar bawah lebih panjang' }
  ],
  'ヌ': [
    { n: 1, x: 32, y: 36, dir: '→', tip: 'Garis mendatar melipat miring ke kiri bawah' },
    { n: 2, x: 52, y: 38, dir: '↘', tip: 'Titik miring memotong di sebelah kanan' }
  ],
  'ネ': [
    { n: 1, x: 49, y: 29, dir: '↓', tip: 'Titik vertikal pendek atas' },
    { n: 2, x: 32, y: 39, dir: '→', tip: 'Garis mendatar melipat miring' },
    { n: 3, x: 48, y: 40, dir: '↓', tip: 'Garis vertikal tengah lurus' },
    { n: 4, x: 57, y: 51, dir: '↘', tip: 'Titik miring di kanan bawah' }
  ],
  'ノ': [
    { n: 1, x: 64, y: 33, dir: '↙', tip: 'Goresan miring panjang melengkung halus dari kanan atas ke kiri bawah' }
  ],
  'ハ': [
    { n: 1, x: 41, y: 36, dir: '↙', tip: 'Garis miring kiri melengkung' },
    { n: 2, x: 58, y: 36, dir: '↘', tip: 'Garis miring kanan melengkung' }
  ],
  'ヒ': [
    { n: 1, x: 35, y: 34, dir: '→', tip: 'Garis mendatar pendek' },
    { n: 2, x: 37, y: 31, dir: '↓', tip: 'Garis vertikal melengkung ke kanan mendatar' }
  ],
  'フ': [
    { n: 1, x: 32, y: 36, dir: '→', tip: 'Garis mendatar melipat miring ke kiri bawah' }
  ],
  'ヘ': [
    { n: 1, x: 28, y: 58, dir: '↗', tip: 'Miring naik ke kanan lalu turun panjang ke kanan bawah' }
  ],
  'ホ': [
    { n: 1, x: 28, y: 41, dir: '→', tip: 'Garis mendatar atas' },
    { n: 2, x: 50, y: 30, dir: '↓', tip: 'Garis vertikal tembus dengan kait' },
    { n: 3, x: 34, y: 43, dir: '↙', tip: 'Titik miring kiri' },
    { n: 4, x: 66, y: 43, dir: '↘', tip: 'Titik miring kanan' }
  ],
  'マ': [
    { n: 1, x: 30, y: 37, dir: '→', tip: 'Garis mendatar melipat miring ke kiri bawah' },
    { n: 2, x: 54, y: 39, dir: '↘', tip: 'Titik miring pendek di kanan' }
  ],
  'ミ': [
    { n: 1, x: 37, y: 32, dir: '↘', tip: 'Garis miring pertama' },
    { n: 2, x: 34, y: 49, dir: '↘', tip: 'Garis miring kedua' },
    { n: 3, x: 31, y: 67, dir: '↘', tip: 'Garis miring ketiga lebih panjang' }
  ],
  'ム': [
    { n: 1, x: 48, y: 32, dir: '↙', tip: 'Miring ke kiri bawah lalu mendatar ke kanan' },
    { n: 2, x: 62, y: 54, dir: '↘', tip: 'Titik miring di kanan bawah' }
  ],
  'メ': [
    { n: 1, x: 64, y: 32, dir: '↙', tip: 'Garis miring dari kanan atas ke kiri bawah' },
    { n: 2, x: 36, y: 41, dir: '↘', tip: 'Garis miring melintang dari kiri atas ke kanan bawah' }
  ],
  'モ': [
    { n: 1, x: 31, y: 35, dir: '→', tip: 'Garis mendatar pertama' },
    { n: 2, x: 27, y: 52, dir: '→', tip: 'Garis mendatar kedua lebih panjang' },
    { n: 3, x: 48, y: 35, dir: '↓', tip: 'Garis vertikal tembus berbelok ke kanan' }
  ],
  'ヤ': [
    { n: 1, x: 37, y: 31, dir: '→', tip: 'Garis mendatar melipat turun' },
    { n: 2, x: 62, y: 22, dir: '↙', tip: 'Garis vertikal miring memotong ke kiri bawah' }
  ],
  'ユ': [
    { n: 1, x: 32, y: 38, dir: '→', tip: 'Garis mendatar melipat turun ke bawah' },
    { n: 2, x: 25, y: 70, dir: '→', tip: 'Garis mendatar bawah memotong tembus' }
  ],
  'ヨ': [
    { n: 1, x: 32, y: 36, dir: '→', tip: 'Garis mendatar atas lalu vertikal turun' },
    { n: 2, x: 34, y: 54, dir: '→', tip: 'Garis mendatar tengah' },
    { n: 3, x: 34, y: 72, dir: '→', tip: 'Garis mendatar bawah' }
  ],
  'ラ': [
    { n: 1, x: 36, y: 33, dir: '→', tip: 'Garis mendatar pendek atas' },
    { n: 2, x: 48, y: 35, dir: '↷', tip: 'Lengkung dari tengah melengkung ke kanan bawah' }
  ],
  'リ': [
    { n: 1, x: 36, y: 32, dir: '↓', tip: 'Garis vertikal kiri pendek' },
    { n: 2, x: 63, y: 32, dir: '↓', tip: 'Garis vertikal kanan panjang melengkung halus' }
  ],
  'ル': [
    { n: 1, x: 40, y: 33, dir: '↙', tip: 'Garis miring kiri melengkung' },
    { n: 2, x: 54, y: 32, dir: '↓', tip: 'Garis vertikal kanan melengkung naik dengan kait' }
  ],
  'レ': [
    { n: 1, x: 37, y: 33, dir: '↓', tip: 'Tarik vertikal lurus ke bawah lalu melesat naik miring ke kanan atas' }
  ],
  'ロ': [
    { n: 1, x: 30, y: 37, dir: '↓', tip: 'Garis vertikal kiri' },
    { n: 2, x: 30, y: 37, dir: '→', tip: 'Garis mendatar atas lalu berbelok turun ke bawah' },
    { n: 3, x: 30, y: 70, dir: '→', tip: 'Garis mendatar bawah menutup kotak' }
  ],
  'ワ': [
    { n: 1, x: 32, y: 36, dir: '↓', tip: 'Titik miring kiri pendek' },
    { n: 2, x: 32, y: 36, dir: '→', tip: 'Garis mendatar melipat melengkung ke kiri bawah' }
  ],
  'ヲ': [
    { n: 1, x: 31, y: 35, dir: '→', tip: 'Garis mendatar atas' },
    { n: 2, x: 32, y: 50, dir: '→', tip: 'Garis mendatar kedua' },
    { n: 3, x: 50, y: 35, dir: '↙', tip: 'Garis melengkung memotong' }
  ],
  'ン': [
    { n: 1, x: 32, y: 34, dir: '↘', tip: 'Titik miring kiri atas' },
    { n: 2, x: 30, y: 75, dir: '↗', tip: 'Sabetan miring dari kiri bawah naik ke kanan atas' }
  ]
};

/**
 * Returns stroke order steps for a character.
 * Falls back to general stroke order principles for Kanji.
 */
export function getStrokeOrder(character, strokesCount = 1) {
  if (!character) return [];
  if (STROKE_ORDER_DATA[character]) {
    return STROKE_ORDER_DATA[character];
  }

  // Fallback for Kanji: synthesize standard stroke order markers based on stroke count
  const count = Math.max(1, strokesCount || 1);
  const synthesized = [];
  
  // Standard positions for kanji strokes (top-to-bottom, left-to-right)
  const gridPositions = [
    { x: 30, y: 24, dir: '→', tip: 'Garis atas (kiri ke kanan)' },
    { x: 50, y: 30, dir: '↓', tip: 'Garis tengah (atas ke bawah)' },
    { x: 26, y: 46, dir: '→', tip: 'Goresan tengah' },
    { x: 44, y: 42, dir: '↘', tip: 'Goresan isi dalam' },
    { x: 32, y: 64, dir: '→', tip: 'Goresan bawah penutup' },
    { x: 68, y: 48, dir: '↓', tip: 'Garis kanan luar' },
    { x: 24, y: 76, dir: '→', tip: 'Garis dasar bawah' }
  ];

  for (let i = 0; i < count; i++) {
    const pos = gridPositions[i % gridPositions.length];
    synthesized.push({
      n: i + 1,
      x: pos.x,
      y: Math.min(84, pos.y + Math.floor(i / gridPositions.length) * 8),
      dir: pos.dir,
      tip: `Goresan ke-${i + 1}`
    });
  }

  return synthesized;
}

/**
 * Compares user's canvas drawing with the reference character glyph.
 * Evaluates spatial overlap, edge containment, and shape completeness.
 * Minimum passing score: 80%.
 * 
 * @param {HTMLCanvasElement} userCanvas
 * @param {string} targetChar
 * @returns {{ score: number, passed: boolean, coverage: number, precision: number, reason?: string }}
 */
export function evaluateStrokeAccuracy(userCanvas, targetChar) {
  if (!userCanvas || !targetChar) {
    return { score: 0, passed: false, coverage: 0, precision: 0, reason: 'Kanvas kosong.' };
  }

  const EVAL_SIZE = 120;
  const offscreenTarget = document.createElement('canvas');
  offscreenTarget.width = EVAL_SIZE;
  offscreenTarget.height = EVAL_SIZE;
  const ctxT = offscreenTarget.getContext('2d', { willReadFrequently: true });

  const offscreenUser = document.createElement('canvas');
  offscreenUser.width = EVAL_SIZE;
  offscreenUser.height = EVAL_SIZE;
  const ctxU = offscreenUser.getContext('2d', { willReadFrequently: true });

  if (!ctxT || !ctxU) {
    return { score: 85, passed: true, coverage: 85, precision: 85 };
  }

  // 1. Render reference glyph onto black background
  ctxT.fillStyle = '#000000';
  ctxT.fillRect(0, 0, EVAL_SIZE, EVAL_SIZE);
  ctxT.fillStyle = '#ffffff';
  ctxT.font = `900 ${Math.round(EVAL_SIZE * 0.72)}px 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif`;
  ctxT.textAlign = 'center';
  ctxT.textBaseline = 'middle';
  ctxT.fillText(targetChar, EVAL_SIZE / 2, EVAL_SIZE / 2);

  const tData = ctxT.getImageData(0, 0, EVAL_SIZE, EVAL_SIZE).data;

  // 2. Render user drawing onto black background
  ctxU.fillStyle = '#000000';
  ctxU.fillRect(0, 0, EVAL_SIZE, EVAL_SIZE);
  ctxU.drawImage(userCanvas, 0, 0, EVAL_SIZE, EVAL_SIZE);
  const uData = ctxU.getImageData(0, 0, EVAL_SIZE, EVAL_SIZE).data;

  const totalPixels = EVAL_SIZE * EVAL_SIZE;
  const targetMask = new Uint8Array(totalPixels);
  const userMask = new Uint8Array(totalPixels);
  let totalTargetPixels = 0;
  let totalUserPixels = 0;

  for (let i = 0; i < totalPixels; i++) {
    if (tData[i * 4] > 40) {
      targetMask[i] = 1;
      totalTargetPixels++;
    }
    // Check either RGB brightness or alpha channel
    const uBrightness = Math.max(uData[i * 4], uData[i * 4 + 1], uData[i * 4 + 2]);
    const uAlpha = uData[i * 4 + 3];
    if (uBrightness > 40 || uAlpha > 40) {
      userMask[i] = 1;
      totalUserPixels++;
    }
  }

  // Edge Case: Empty or barely any ink
  if (totalUserPixels < totalTargetPixels * 0.22) {
    const minimalScore = Math.round((totalUserPixels / Math.max(1, totalTargetPixels)) * 40);
    return {
      score: minimalScore,
      passed: false,
      coverage: minimalScore,
      precision: minimalScore,
      reason: 'Coretan belum lengkap. Silakan tulis huruf secara utuh.'
    };
  }

  // Edge Case: Scribbled everywhere / flooded
  if (totalUserPixels > totalTargetPixels * 2.8) {
    const sloppyScore = Math.max(15, Math.round(100 - (totalUserPixels / totalTargetPixels) * 28));
    return {
      score: sloppyScore,
      passed: false,
      coverage: 80,
      precision: sloppyScore,
      reason: 'Coretan terlalu berantakan dan melebar keluar bentuk aksara.'
    };
  }

  // 3. Tolerance matching within radius
  // A 4-pixel radius on 120x120 equates to ~14px tolerance on a 400px canvas
  const RADIUS = 4;
  let matchedTargetPixels = 0;
  let matchedUserPixels = 0;

  for (let y = 0; y < EVAL_SIZE; y++) {
    for (let x = 0; x < EVAL_SIZE; x++) {
      const idx = y * EVAL_SIZE + x;

      if (targetMask[idx]) {
        let covered = false;
        for (let dy = -RADIUS; dy <= RADIUS && !covered; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= EVAL_SIZE) continue;
          for (let dx = -RADIUS; dx <= RADIUS; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= EVAL_SIZE) continue;
            if (dx * dx + dy * dy <= RADIUS * RADIUS) {
              if (userMask[ny * EVAL_SIZE + nx]) {
                covered = true;
                break;
              }
            }
          }
        }
        if (covered) matchedTargetPixels++;
      }

      if (userMask[idx]) {
        let onTarget = false;
        for (let dy = -RADIUS; dy <= RADIUS && !onTarget; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= EVAL_SIZE) continue;
          for (let dx = -RADIUS; dx <= RADIUS; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= EVAL_SIZE) continue;
            if (dx * dx + dy * dy <= RADIUS * RADIUS) {
              if (targetMask[ny * EVAL_SIZE + nx]) {
                onTarget = true;
                break;
              }
            }
          }
        }
        if (onTarget) matchedUserPixels++;
      }
    }
  }

  const coverageRatio = matchedTargetPixels / Math.max(1, totalTargetPixels);
  const precisionRatio = matchedUserPixels / Math.max(1, totalUserPixels);

  // Harmonic balance favoring coverage (completeness) and precision (neatness)
  const harmonicMean = (2 * (coverageRatio * precisionRatio)) / Math.max(0.001, coverageRatio + precisionRatio);
  const calculatedScore = Math.min(100, Math.max(0, Math.round(harmonicMean * 100)));

  return {
    score: calculatedScore,
    passed: calculatedScore >= 80,
    coverage: Math.round(coverageRatio * 100),
    precision: Math.round(precisionRatio * 100),
    reason: calculatedScore >= 80
      ? 'Goresan rapi dan proporsional.'
      : 'Kerapihan masih di bawah 80%. Ulangi goresan agar lebih presisi.'
  };
}
