import React, { useRef, useState, useEffect, useCallback } from 'react';
import styles from './EditorPreview.module.css';

const BASMALA = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

function shouldShowBasmala(show, surahNum, idx) {
  if (!show) return false;
  if (!surahNum) return false;
  if (surahNum === 9) return false;
  if (surahNum === 1) return false;
  return idx === 0;
}

export default function EditorPreview({ verses=[], surah, reciter, theme, fontId, fontSize=42, fontColor, textShadow, bgType='theme', bgImage, bgGradient, bgOverlay=0.55, bgBlur=0, bgBrightness=1, showBasmala=true, showVerseNumber=true, showSurahName=true, showReciterName=false, audioUrls=[], customAudio, preset, hadithSource, mode='quran' }) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [audioErr, setAudioErr] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => { setIdx(0); setPlaying(false); setAudioErr(false); }, [verses.length, surah?.number]);

  const cur = verses[idx];
  const audioSrc = customAudio?.url || audioUrls[idx] || '';
  const textColor = fontColor || theme?.text || '#f5e6c8';
  const accent = theme?.accent || '#d4a84b';

  const getBgStyle = () => {
    if (bgType === 'image' && bgImage) return { backgroundImage:`url(${bgImage})`, backgroundSize:'cover', backgroundPosition:'center', filter:`blur(${bgBlur}px) brightness(${bgBrightness})` };
    if (bgType === 'gradient' && bgGradient) return { background:bgGradient.gradient };
    if (bgType === 'video') return { background: '#000' };
    return { background: theme?.bg || '#1a1208' };
  };

  const shadowStyle = textShadow ? { textShadow:'0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)' } : {};

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.liveLabel}>معاينة حية</span>
        {preset && <span className={styles.presetBadge}>{preset.name}</span>}
      </div>

      <div className={styles.scroller}>
        <div className={styles.phoneMock}>
          <div className={styles.phoneScreen}>
            {/* Slide */}
            <div className={styles.slide} style={{ background: theme?.bg || '#1a1208' }}>
              {/* Background layer */}
              <div className={styles.bgLayer} style={getBgStyle()} />
              {/* Overlay */}
              {(bgType === 'image' || bgType === 'video') && (
                <div className={styles.overlayLayer} style={{ background:`rgba(0,0,0,${bgOverlay})` }} />
              )}

              {/* Content */}
              <div className={styles.content}>
                {/* Top deco */}
                <div className={styles.topDeco} style={{ borderColor: accent + '50' }} />

                {/* Surah name */}
                {showSurahName && surah && (
                  <div className={styles.surahName} style={{ color: accent, ...shadowStyle }}>
                    سورة {surah.name}
                  </div>
                )}

                {/* Basmala */}
                {cur && shouldShowBasmala(showBasmala, surah?.number, idx) && (
                  <div className={styles.basmala} style={{ fontFamily:`${fontId}, Amiri Quran, serif`, color: accent, ...shadowStyle }}>
                    {BASMALA}
                  </div>
                )}

                {/* Verse / Text */}
                {cur ? (
                  <div className={styles.verseText} style={{ fontFamily:`${fontId}, Amiri Quran, Amiri, serif`, fontSize: `${Math.max(16, Math.min(fontSize * 0.45, 32))}px`, color: textColor, ...shadowStyle, direction:'rtl' }}>
                    {cur.text}
                  </div>
                ) : (
                  <div className={styles.placeholder}>
                    <span>📖</span>
                    <p>اختر المحتوى لرؤية المعاينة</p>
                  </div>
                )}

                {/* Verse number */}
                {showVerseNumber && cur?.number && (
                  <div className={styles.verseNum} style={{ color: accent, ...shadowStyle }}>﴿ {cur.number} ﴾</div>
                )}

                {/* Hadith source */}
                {hadithSource && mode === 'sunnah' && (
                  <div className={styles.hadithSource} style={{ color: accent, ...shadowStyle }}>{hadithSource}</div>
                )}

                {/* Reciter */}
                {showReciterName && reciter && (
                  <div className={styles.reciterName} style={{ color: accent + 'cc', ...shadowStyle }}>{reciter.name}</div>
                )}

                {/* Bottom deco */}
                <div className={styles.bottomDeco} style={{ borderColor: accent + '50' }} />

                {/* Dots */}
                {verses.length > 1 && (
                  <div className={styles.dots}>
                    {verses.map((_, i) => (
                      <div key={i} className={styles.dot} style={{ background: i === idx ? accent : accent + '40', width: i === idx ? 14 : 6 }} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Player bar */}
            {verses.length > 0 && (
              <div className={styles.playerBar}>
                <button className={styles.navBtn} onClick={() => { setIdx(i=>Math.max(0,i-1)); setPlaying(false); }} disabled={idx===0}>‹</button>
                <button className={styles.playBtn} onClick={() => {
                  if (playing) { audioRef.current?.pause(); setPlaying(false); }
                  else { audioRef.current?.play().catch(()=>setAudioErr(true)); setPlaying(true); }
                }}>
                  {playing ? '⏸' : '▶'}
                </button>
                <button className={styles.navBtn} onClick={() => { setIdx(i=>Math.min(verses.length-1,i+1)); setPlaying(false); }} disabled={idx===verses.length-1}>›</button>
                <span className={styles.counter}>{idx+1}/{verses.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {audioSrc && (
        <audio ref={audioRef} src={audioSrc} onEnded={() => { if(idx<verses.length-1){setIdx(i=>i+1);}else{setPlaying(false);} }} onError={()=>setAudioErr(true)} />
      )}
      {audioErr && <p className={styles.audioErr}>⚠️ تعذّر تحميل الصوت</p>}
    </div>
  );
}
