// Supabase stub — replace with real @supabase/supabase-js after npm install
const STUB_CLIENT = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: (cb) => { cb('INITIAL_SESSION', null); return { data: { subscription: { unsubscribe: ()=>{} } } }; },
    signUp: async () => { throw new Error('يرجى إعداد Supabase أولاً — أضف VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في .env'); },
    signInWithPassword: async () => { throw new Error('يرجى إعداد Supabase أولاً'); },
    signOut: async () => ({})
  },
  from: (table) => ({
    select: (cols, opts) => ({ eq: ()=>({single:async()=>{return {data:null,error:null};}, data:null, error:null}), gte:()=>({lte:()=>({data:[],error:null,count:0})}), order:()=>({limit:()=>({data:[],error:null})}), data:null, error:null, count:0 }),
    insert: () => ({ select: ()=>({ single: async()=>({data:null,error:null}) }) }),
    update: () => ({ eq: ()=>({ select:()=>({ single: async()=>({data:null,error:null}) }) }) }),
    upsert: async () => ({ error: null }),
    delete: () => ({ eq: async()=>({error:null}) })
  })
};
export function createClient() { return STUB_CLIENT; }
