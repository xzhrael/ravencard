import { kanaToRomaji } from './kana-utils.js';

const dataCache = new Map();

export async function getDeckData(category, level = 'all') {
  const cacheKey = `${category}_${level}`;
  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey);
  }

  let rawItems = [];

  try {
    switch (category) {
      case 'hiragana': {
        const res = await fetch('./data/hiragana.json');
        const list = await res.json();
        rawItems = list.map((item, idx) => ({
          id: `hira-${idx}`,
          category: 'hiragana',
          group: item.group,
          character: item.char,
          romaji: item.romaji,
          meaning_id: item.meaning_id,
          meaning_en: item.meaning_en,
          badge: `Hiragana • ${formatGroup(item.group)}`,
          example: item.example
        }));
        if (level !== 'all') {
          rawItems = rawItems.filter(item => item.group === level);
        }
        break;
      }

      case 'katakana': {
        const res = await fetch('./data/katakana.json');
        const list = await res.json();
        rawItems = list.map((item, idx) => ({
          id: `kata-${idx}`,
          category: 'katakana',
          group: item.group,
          character: item.char,
          romaji: item.romaji,
          meaning_id: item.meaning_id,
          meaning_en: item.meaning_en,
          badge: `Katakana • ${formatGroup(item.group)}`,
          example: item.example
        }));
        if (level !== 'all') {
          rawItems = rawItems.filter(item => item.group === level);
        }
        break;
      }

      case 'kanji': {
        const levelsToLoad = level === 'all' ? ['n5', 'n4', 'n3'] : [level.toLowerCase()];
        const promises = levelsToLoad.map(lvl =>
          fetch(`./data/kanji-${lvl}.json`)
            .then(r => r.json())
            .catch(() => [])
        );
        const results = await Promise.all(promises);
        const combined = results.flat();

        rawItems = combined.map((item, idx) => {
          const onyomiRomaji = kanaToRomaji(item.onyomi);
          const kunyomiRomaji = kanaToRomaji(item.kunyomi);

          const primaryKunKana = (item.kunyomi && item.kunyomi !== '-')
            ? item.kunyomi.split(',')[0].replace(/[-.]/g, '').trim()
            : '';
          const primaryOnKana = (item.onyomi && item.onyomi !== '-')
            ? item.onyomi.split(',')[0].replace(/[-.]/g, '').trim()
            : '';

          const primaryKunRomaji = kanaToRomaji(primaryKunKana);
          const primaryOnRomaji = kanaToRomaji(primaryOnKana);

          const mainRomajiParts = [];
          if (primaryOnRomaji) mainRomajiParts.push(primaryOnRomaji);
          if (primaryKunRomaji) mainRomajiParts.push(primaryKunRomaji);
          const mainRomaji = mainRomajiParts.join(' • ');

          const exampleObj = item.example ? {
            ja: item.example.ja,
            reading: item.example.reading || '',
            romaji: kanaToRomaji(item.example.reading || ''),
            meaning: item.example.meaning || ''
          } : null;

          return {
            id: `kanji-${item.level.toLowerCase()}-${idx}`,
            category: 'kanji',
            level: item.level.toLowerCase(),
            character: item.char,
            reading: primaryKunKana || primaryOnKana || item.char,
            romaji: mainRomaji || onyomiRomaji || kunyomiRomaji || '',
            onyomi: item.onyomi || '-',
            onyomi_romaji: onyomiRomaji,
            kunyomi: item.kunyomi || '-',
            kunyomi_romaji: kunyomiRomaji,
            meaning_id: item.meaning_id,
            meaning_en: item.meaning_en,
            badge: `Kanji • ${item.level} (${item.strokes} Coretan)`,
            example: exampleObj
          };
        });
        break;
      }

      case 'kotoba': {
        const levelsToLoad = level === 'all' ? ['n5', 'n4', 'n3'] : [level.toLowerCase()];
        const promises = levelsToLoad.map(lvl =>
          fetch(`./data/kotoba-${lvl}.json`)
            .then(r => r.json())
            .catch(() => [])
        );
        const results = await Promise.all(promises);
        const combined = results.flat();

        rawItems = combined.map((item, idx) => ({
          id: `kotoba-${item.level.toLowerCase()}-${idx}`,
          category: 'kotoba',
          level: item.level.toLowerCase(),
          character: item.word,
          reading: item.reading,
          romaji: item.romaji || kanaToRomaji(item.reading || ''),
          meaning_id: item.meaning_id,
          meaning_en: item.meaning_en,
          badge: `Kotoba • ${item.level} (${item.type})`,
          example: item.example ? {
            ...item.example,
            romaji: kanaToRomaji(item.example.reading || '')
          } : null
        }));
        break;
      }

      default:
        rawItems = [];
    }
  } catch (err) {
    console.error(`[DataService] Gagal memuat dataset ${category}:`, err);
    return [];
  }

  dataCache.set(cacheKey, rawItems);
  return rawItems;
}

function formatGroup(group) {
  switch (group) {
    case 'seion': return 'Seion (Dasar)';
    case 'dakuon': return 'Dakuon (ﾞ/ﾟ)';
    case 'yoon': return 'Yoon (Kombinasi)';
    default: return group;
  }
}
