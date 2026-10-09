export function LanguageFlag({ code }: { code: string }) {
  return <svg viewBox="0 0 24 16" width="24" height="16" aria-hidden="true" className="language-flag">
    {code === "ca" ? <><rect width="24" height="16" fill="#eee"/>{[1.78,5.33,8.89,12.44].map(y=><rect key={y} y={y} width="24" height="1.78" fill="#444"/>)}</>
      : code === "es" ? <><rect width="24" height="16" fill="#444"/><rect y="4" width="24" height="8" fill="#ddd"/></>
      : code === "fr" ? <><rect width="24" height="16" fill="#999"/><rect width="8" height="16" fill="#333"/><rect x="8" width="8" height="16" fill="#fff"/></>
      : <><rect width="24" height="16" fill="#333"/><path d="M0 0L24 16M24 0L0 16" stroke="#fff" strokeWidth="3"/><path d="M0 0L24 16M24 0L0 16" stroke="#999" strokeWidth="1"/><path d="M12 0V16M0 8H24" stroke="#fff" strokeWidth="5"/><path d="M12 0V16M0 8H24" stroke="#777" strokeWidth="3"/></>}
  </svg>;
}
