/**
 * Transitive and Intransitive verb pairing engine for Japanese learners (N5-N3).
 * Provides grammatical transitivity classification and complementary pairing.
 */

export const TRANSITIVITY_MAP = {
  // 1. Akeru / Aku (Open)
  '開ける': { type: '他動詞 (Transitif)', isTransitive: true, pairWord: '開く', pairType: '自動詞 (Intransitif)', pairMeaning: 'Terbuka' },
  '開く':   { type: '自動詞 (Intransitif)', isTransitive: false, pairWord: '開ける', pairType: '他動詞 (Transitif)', pairMeaning: 'Membuka' },

  // 2. Shimeru / Shimaru (Close)
  '閉める': { type: '他動詞 (Transitif)', isTransitive: true, pairWord: '閉まる', pairType: '自動詞 (Intransitif)', pairMeaning: 'Tertutup' },
  '閉まる': { type: '自動詞 (Intransitif)', isTransitive: false, pairWord: '閉める', pairType: '他動詞 (Transitif)', pairMeaning: 'Menutup' },

  // 3. Tsukeru / Tsuku (Turn on / Attach)
  'つける': { type: '他動詞 (Transitif)', isTransitive: true, pairWord: 'つく', pairType: '自動詞 (Intransitif)', pairMeaning: 'Menyala' },
  'つく':   { type: '自動詞 (Intransitif)', isTransitive: false, pairWord: 'つける', pairType: '他動詞 (Transitif)', pairMeaning: 'Menyalakan' },

  // 4. Kesu / Kieru (Turn off / Extinguish)
  '消す':   { type: '他動詞 (Transitif)', isTransitive: true, pairWord: '消える', pairType: '自動詞 (Intransitif)', pairMeaning: 'Padam / Hilang' },
  '消える': { type: '自動詞 (Intransitif)', isTransitive: false, pairWord: '消す', pairType: '他動詞 (Transitif)', pairMeaning: 'Memadamkan' },

  // 5. Otosu / Ochiru (Drop / Fall)
  '落とす': { type: '他動詞 (Transitif)', isTransitive: true, pairWord: '落ちる', pairType: '自動詞 (Intransitif)', pairMeaning: 'Jatuh' },
  '落ちる': { type: '自動詞 (Intransitif)', isTransitive: false, pairWord: '落とす', pairType: '他動詞 (Transitif)', pairMeaning: 'Menjatuhkan' },

  // 6. Kowasu / Kowareru (Break)
  '壊す':   { type: '他動詞 (Transitif)', isTransitive: true, pairWord: '壊れる', pairType: '自動詞 (Intransitif)', pairMeaning: 'Rusak' },
  '壊れる': { type: '自動詞 (Intransitif)', isTransitive: false, pairWord: '壊す', pairType: '他動詞 (Transitif)', pairMeaning: 'Merusak' },

  // 7. Yogosu / Yogoreru (Dirty)
  '汚す':   { type: '他動詞 (Transitif)', isTransitive: true, pairWord: '汚れる', pairType: '自動詞 (Intransitif)', pairMeaning: 'Menjadi kotor' },
  '汚れる': { type: '自動詞 (Intransitif)', isTransitive: false, pairWord: '汚す', pairType: '他動詞 (Transitif)', pairMeaning: 'Mengotori' },

  // 8. Naosu / Naoru (Fix / Heal)
  '直す':   { type: '他動詞 (Transitif)', isTransitive: true, pairWord: '直る', pairType: '自動詞 (Intransitif)', pairMeaning: 'Sembuh / Membaik' },
  '直る':   { type: '自動詞 (Intransitif)', isTransitive: false, pairWord: '直す', pairType: '他動詞 (Transitif)', pairMeaning: 'Memperbaiki' },

  // 9. Atsumeru / Atsumaru (Gather)
  '集める': { type: '他動詞 (Transitif)', isTransitive: true, pairWord: '集まる', pairType: '自動詞 (Intransitif)', pairMeaning: 'Berkumpul' },
  '集まる': { type: '自動詞 (Intransitif)', isTransitive: false, pairWord: '集める', pairType: '他動詞 (Transitif)', pairMeaning: 'Mengumpulkan' },

  // 10. Hajimeru / Hajimaru (Start)
  '始める': { type: '他動詞 (Transitif)', isTransitive: true, pairWord: '始まる', pairType: '自動詞 (Intransitif)', pairMeaning: 'Dimulai' },
  '始まる': { type: '自動詞 (Intransitif)', isTransitive: false, pairWord: '始める', pairType: '他動詞 (Transitif)', pairMeaning: 'Memulai' },

  // 11. Tomeru / Tomaru (Stop)
  '止める': { type: '他動詞 (Transitif)', isTransitive: true, pairWord: '止まる', pairType: '自動詞 (Intransitif)', pairMeaning: 'Berhenti' },
  '止まる': { type: '自動詞 (Intransitif)', isTransitive: false, pairWord: '止める', pairType: '他動詞 (Transitif)', pairMeaning: 'Menghentikan' },

  // 12. Dasu / Deru (Put out / Exit)
  '出す':   { type: '他動詞 (Transitif)', isTransitive: true, pairWord: '出る', pairType: '自動詞 (Intransitif)', pairMeaning: 'Keluar' },
  '出る':   { type: '自動詞 (Intransitif)', isTransitive: false, pairWord: '出す', pairType: '他動詞 (Transitif)', pairMeaning: 'Mengeluarkan' },

  // 13. Ireru / Hairu (Put in / Enter)
  '入れる': { type: '他動詞 (Transitif)', isTransitive: true, pairWord: '入る', pairType: '自動詞 (Intransitif)', pairMeaning: 'Masuk' },
  '入る':   { type: '自動詞 (Intransitif)', isTransitive: false, pairWord: '入れる', pairType: '他動詞 (Transitif)', pairMeaning: 'Memasukkan' },

  // 14. Mitsukeru / Mitsukaru (Find)
  '見つける': { type: '他動詞 (Transitif)', isTransitive: true, pairWord: '見つかる', pairType: '自動詞 (Intransitif)', pairMeaning: 'Ditemukan' },
  '見つかる': { type: '自動詞 (Intransitif)', isTransitive: false, pairWord: '見つける', pairType: '他動詞 (Transitif)', pairMeaning: 'Menemukan' },

  // 15. Kaeru / Kawaru (Change)
  '変える': { type: '他動詞 (Transitif)', isTransitive: true, pairWord: '変わる', pairType: '自動詞 (Intransitif)', pairMeaning: 'Berubah' },
  '変わる': { type: '自動詞 (Intransitif)', isTransitive: false, pairWord: '変える', pairType: '他動詞 (Transitif)', pairMeaning: 'Mengubah' },

  // 16. Okosu / Okiru (Wake up)
  '起こす': { type: '他動詞 (Transitif)', isTransitive: true, pairWord: '起きる', pairType: '自動詞 (Intransitif)', pairMeaning: 'Bangun' },
  '起きる': { type: '自動詞 (Intransitif)', isTransitive: false, pairWord: '起こす', pairType: '他動詞 (Transitif)', pairMeaning: 'Membangunkan' },

  // 17. Nokosu / Nokoru (Leave behind / Remain)
  '残す':   { type: '他動詞 (Transitif)', isTransitive: true, pairWord: '残る', pairType: '自動詞 (Intransitif)', pairMeaning: 'Tersisa' },
  '残る':   { type: '自動詞 (Intransitif)', isTransitive: false, pairWord: '残す', pairType: '他動詞 (Transitif)', pairMeaning: 'Menyisakan' },

  // 18. Todokeru / Todoku (Deliver / Arrive)
  '届ける': { type: '他動詞 (Transitif)', isTransitive: true, pairWord: '届く', pairType: '自動詞 (Intransitif)', pairMeaning: 'Sampai / Tiba' },
  '届く':   { type: '自動詞 (Intransitif)', isTransitive: false, pairWord: '届ける', pairType: '他動詞 (Transitif)', pairMeaning: 'Mengantarkan' },

  // 19. Taosu / Taoreru (Knock down / Collapse)
  '倒す':   { type: '他動詞 (Transitif)', isTransitive: true, pairWord: '倒れる', pairType: '自動詞 (Intransitif)', pairMeaning: 'Tumbang / Roboh' },
  '倒れる': { type: '自動詞 (Intransitif)', isTransitive: false, pairWord: '倒す', pairType: '他動詞 (Transitif)', pairMeaning: 'Merobohkan' },

  // 20. Wakasu / Waku (Boil)
  '沸かす': { type: '他動詞 (Transitif)', isTransitive: true, pairWord: '沸く', pairType: '自動詞 (Intransitif)', pairMeaning: 'Mendidih' },
  '沸く':   { type: '自動詞 (Intransitif)', isTransitive: false, pairWord: '沸かす', pairType: '他動詞 (Transitif)', pairMeaning: 'Mendidihkan' },

  // 21. Yaburu / Yabureru (Tear / Rip)
  '破る':   { type: '他動詞 (Transitif)', isTransitive: true, pairWord: '破れる', pairType: '自動詞 (Intransitif)', pairMeaning: 'Robek / Sobek' },
  '破れる': { type: '自動詞 (Intransitif)', isTransitive: false, pairWord: '破る', pairType: '他動詞 (Transitif)', pairMeaning: 'Merobek' },

  // 22. Naraberu / Narabu (Line up)
  '並べる': { type: '他動詞 (Transitif)', isTransitive: true, pairWord: '並ぶ', pairType: '自動詞 (Intransitif)', pairMeaning: 'Berbaris / Mengantre' },
  '並ぶ':   { type: '自動詞 (Intransitif)', isTransitive: false, pairWord: '並べる', pairType: '他動詞 (Transitif)', pairMeaning: 'Menjajarkan' }
};

/**
 * Returns transitivity metadata if the word is a known paired verb.
 */
export function getTransitivityInfo(word) {
  if (!word || typeof word !== 'string') return null;
  const cleanWord = word.trim();
  return TRANSITIVITY_MAP[cleanWord] || null;
}
