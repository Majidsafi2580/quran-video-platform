import React from 'react';
export default class ErrorBoundary extends React.Component {
  state = { hasError:false, error:null };
  static getDerivedStateFromError(e){ return {hasError:true,error:e}; }
  componentDidCatch(e,i){ console.error('ErrorBoundary:',e,i); }
  render(){
    if(this.state.hasError) return (
      <div style={{minHeight:'100vh',background:'#0d0a04',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem',textAlign:'center'}}>
        <div>
          <div style={{fontSize:'3rem',marginBottom:'1rem'}}>⚠️</div>
          <h2 style={{color:'#f5e6c8',marginBottom:'0.5rem'}}>حدث خطأ غير متوقع</h2>
          <p style={{color:'#a39070',marginBottom:'1.5rem',fontSize:'0.875rem'}}>{this.state.error?.message}</p>
          <button onClick={()=>window.location.reload()} style={{padding:'0.7rem 1.5rem',background:'#d4a84b',color:'#0d0a04',border:'none',borderRadius:'8px',fontWeight:'700',cursor:'pointer'}}>إعادة تحميل الصفحة</button>
        </div>
      </div>
    );
    return this.props.children;
  }
}
