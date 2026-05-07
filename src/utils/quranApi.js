const TIMEOUT_MS = 18000;

async function fetchWithTimeout(url, opts = {}) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } catch (err) {
    clearTimeout(id);
    if (err.name === 'AbortError') throw new Error('انتهت مهلة الطلب — تحقق من اتصالك');
    throw err;
  }
}

async function retry(fn, retries = 3, delay = 1200) {
  for (let i = 0; i < retries; i++) {
    try { return await fn(); }
    catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, delay * (i + 1)));
    }
  }
}

export async function fetchSurahVerses(surahNumber) {
  return retry(async () => {
    const res = await fetchWithTimeout(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/ar.uthmani`
    );
    const data = await res.json();
    if (data.code !== 200) throw new Error('فشل في تحميل الآيات');
    return data.data.ayahs.map(a => ({
      number: a.numberInSurah,
      text: a.text,
      globalNumber: a.number
    }));
  });
}

export function getAudioUrl(reciterId, surahNumber, verseNumber) {
  const s = String(surahNumber).padStart(3, '0');
  const v = String(verseNumber).padStart(3, '0');
  return `https://everyayah.com/data/${reciterId}/${s}${v}.mp3`;
}

export async function fetchSurahAudioUrls(reciterId, surahNumber, verseCount) {
  return Array.from({ length: verseCount }, (_, i) =>
    getAudioUrl(reciterId, surahNumber, i + 1)
  );
}
