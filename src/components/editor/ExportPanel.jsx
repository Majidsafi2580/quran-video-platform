import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../contexts/AuthContext';
import { recordGeneration } from '../../lib/supabase';
import styles from './ExportPanel.module.css';

// Basmala: only for surahs other than 1 and 9, only on first verse
function shouldAddBasmala(showBasmala, surahNumber, verseIndex) {
  if (!showBasmala) return false;
  if (!surahNumber) return false;
  if (surahNumber === 9) return false;  // At-Tawbah
  if (surahNumber === 1) return false;  // Al-Fatiha has it as verse 1
  return verseIndex === 0;
}

function drawWatermark(ctx, w, h) {
  ctx.save();
  ctx.globalAlpha = 0.32;
  ctx.font = `bold ${Math.round(w * 0.025)}px Cairo, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.fillText('منصة القرآن للفيديو', w / 2, h * 0.96);
  ctx.restore();
}

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) { resolve(null); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function renderSlide({ ctx, w, h, verse, verseIndex, totalVerses, surah, theme, fontId, fontSize, bgImageEl, bgOverlay, showBasmala, showVerseNumber, watermark }) {
  if (bgImageEl) {
    ctx.drawImage(bgImageEl, 0, 0, w, h);
    ctx.fillStyle = `rgba(0,0,0,${bgOverlay ?? 0.55})`;
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.fillStyle = theme?.bg || '#1a1208';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = `${theme?.accent || '#d4a84b'}08`;
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 40) {
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(x+20,y); ctx.lineTo(x+40,y+20); ctx.lineTo(x+20,y+40); ctx.lineTo(x,y+20);
        ctx.closePath(); ctx.stroke();
      }
    }
  }

  const accent = theme?.accent || '#d4a84b';
  const textColor = theme?.text || '#f5e6c8';

  const grd1 = ctx.createLinearGradient(w*0.2,0,w*0.8,0);
  grd1.addColorStop(0,'transparent'); grd1.addColorStop(0.5,accent+'80'); grd1.addColorStop(1,'transparent');
  ctx.strokeStyle=grd1; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(w*0.15,h*0.08); ctx.lineTo(w*0.85,h*0.08); ctx.stroke();

  if (surah) {
    ctx.font=`bold ${Math.round(fontSize*0.32)}px Cairo,sans-serif`;
    ctx.fillStyle=accent; ctx.textAlign='center'; ctx.direction='rtl';
    ctx.fillText(`سورة ${surah.name}`, w/2, h*0.12);
  }

  let textStartY = h * 0.42;

  if (shouldAddBasmala(showBasmala, surah?.number, verseIndex)) {
    ctx.font=`${Math.round(fontSize*0.48)}px ${fontId || 'Amiri Quran'},Amiri Quran,serif`;
    ctx.fillStyle=accent; ctx.textAlign='center'; ctx.direction='rtl';
    ctx.fillText('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', w/2, h*0.22);
    textStartY = h * 0.48;
  }

  const effectiveFont = `${fontId || 'Amiri Quran'},Amiri Quran,Amiri,serif`;
  ctx.font=`${fontSize}px ${effectiveFont}`;
  ctx.fillStyle=textColor; ctx.textAlign='center'; ctx.direction='rtl';
  const maxW=w*0.84;
  const words=(verse?.text||'').split(' ');
  const lines=[]; let line='';
  for (const word of words) {
    const test=line?`${line} ${word}`:word;
    if (ctx.measureText(test).width>maxW && line) { lines.push(line); line=word; } else { line=test; }
  }
  if (line) lines.push(line);

  const lineH=fontSize*1.85;
  const totalH=lines.length*lineH;
  let y=textStartY - totalH/2 + lineH*0.5;
  for (const l of lines) { ctx.fillText(l,w/2,y); y+=lineH; }

  if (showVerseNumber && verse?.number) {
    ctx.font=`${Math.round(fontSize*0.38)}px Amiri,serif`;
    ctx.fillStyle=accent; ctx.textAlign='center';
    ctx.fillText(`﴿ ${verse.number} ﴾`, w/2, h*0.83);
  }

  const grd2=ctx.createLinearGradient(w*0.15,0,w*0.85,0);
  grd2.addColorStop(0,'transparent'); grd2.addColorStop(0.5,accent+'60'); grd2.addColorStop(1,'transparent');
  ctx.strokeStyle=grd2; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(w*0.15,h*0.89); ctx.lineTo(w*0.85,h*0.89); ctx.stroke();

  if (totalVerses>1) {
    const dotR=Math.max(3,w*0.006); const spacing=dotR*3;
    const totalDotW=totalVerses*spacing; const sx=w/2-totalDotW/2+dotR;
    for(let i=0;i<totalVerses;i++){
      ctx.beginPath(); ctx.arc(sx+i*spacing,h*0.93,dotR,0,Math.PI*2);
      ctx.fillStyle=i===verseIndex?accent:accent+'30'; ctx.fill();
    }
  }

  if (watermark) drawWatermark(ctx,w,h);
}

export default function ExportPanel({ verses=[], surah, reciter, theme, fontId, fontSize=42, bgImage, bgOverlay=0.55, showBasmala=true, showVerseNumber=true, audioUrls=[], customAudio, preset, presets, device, onPresetChange, editorType='quran' }) {
  const toast = useToast();
  const { user, canGenerate, remaining, isVIP, refreshTodayCount } = useAuth();

  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [eta, setEta] = useState('');
  const [exportDone, setExportDone] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [resultName, setResultName] = useState('');
  const cancelRef = useRef(false);
  const startTimeRef = useRef(null);

  useEffect(() => { return () => { if (resultUrl) URL.revokeObjectURL(resultUrl); }; }, [resultUrl]);

  const handleExport = useCallback(async () => {
    if (verses.length === 0) { toast.error('❌ لا توجد آيات'); return; }
    if (user && !canGenerate) {
      toast.error('⚠️ وصلت إلى الحد اليومي — قم بالترقية إلى VIP');
      return;
    }
    cancelRef.current = false;
    setExporting(true); setProgress(0); setExportDone(false); setResultUrl(null);
    startTimeRef.current = Date.now();

    try {
      const w = preset?.width || 720;
      const h = preset?.height || 1280;
      const fps = preset?.fps || 30;
      const watermark = !isVIP;

      setStatusMsg('تحميل صورة الخلفية...');
      const bgImageEl = await loadImage(bgImage);
      if (cancelRef.current) return;
      setProgress(8);

      setStatusMsg('تحميل ملفات الصوت...');
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffers = [];
      for (let i=0; i<verses.length; i++) {
        if (cancelRef.current) break;
        setProgress(8 + Math.round((i/verses.length)*25));
        const src = customAudio?.url || audioUrls[i];
        if (src) {
          try {
            const resp = await fetch(src);
            const buf = await resp.arrayBuffer();
            audioBuffers.push(await audioCtx.decodeAudioData(buf));
          } catch { audioBuffers.push(null); }
        } else { audioBuffers.push(null); }
      }
      if (cancelRef.current) { audioCtx.close(); return; }
      setProgress(33);

      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      const audioDest = audioCtx.createMediaStreamDestination();

      const mimeType = ['video/mp4','video/webm;codecs=vp9,opus','video/webm'].find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';
      const combinedStream = new MediaStream([
        ...canvas.captureStream(fps).getVideoTracks(),
        ...audioDest.stream.getAudioTracks(),
      ]);
      const recorder = new MediaRecorder(combinedStream, {
        mimeType, videoBitsPerSecond: device?.isLowEnd ? 2500000 : (isVIP ? 6000000 : 4000000), audioBitsPerSecond: 128000
      });
      const chunks = [];
      recorder.ondataavailable = e => { if(e.data?.size>0) chunks.push(e.data); };
      recorder.start(200);

      for (let i=0; i<verses.length; i++) {
        if (cancelRef.current) break;
        setProgress(33 + Math.round((i/verses.length)*57));
        setStatusMsg(`الآية ${i+1} من ${verses.length}...`);

        if (startTimeRef.current && i>0) {
          const elapsed=(Date.now()-startTimeRef.current)/1000;
          const rem2=(verses.length-i)/(i/elapsed);
          if (rem2>3) setEta(`متبقي ~${Math.round(rem2)}ث`);
        }

        renderSlide({ ctx,w,h, verse:verses[i], verseIndex:i, totalVerses:verses.length, surah, theme, fontId, fontSize, bgImageEl, bgOverlay, showBasmala, showVerseNumber, watermark });

        const buf = audioBuffers[i];
        if (buf) {
          const srcNode = audioCtx.createBufferSource();
          srcNode.buffer = buf;
          srcNode.connect(audioDest);
          srcNode.start();
          await new Promise(res => { srcNode.onended=res; setTimeout(res,(buf.duration+0.3)*1000); });
        } else {
          await new Promise(res => setTimeout(res, 4000));
        }
      }

      setStatusMsg('تجميع الفيديو...');
      setProgress(92);
      recorder.stop(); audioCtx.close();
      await new Promise(res => { recorder.onstop=res; });
      if (cancelRef.current) return;

      setProgress(97);
      const ext = mimeType.includes('mp4')?'mp4':'webm';
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const filename = `quran-${surah?.name||'video'}-${Date.now()}.${ext}`;
      setResultUrl(url); setResultName(filename);
      setProgress(100); setExportDone(true); setStatusMsg('✅ تم التصدير!');
      toast.success('✅ الفيديو جاهز للتحميل!');

      if (user) {
        try { await recordGeneration(user.id, editorType, preset?.name||'720p', verses.length*4); refreshTodayCount(); } catch {}
      }
    } catch (err) {
      if (!cancelRef.current) toast.error(`❌ ${err.message}`);
    } finally {
      if (!cancelRef.current) { setExporting(false); setEta(''); }
    }
  }, [verses,surah,preset,device,audioUrls,customAudio,bgImage,bgOverlay,theme,fontId,fontSize,showBasmala,showVerseNumber,isVIP,user,canGenerate,editorType,refreshTodayCount]);

  const handleCancel = () => { cancelRef.current=true; setExporting(false); setProgress(0); setStatusMsg(''); setEta(''); toast.info('تم الإلغاء'); };
  const handleDownload = () => { if(!resultUrl)return; const a=document.createElement('a'); a.href=resultUrl; a.download=resultName; a.click(); };
  const isEmpty = verses.length===0;

  return (
    <div className={styles.exportPanel}>
      <div className={styles.notice}><span>⚠️</span><span>راجع النص والتوقيت قبل النشر — تأكد من صحة المحتوى الديني</span></div>

      {user && (
        <div className={`${styles.limitNotice} ${!canGenerate?styles.limitExceeded:''}`}>
          {canGenerate ? `✅ متبقٍ اليوم: ${remaining} فيديو` : '⛔ وصلت للحد اليومي'}
          {!isVIP && <a href="/pricing"> — ترقية VIP</a>}
        </div>
      )}
      {!user && <div className={styles.limitNotice}>👤 <a href="/register">سجّل مجاناً</a> لتتبع حدودك اليومية</div>}

      <div className={styles.section}>
        <h4>جودة الفيديو</h4>
        <div className={styles.presetList}>
          {presets?.map(p => {
            const locked = (p.id==='fullhd' || p.id==='hd') && !isVIP;
            return (
              <button key={p.id} className={`${styles.presetBtn} ${preset?.id===p.id?styles.active:''} ${locked?styles.locked:''}`} onClick={()=>!locked&&onPresetChange(p)} disabled={exporting}>
                <div className={styles.presetName}>{p.name} {p.recommended&&<span className={styles.recBadge}>موصى</span>} {locked&&<span className={styles.vipBadge}>⭐VIP</span>}</div>
                <div className={styles.presetDesc}>{p.desc}</div>
                <div className={styles.presetSize}>{p.width}×{p.height}|{p.fps}fps</div>
              </button>
            );
          })}
        </div>
      </div>

      {!isVIP && <div className={styles.watermarkNotice}>💧 علامة مائية على الفيديو — <a href="/pricing">أزلها مع VIP</a></div>}

      {!isEmpty && (
        <div className={styles.summary}>
          {surah&&<div className={styles.summaryRow}><span>السورة</span><span>{surah.name}</span></div>}
          <div className={styles.summaryRow}><span>الآيات</span><span>{verses.length}</span></div>
          {reciter&&<div className={styles.summaryRow}><span>القارئ</span><span>{reciter.name}</span></div>}
          <div className={styles.summaryRow}><span>الجودة</span><span>{preset?.width}×{preset?.height}</span></div>
        </div>
      )}

      {exporting && (
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}><span>{statusMsg}</span><span>{progress}%</span></div>
          <div className={styles.progressBar}><div className={styles.progressFill} style={{width:`${progress}%`}}/></div>
          {eta&&<div className={styles.eta}>{eta}</div>}
          <button className={styles.cancelBtn} onClick={handleCancel}>✕ إلغاء</button>
        </div>
      )}

      {exportDone&&resultUrl&&!exporting&&(
        <div className={styles.resultSection}>
          <div className={styles.resultIcon}>✅</div>
          <p>الفيديو جاهز!</p>
          <p className={styles.resultName}>{resultName}</p>
          <button className={styles.downloadBtn} onClick={handleDownload}>⬇️ تحميل الفيديو</button>
        </div>
      )}

      {!exporting && (
        <button className={styles.exportBtn} onClick={handleExport} disabled={isEmpty||(user&&!canGenerate)}>
          {isEmpty?'❌ اختر محتوى': user&&!canGenerate?'⛔ تجاوزت الحد':'🎬 ابدأ التصدير'}
        </button>
      )}

      <div className={styles.tips}>
        <h4>💡 نصائح</h4>
        <ul>
          <li>الصوت مضمّن فعلياً في الفيديو النهائي</li>
          <li>للريلز والشورتس: 720p أو 1080p أفضل</li>
          <li>إذا تعطّل التصدير: قلّل الآيات وأعد المحاولة</li>
        </ul>
      </div>
    </div>
  );
}
