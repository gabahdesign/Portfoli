export function LanguageFlag({ code }: { code: string }) {
 if (code === "an" || code === "oc") return <img src={code === "an" ? "/aragon-council-flag.jpg" : "/occitania-flag.svg"} alt="" aria-hidden="true" width="24" height="16" className="language-flag" style={{border:0,outline:0,boxShadow:"none",flexShrink:0,filter:"grayscale(1)",objectFit:"fill"}} />;
 const stripes = <>{[1.78,5.33,8.89,12.44].map(y=><rect key={y} y={y} width="24" height="1.78" fill="#444"/>)}</>;
 return <svg viewBox="0 0 24 16" width="24" height="16" aria-hidden="true" className="language-flag" style={{border:0,outline:0,boxShadow:"none",flexShrink:0}}>
 <rect width="24" height="16" fill="#eee"/>
 {code === "ca" ? stripes
 : code === "es" ? <><rect width="24" height="4" fill="#444"/><rect y="12" width="24" height="4" fill="#444"/></>
 : code === "fr" ? <><rect width="8" height="16" fill="#333"/><rect x="16" width="8" height="16" fill="#999"/></>
 : code === "gl" ? <path d="M0 0L24 16" stroke="#777" strokeWidth="5"/>
 : code === "ast" ? <><rect width="24" height="16" fill="#555"/><path d="M12 3V13M6 6H18" stroke="#ddd" strokeWidth="2"/></>
 : code === "eu" ? <><rect width="24" height="16" fill="#555"/><path d="M0 0L24 16M24 0L0 16" stroke="#999" strokeWidth="3"/><path d="M12 0V16M0 8H24" stroke="#fff" strokeWidth="3"/></>
 : code === "oc" ? <><rect width="24" height="16" fill="#555"/><path d="M12 3L15 6L19 8L15 10L12 13L9 10L5 8L9 6Z" fill="none" stroke="#ddd" strokeWidth="1.5"/><path d="M12 3V13M5 8H19" stroke="#ddd"/></>
 : <><rect width="24" height="16" fill="#333"/><path d="M0 0L24 16M24 0L0 16" stroke="#fff" strokeWidth="3"/><path d="M0 0L24 16M24 0L0 16" stroke="#999" strokeWidth="1"/><path d="M12 0V16M0 8H24" stroke="#fff" strokeWidth="5"/><path d="M12 0V16M0 8H24" stroke="#777" strokeWidth="3"/></>}
 </svg>;
}
