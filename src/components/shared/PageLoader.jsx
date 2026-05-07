import React from 'react';
export default function PageLoader() {
  return (
    <div style={{minHeight:'100vh',background:'#0d0a04',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'1rem'}}>
      <div style={{width:40,height:40,border:'3px solid rgba(212,168,75,0.2)',borderTopColor:'#d4a84b',borderRadius:'50%',animation:'spin 0.8s linear infinite'}} />
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
