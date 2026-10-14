import dictionary from "./fixed-ui.json";
const entries: Record<string,Partial<Record<string,string>>> = dictionary;
const normalize=(value:string)=>value.replace(/’/g,"'").replace(/\.{3}/g,'…').trim().toLowerCase();
const lookup=new Map(Object.keys(entries).map(key=>[normalize(key),key]));
export function uiTranslator(locale:string){
 return Object.assign((source:string,values:unknown[]=[]):string=>{
  const key=entries[source]?source:lookup.get(normalize(source))||source;
  const translated=entries[key]?.[locale]??source;
  return translated.replace(/\{(\d+)\}/g,(_,index:string)=>String(values[Number(index)]??`{${index}}`));
 },{locale});
}
