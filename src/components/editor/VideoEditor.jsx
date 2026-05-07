import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '../../hooks/useToast';
import { useDevice } from '../../hooks/useDevice';
import { useAuth } from '../../contexts/AuthContext';
import { SURAHS, RECITERS, QURAN_FONTS, VIDEO_PRESETS, COLOR_THEMES, GRADIENT_BACKGROUNDS } from '../../data/surahs';
import { fetchSurahVerses, getAudioUrl } from '../../utils/quranApi';
import { storage } from '../../utils/storage';
import EditorPreview from './EditorPreview';
import ExportPanel from './ExportPanel';
import styles from './VideoEditor.module.css';

// ── Basmala rule ─────────────────────────────────────────────────
// Al-Fatiha (1): basmala IS verse 1 — don't add extra
// At-Tawbah (9): no basmala ever
// All others: show basmala before verse 1
function basmalaAllowed(surahNumber) {
  return surahNumber !== 1 && surahNumber !== 9;
}

export default function VideoEditor({ mode = 'quran' }) {
  const toast = useToast();
  const device = useDevice();
  const { user, isVIP } = useAuth();

  const [activeTab, setActiveTab] = useState('content');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');

  // Content
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [verses, setVerses] = useState([]);
  const [startVerse, setStartVerse] = useState(1);
  const [endVerse, setEndVerse] = useState(1);
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0]);
  const [customText, setCustomText] = useState('');
  const [hadithText, setHadithText] = useState('');
  const [hadithSource, setHadithSource] = useState('');

  // Design
  const [theme, setTheme] = useState(COLOR_THEMES[0]);
  const [fontId, setFontId] = useState('KFGQPC Uthmanic Script HAFS');
  const [fontSize, setFontSize] = useState(42);
  const [fontColor, setFontColor] = useState('');
  const [textShadow, setTextShadow] = useState(true);
  const [showBasmala, setShowBasmala] = useState(true);
  const [showVerseNumber, setShowVerseNumber] = useState(true);
  const [showSurahName, setShowSurahName] = useState(true);
  const [showReciterName, setShowReciterName] = useState(false);

  // Background
  const [bgType, setBgType] = useState('theme'); // theme | gradient | image | video
  const [bgImage, setBgImage] = useState(null);
  const [bgVideo, setBgVideo] = useState(null);
  const [bgGradient, setBgGradient] = useState(GRADIENT_BACKGROUNDS[0]);
  const [bgOverlay, setBgOverlay] = useState(0.55);
  const [bgBlur, setBgBlur] = useState(0);
  const [bgBrightness, setBgBrightness] = useState(1);

  // Audio
  const [audioUrls, setAudioUrls] = useState([]);
  const [customAudio, setCustomAudio] = useState(null);

  // Export
  const [preset, setPreset] = useState(VIDEO_PRESETS[0]);

  // Load saved state on mount
  useEffect(() => {
    const saved = storage.loadEditorState();
    if (saved && mode === 'quran') {
      const surah = SURAHS.find(s => s.number === saved.surahNumber);
      if (surah) { setSelectedSurah(surah); setStartVerse(saved.startVerse || 1); setEndVerse(saved.endVerse || 1); }
      if (saved.reciterId) { const r = RECITERS.find(r => r.id === saved.reciterId); if (r) setSelectedReciter(r); }
      if (saved.theme) { const t = COLOR_THEMES.find(c => c.id === saved.theme); if (t) setTheme(t); }
      if (saved.fontId) setFontId(saved.fontId);
      if (saved.fontSize) setFontSize(saved.fontSize);
    }
    if (device.isLowEnd) { setPreset(VIDEO_PRESETS[0]); }
  }, [mode, device.isLowEnd]);

  // Auto-set preset based on VIP
  useEffect(() => {
    if (!isVIP) setPreset(VIDEO_PRESETS[0]);
  }, [isVIP]);

  // Load surah verses
  const loadVerses = useCallback(async (surah, reciter = selectedReciter) => {
    if (!surah) return;
    setLoading(true);
    setLoadingMsg('جاري تحميل الآيات...');
    try {
      const data = await fetchSurahVerses(surah.number);
      setVerses(data);
      const defaultEnd = Math.min(surah.verses, 7);
      setStartVerse(1);
      setEndVerse(defaultEnd);
      const urls = data.map((_, i) => getAudioUrl(reciter.id, surah.number, i + 1));
      setAudioUrls(urls);
      storage.saveEditorState({ surahNumber: surah.number, reciterId: reciter.id, startVerse: 1, endVerse: defaultEnd, theme: theme.id, fontId, fontSize });
      toast.success(`✅ سورة ${surah.name} — ${data.length} آية`);
    } catch (err) {
      toast.error(`❌ فشل تحميل الآيات: ${err.message}`);
    } finally { setLoading(false); setLoadingMsg(''); }
  }, [selectedReciter, theme, fontId, fontSize, toast]);

  const handleSurahSelect = (surah) => { setSelectedSurah(surah); loadVerses(surah); };

  const handleReciterChange = (reciter) => {
    setSelectedReciter(reciter);
    if (selectedSurah && verses.length > 0) {
      setAudioUrls(verses.map((_, i) => getAudioUrl(reciter.id, selectedSurah.number, i + 1)));
    }
  };

  const selectedVerses = verses.slice(startVerse - 1, endVerse);

  // Build effective content for non-quran modes
  const effectiveVerses = mode === 'quran' ? selectedVerses : (
    mode === 'sunnah'
      ? (hadithText ? [{ number: 1, text: hadithText }] : [])
      : (customText ? customText.split('\n').filter(Boolean).map((t, i) => ({ number: i + 1, text: t })) : [])
  );

  const tabs = [
    { id: 'content', icon: '📖', label: 'المحتوى' },
    { id: 'design',  icon: '🎨', label: 'التصميم' },
    { id: 'bg',      icon: '🖼️', label: 'الخلفية' },
    { id: 'sync',    icon: '⏱️', label: 'التوقيت' },
    { id: 'export',  icon: '🎬', label: 'التصدير' },
  ];

  return (
    <div className={styles.editor}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.topInfo}>
          {mode === 'quran' && selectedSurah
            ? <span className={styles.currentInfo}>📖 سورة {selectedSurah.name} • الآيات {startVerse}–{endVerse} • {selectedReciter.name}</span>
            : mode === 'sunnah' ? <span className={styles.currentInfo}>🌙 محرر الحديث النبوي</span>
            : <span className={styles.currentInfo}>✍️ محرر النص المخصص</span>
          }
        </div>
        <button className={styles.exportQuickBtn} onClick={() => setActiveTab('export')}>
          🎬 تصدير
        </button>
      </div>

      {device.isLowEnd && (
        <div className={styles.deviceBanner}>⚠️ جهازك محدود — الجودة مخفضة تلقائياً لأفضل أداء</div>
      )}

      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
          <p>{loadingMsg}</p>
        </div>
      )}

      <div className={styles.mainLayout}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.tabNav}>
            {tabs.map(t => (
              <button key={t.id} className={`${styles.tabBtn} ${activeTab === t.id ? styles.activeTab : ''}`} onClick={() => setActiveTab(t.id)}>
                <span>{t.icon}</span>
                <span className={styles.tabLabel}>{t.label}</span>
              </button>
            ))}
          </div>
          <div className={styles.tabContent}>
            {activeTab === 'content' && (
              <ContentTab
                mode={mode}
                selectedSurah={selectedSurah} selectedReciter={selectedReciter}
                verses={verses} startVerse={startVerse} endVerse={endVerse}
                showBasmala={showBasmala} showVerseNumber={showVerseNumber}
                showSurahName={showSurahName} showReciterName={showReciterName}
                customAudio={customAudio} hadithText={hadithText} hadithSource={hadithSource}
                customText={customText}
                onSurahSelect={handleSurahSelect} onReciterChange={handleReciterChange}
                onStartVerseChange={setStartVerse} onEndVerseChange={setEndVerse}
                onShowBasmalaChange={setShowBasmala} onShowVerseNumberChange={setShowVerseNumber}
                onShowSurahNameChange={setShowSurahName} onShowReciterNameChange={setShowReciterName}
                onCustomAudioChange={setCustomAudio}
                onHadithTextChange={setHadithText} onHadithSourceChange={setHadithSource}
                onCustomTextChange={setCustomText}
              />
            )}
            {activeTab === 'design' && (
              <DesignTab
                theme={theme} fontId={fontId} fontSize={fontSize}
                fontColor={fontColor} textShadow={textShadow}
                onThemeChange={setTheme} onFontChange={setFontId}
                onFontSizeChange={setFontSize} onFontColorChange={setFontColor}
                onTextShadowChange={setTextShadow}
              />
            )}
            {activeTab === 'bg' && (
              <BackgroundTab
                bgType={bgType} bgGradient={bgGradient} bgImage={bgImage}
                bgVideo={bgVideo} bgOverlay={bgOverlay} bgBlur={bgBlur}
                bgBrightness={bgBrightness} isVIP={isVIP}
                onBgTypeChange={setBgType} onGradientChange={setBgGradient}
                onBgImageChange={setBgImage} onBgVideoChange={setBgVideo}
                onOverlayChange={setBgOverlay} onBlurChange={setBgBlur}
                onBrightnessChange={setBgBrightness}
              />
            )}
            {activeTab === 'sync' && (
              <SyncTab
                verses={effectiveVerses} surah={selectedSurah}
                audioUrls={audioUrls.slice(startVerse - 1, endVerse)}
                customAudio={customAudio} startVerse={startVerse}
              />
            )}
            {activeTab === 'export' && (
              <ExportPanel
                verses={effectiveVerses} surah={selectedSurah} reciter={selectedReciter}
                theme={theme} fontId={fontId} fontSize={fontSize}
                fontColor={fontColor} textShadow={textShadow}
                bgType={bgType} bgImage={bgType === 'image' ? bgImage : null}
                bgVideo={bgType === 'video' ? bgVideo : null}
                bgGradient={bgType === 'gradient' ? bgGradient : null}
                bgOverlay={bgOverlay}
                showBasmala={showBasmala} showVerseNumber={showVerseNumber}
                audioUrls={audioUrls.slice(startVerse - 1, endVerse)}
                customAudio={customAudio} preset={preset} presets={VIDEO_PRESETS}
                device={device} onPresetChange={setPreset} editorType={mode}
                hadithSource={mode === 'sunnah' ? hadithSource : null}
              />
            )}
          </div>
        </div>

        {/* Preview */}
        <EditorPreview
          verses={effectiveVerses} surah={selectedSurah} reciter={selectedReciter}
          theme={theme} fontId={fontId} fontSize={fontSize}
          fontColor={fontColor} textShadow={textShadow}
          bgType={bgType} bgImage={bgType === 'image' ? bgImage : null}
          bgGradient={bgType === 'gradient' ? bgGradient : null}
          bgOverlay={bgOverlay} bgBlur={bgBlur} bgBrightness={bgBrightness}
          showBasmala={showBasmala} showVerseNumber={showVerseNumber}
          showSurahName={showSurahName} showReciterName={showReciterName}
          audioUrls={audioUrls.slice(startVerse - 1, endVerse)}
          customAudio={customAudio} preset={preset}
          hadithSource={mode === 'sunnah' ? hadithSource : null}
          mode={mode}
        />
      </div>
    </div>
  );
}

// ── Content Tab ──────────────────────────────────────────────────
function ContentTab({
  mode, selectedSurah, selectedReciter, verses, startVerse, endVerse,
  showBasmala, showVerseNumber, showSurahName, showReciterName, customAudio,
  hadithText, hadithSource, customText,
  onSurahSelect, onReciterChange, onStartVerseChange, onEndVerseChange,
  onShowBasmalaChange, onShowVerseNumberChange, onShowSurahNameChange, onShowReciterNameChange,
  onCustomAudioChange, onHadithTextChange, onHadithSourceChange, onCustomTextChange
}) {
  const [search, setSearch] = useState('');
  const toast = useToast();

  const filtered = SURAHS.filter(s =>
    s.name.includes(search) || String(s.number).includes(search) ||
    s.englishName.toLowerCase().includes(search.toLowerCase())
  );

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 60 * 1024 * 1024) { toast.error('❌ الحد الأقصى 60 ميجابايت'); return; }
    const url = URL.createObjectURL(file);
    onCustomAudioChange({ url, name: file.name });
    toast.success(`✅ الصوت: ${file.name}`);
  };

  return (
    <div className={styles.tabPanel}>
      {/* QURAN MODE */}
      {mode === 'quran' && (<>
        <div className={styles.formGroup}>
          <label className={styles.label}>اختر السورة</label>
          <input className={styles.searchInput} placeholder="ابحث بالاسم أو الرقم..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className={styles.surahList}>
            {filtered.slice(0, 40).map(s => (
              <button key={s.number} className={`${styles.surahItem} ${selectedSurah?.number === s.number ? styles.selected : ''}`} onClick={() => onSurahSelect(s)}>
                <span className={styles.surahNum}>{s.number}</span>
                <span className={styles.surahName}>{s.name}</span>
                <span className={styles.surahVc}>{s.verses}آية</span>
              </button>
            ))}
            {filtered.length > 40 && <p className={styles.moreNote}>اكتب أكثر لتضييق البحث...</p>}
          </div>
        </div>

        {selectedSurah && verses.length > 0 && (
          <div className={styles.formGroup}>
            <label className={styles.label}>نطاق الآيات</label>
            <div className={styles.verseRange}>
              <div className={styles.rangeItem}>
                <span>من</span>
                <input type="number" min={1} max={endVerse} value={startVerse}
                  onChange={e => onStartVerseChange(Math.max(1, Math.min(+e.target.value || 1, endVerse)))}
                  className={styles.numInput} />
              </div>
              <span className={styles.rangeSep}>—</span>
              <div className={styles.rangeItem}>
                <span>إلى</span>
                <input type="number" min={startVerse} max={selectedSurah.verses} value={endVerse}
                  onChange={e => onEndVerseChange(Math.max(startVerse, Math.min(+e.target.value || startVerse, selectedSurah.verses)))}
                  className={styles.numInput} />
              </div>
            </div>
            <p className={styles.verseCount}>{endVerse - startVerse + 1} آية مختارة</p>
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.label}>القارئ</label>
          <select className={styles.selectInput} value={selectedReciter.id}
            onChange={e => { const r = RECITERS.find(r => r.id === e.target.value); if (r) onReciterChange(r); }}>
            {RECITERS.map(r => <option key={r.id} value={r.id}>{r.name} — {r.country}</option>)}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>خيارات العرض</label>
          <div className={styles.checkList}>
            {[
              { label: 'البسملة', val: showBasmala, fn: onShowBasmalaChange, disabled: selectedSurah && !basmalaAllowed(selectedSurah.number), hint: selectedSurah?.number === 1 ? '(جزء من السورة)' : selectedSurah?.number === 9 ? '(لا تُقرأ)' : '' },
              { label: 'رقم الآية', val: showVerseNumber, fn: onShowVerseNumberChange },
              { label: 'اسم السورة', val: showSurahName, fn: onShowSurahNameChange },
              { label: 'اسم القارئ', val: showReciterName, fn: onShowReciterNameChange },
            ].map((item, i) => (
              <label key={i} className={`${styles.checkItem} ${item.disabled ? styles.disabledCheck : ''}`}>
                <input type="checkbox" checked={item.val} disabled={item.disabled} onChange={e => !item.disabled && item.fn(e.target.checked)} />
                <span>{item.label} {item.hint && <span className={styles.hint}>{item.hint}</span>}</span>
              </label>
            ))}
          </div>
        </div>
      </>)}

      {/* SUNNAH MODE */}
      {mode === 'sunnah' && (<>
        <div className={styles.formGroup}>
          <label className={styles.label}>نص الحديث النبوي</label>
          <textarea className={styles.textarea} rows={6} placeholder="أدخل نص الحديث الشريف هنا..."
            value={hadithText} onChange={e => onHadithTextChange(e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>المصدر (مطلوب للأمانة)</label>
          <input className={styles.searchInput} placeholder="مثال: رواه البخاري — كتاب الإيمان"
            value={hadithSource} onChange={e => onHadithSourceChange(e.target.value)} />
          <p className={styles.hintText}>⚠️ يرجى التأكد من صحة الحديث ومصدره قبل النشر</p>
        </div>
      </>)}

      {/* CUSTOM MODE */}
      {mode === 'custom' && (
        <div className={styles.formGroup}>
          <label className={styles.label}>النص (سطر = شريحة)</label>
          <textarea className={styles.textarea} rows={8} placeholder="كل سطر يظهر كشريحة منفصلة..."
            value={customText} onChange={e => onCustomTextChange(e.target.value)} />
          <p className={styles.hintText}>{customText.split('\n').filter(Boolean).length} شريحة</p>
        </div>
      )}

      {/* Audio upload (all modes) */}
      <div className={styles.formGroup}>
        <label className={styles.label}>الصوت المخصص (اختياري)</label>
        <label className={styles.uploadBtn}>
          <input type="file" accept="audio/*" onChange={handleAudioUpload} style={{ display:'none' }} />
          🎵 رفع ملف صوتي (MP3 / AAC)
        </label>
        {customAudio && (
          <div className={styles.uploadedFile}>
            <span>🎵 {customAudio.name}</span>
            <button onClick={() => { URL.revokeObjectURL(customAudio.url); onCustomAudioChange(null); }}>✕</button>
          </div>
        )}
        <p className={styles.hintText}>⚠️ راجع الفيديو النهائي قبل نشره</p>
      </div>
    </div>
  );
}


// ── Design Tab ───────────────────────────────────────────────────
function DesignTab({ theme, fontId, fontSize, fontColor, textShadow, onThemeChange, onFontChange, onFontSizeChange, onFontColorChange, onTextShadowChange }) {
  return (
    <div className={styles.tabPanel}>
      <div className={styles.formGroup}>
        <label className={styles.label}>قالب الألوان</label>
        <div className={styles.themeGrid}>
          {COLOR_THEMES.map(t => (
            <button key={t.id} className={`${styles.themeItem} ${theme.id === t.id ? styles.selectedTheme : ''}`}
              style={{ background: t.bg, border: `2px solid ${theme.id === t.id ? t.accent : 'transparent'}` }}
              onClick={() => onThemeChange(t)} title={t.name}>
              <span style={{ color: t.accent, fontSize:'0.65rem', fontWeight:700 }}>{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>الخط</label>
        <select className={styles.selectInput} value={fontId} onChange={e => onFontChange(e.target.value)}>
          {QURAN_FONTS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <p className={styles.fontPreview} style={{ fontFamily: fontId, direction:'rtl' }}>
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>حجم الخط: {fontSize}px</label>
        <input type="range" min={22} max={72} value={fontSize} onChange={e => onFontSizeChange(+e.target.value)} className={styles.rangeSlider} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>لون الخط المخصص</label>
        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
          <input type="color" value={fontColor || theme.text || '#f5e6c8'} onChange={e => onFontColorChange(e.target.value)} style={{ width:40, height:36, border:'none', background:'none', cursor:'pointer' }} />
          {fontColor && <button className={styles.clearBtn} onClick={() => onFontColorChange('')}>إعادة تعيين</button>}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.checkItem}>
          <input type="checkbox" checked={textShadow} onChange={e => onTextShadowChange(e.target.checked)} />
          <span>ظل النص (يحسن القراءة)</span>
        </label>
      </div>
    </div>
  );
}

// ── Background Tab ────────────────────────────────────────────────
function BackgroundTab({ bgType, bgGradient, bgImage, bgVideo, bgOverlay, bgBlur, bgBrightness, isVIP, onBgTypeChange, onGradientChange, onBgImageChange, onBgVideoChange, onOverlayChange, onBlurChange, onBrightnessChange }) {
  const toast = useToast();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { toast.error('❌ الحد 15 ميجابايت'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 1920; const scale = Math.min(1, maxW / img.width);
        canvas.width = img.width * scale; canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        onBgImageChange(canvas.toDataURL('image/jpeg', 0.88));
        toast.success('✅ تم تحميل الصورة');
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) { toast.error('❌ الحد 100 ميجابايت للفيديو'); return; }
    const url = URL.createObjectURL(file);
    onBgVideoChange({ url, name: file.name });
    toast.success(`✅ تم تحميل الفيديو: ${file.name}`);
  };

  return (
    <div className={styles.tabPanel}>
      <div className={styles.formGroup}>
        <label className={styles.label}>نوع الخلفية</label>
        <div className={styles.bgTypeGrid}>
          {[
            { id:'theme',    icon:'🎨', label:'لون القالب' },
            { id:'gradient', icon:'🌈', label:'تدرج لوني' },
            { id:'image',    icon:'🖼️', label:'صورة' },
            { id:'video',    icon:'🎬', label:'فيديو' },
          ].map(t => (
            <button key={t.id} className={`${styles.bgTypeBtn} ${bgType === t.id ? styles.activeBgType : ''}`} onClick={() => onBgTypeChange(t.id)}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {bgType === 'gradient' && (
        <div className={styles.formGroup}>
          <label className={styles.label}>التدرج اللوني</label>
          <div className={styles.gradientGrid}>
            {GRADIENT_BACKGROUNDS.map(g => (
              <button key={g.id}
                className={`${styles.gradientItem} ${bgGradient?.id === g.id ? styles.selectedGradient : ''} ${!g.free && !isVIP ? styles.lockedGradient : ''}`}
                style={{ background: g.gradient }}
                onClick={() => { if (!g.free && !isVIP) { toast.warning('⭐ هذا التدرج متاح لـ VIP فقط'); return; } onGradientChange(g); }}
                title={g.name}>
                <span style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.8)' }}>{g.name}</span>
                {!g.free && !isVIP && <span className={styles.vipLock}>⭐</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {bgType === 'image' && (
        <div className={styles.formGroup}>
          <label className={styles.label}>صورة الخلفية</label>
          <label className={styles.uploadBtn}>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display:'none' }} />
            🖼️ رفع صورة (JPG, PNG, WebP)
          </label>
          {bgImage && (
            <div className={styles.bgPreview}>
              <img src={bgImage} alt="خلفية" style={{ width:'100%', borderRadius:8, maxHeight:140, objectFit:'cover' }} />
              <button className={styles.removeBtn} onClick={() => onBgImageChange(null)}>✕ إزالة</button>
            </div>
          )}
        </div>
      )}

      {bgType === 'video' && (
        <div className={styles.formGroup}>
          <label className={styles.label}>فيديو الخلفية {!isVIP && <span className={styles.vipTag}>⭐ VIP</span>}</label>
          {!isVIP ? (
            <div className={styles.vipLockBox}>⭐ خلفية الفيديو متاحة لـ VIP — <a href="/pricing">ترقية</a></div>
          ) : (
            <>
              <label className={styles.uploadBtn}>
                <input type="file" accept="video/*" onChange={handleVideoUpload} style={{ display:'none' }} />
                🎬 رفع فيديو خلفية (MP4, WebM)
              </label>
              {bgVideo && (
                <div className={styles.uploadedFile}>
                  <span>🎬 {bgVideo.name}</span>
                  <button onClick={() => onBgVideoChange(null)}>✕</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Overlay / Blur / Brightness */}
      {bgType !== 'theme' && (
        <div className={styles.formGroup}>
          <label className={styles.label}>طبقة التعتيم: {Math.round(bgOverlay * 100)}%</label>
          <input type="range" min={0} max={0.9} step={0.05} value={bgOverlay} onChange={e => onOverlayChange(+e.target.value)} className={styles.rangeSlider} />

          <label className={styles.label} style={{ marginTop:'0.75rem' }}>ضبابية: {bgBlur}px</label>
          <input type="range" min={0} max={20} step={1} value={bgBlur} onChange={e => onBlurChange(+e.target.value)} className={styles.rangeSlider} />

          <label className={styles.label} style={{ marginTop:'0.75rem' }}>السطوع: {Math.round(bgBrightness * 100)}%</label>
          <input type="range" min={0.3} max={1.5} step={0.05} value={bgBrightness} onChange={e => onBrightnessChange(+e.target.value)} className={styles.rangeSlider} />
        </div>
      )}
    </div>
  );
}

// ── Sync Tab ─────────────────────────────────────────────────────
function SyncTab({ verses, surah, audioUrls, customAudio, startVerse }) {
  const [idx, setIdx] = useState(0);
  const [syncData, setSyncData] = useState([]);
  const audioRef = useRef(null);
  const toast = useToast();

  if (!verses.length) return (
    <div className={styles.tabPanel}>
      <div className={styles.emptyState}><span>⏱️</span><p>اختر المحتوى أولاً لضبط التوقيت</p></div>
    </div>
  );

  const verse = verses[idx];
  const handleStamp = () => {
    const time = audioRef.current?.currentTime || 0;
    setSyncData(p => { const d = [...p]; d[idx] = { i: idx, t: time }; return d; });
    if (idx < verses.length - 1) { setIdx(i => i + 1); toast.info(`⏱ آية ${idx + 1}`); }
    else toast.success('✅ اكتملت المزامنة!');
  };

  return (
    <div className={styles.tabPanel}>
      <p className={styles.syncInfo}>اضغط "مزامنة" مع كل آية أثناء الاستماع</p>
      {(customAudio?.url || audioUrls[idx]) && (
        <audio ref={audioRef} src={customAudio?.url || audioUrls[idx]} controls className={styles.audioPlayer} />
      )}
      <div className={styles.currentVerse}>
        <div className={styles.verseNum}>الآية {(startVerse || 1) + idx}</div>
        <div className={styles.verseText} style={{ fontFamily:'Amiri Quran, Amiri, serif', direction:'rtl' }}>{verse?.text}</div>
      </div>
      <div className={styles.syncProgress}>
        {idx + 1} / {verses.length}
        <div className={styles.progressBarSmall}><div className={styles.progressFill} style={{ width:`${(idx/verses.length)*100}%` }}/></div>
      </div>
      <div className={styles.syncActions}>
        <button className={styles.undoBtn} onClick={() => { if(idx>0){setIdx(i=>i-1);setSyncData(p=>p.slice(0,-1));} }} disabled={idx===0}>↩ تراجع</button>
        <button className={styles.syncBtn} onClick={handleStamp}>⏱ مزامنة {idx + 1}</button>
      </div>
    </div>
  );
}
