# 🕌 منصة القرآن للفيديو v2.0

منصة احترافية لإنشاء فيديوهات قرآنية وإسلامية مناسبة للريلز وتيك توك ويوتيوب شورتس.

## 🚀 تشغيل المشروع

```bash
# 1. تثبيت الحزم
npm install

# 2. إعداد المتغيرات
cp .env.example .env
# عدّل .env وأضف مفاتيح Supabase

# 3. تشغيل بيئة التطوير
npm run dev

# 4. بناء للإنتاج
npm run build
```

## ⚙️ ربط Supabase

1. اذهب إلى [supabase.com](https://supabase.com) وأنشئ مشروعاً جديداً
2. من **SQL Editor** شغّل ملف `supabase.sql` كاملاً
3. من **Settings → API** انسخ:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
4. أضفهم في ملف `.env`

## 👑 تحويل مستخدم إلى Admin

بعد تسجيله في المنصة، شغّل في Supabase SQL Editor:

```sql
UPDATE profiles 
SET role = 'admin', daily_limit = 9999
WHERE email = 'your@email.com';
```

## 🌐 النشر

### Vercel
```bash
npx vercel --prod
# أضف متغيرات البيئة في Vercel Dashboard
```

### Netlify
```bash
npm run build
# ارفع مجلد dist/ أو اربط الـ repo
# أضف متغيرات البيئة في Netlify Dashboard
```

## 📁 هيكل المشروع

```
src/
├── App.jsx                    # المسارات الرئيسية
├── contexts/AuthContext.jsx   # حالة المصادقة العالمية
├── lib/supabase.js            # Supabase client + helpers
├── components/
│   ├── editor/
│   │   ├── VideoEditor.jsx    # المحرر الرئيسي (tabs)
│   │   ├── EditorPreview.jsx  # معاينة حية على شكل هاتف
│   │   └── ExportPanel.jsx    # تصدير فيديو مع صوت
│   └── shared/
│       ├── Navbar.jsx
│       ├── Footer.jsx
│       └── ToastProvider.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── QuranEditorPage.jsx
│   ├── SunnahEditorPage.jsx
│   ├── CustomEditorPage.jsx
│   ├── DashboardPage.jsx
│   ├── PricingPage.jsx
│   ├── AdminPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── AboutPage.jsx
│   ├── ContactPage.jsx
│   ├── PrivacyPage.jsx
│   ├── TermsPage.jsx
│   └── NotFoundPage.jsx
├── data/surahs.js             # السور + القراء + الخطوط + الأقسام
├── utils/quranApi.js          # API الآيات وروابط الصوت
└── hooks/
    ├── useToast.js
    └── useDevice.js
```

## 🎬 كيف يعمل التصدير

1. يُرسم كل شريحة (آية/جملة) على `<canvas>`
2. الصوت يُحمَّل مسبقاً كـ `AudioBuffer`
3. يُدمج الفيديو والصوت في `MediaRecorder`
4. يُخرج ملف MP4/WebM مع صوت حقيقي داخله

## 💡 ملاحظات مهمة

- البسملة: لا تُضاف تلقائياً لسورة الفاتحة (هي آية 1) ولا لسورة التوبة
- الجودة: 720p للخطة المجانية، 1080p لـ VIP
- العلامة المائية: تظهر تلقائياً في الخطة المجانية
- الصوت: يجب أن يكون متاحاً على everyayah.com أو ملف مرفوع
