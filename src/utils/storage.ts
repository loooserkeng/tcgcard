import { CollectedCard, PackHistoryItem, PersonCard, UserProfile, DbCard } from '../types';
import { INITIAL_CARDS } from '../data/cards';
import { getSupabase, isSupabaseConfigured, mapDbCardToPersonCard, mapPersonCardToDbCard } from './supabase';

const colKey=(id?:string)=>'pcc_collection_'+(id||'guest');
const packKey=(id?:string)=>'pcc_packs_'+(id||'guest');
const profileKey=(id?:string)=>'pcc_profile_'+(id||'guest');
const customKey='pcc_custom_cards';
function read<T>(k:string,f:T):T{try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch{return f}}

export function getAllAvailableCards():PersonCard[]{return [...INITIAL_CARDS,...read<PersonCard[]>(customKey,[])].filter((c,i,a)=>a.findIndex(x=>x.id===c.id)===i)}
export function getStoredCollection(id?:string):Record<string,CollectedCard>{return read(colKey(id),{})}
export function getStoredPackHistory(id?:string):PackHistoryItem[]{return read(packKey(id),[])}
export function getStoredProfile(id?:string):UserProfile{return read(profileKey(id),{name:'Collector',title:'Premier Collector',avatar:'',packsOpened:0,totalCardsCollected:0,level:1})}
export function updateStoredProfile(p:Partial<UserProfile>,id?:string){const n={...getStoredProfile(id),...p};localStorage.setItem(profileKey(id),JSON.stringify(n));return n}

export function addCardsToCollection(cs:PersonCard[],id?:string){
 const c=getStoredCollection(id); const now=new Date().toISOString();
 for(const card of cs)c[card.id]=c[card.id]?{...c[card.id],card,copies:c[card.id].copies+1,lastDiscoveredAt:now}:{cardId:card.id,card,copies:1,firstDiscoveredAt:now,lastDiscoveredAt:now};
 localStorage.setItem(colKey(id),JSON.stringify(c)); return{updatedCollection:c};
}
export function resetEntireCollection(id?:string){localStorage.removeItem(colKey(id));localStorage.removeItem(packKey(id))}
export function saveCustomCard(card:PersonCard){const a=read<PersonCard[]>(customKey,[]);localStorage.setItem(customKey,JSON.stringify([card,...a.filter(x=>x.id!==card.id)]))}

export async function fetchCardsCatalogFromSupabase():Promise<PersonCard[]>{
 const supabase=getSupabase(); if(!supabase) return [];
 const {data,error}=await supabase.from('cards').select('*').eq('is_active',true).order('card_number');
 if(error){console.warn('Card catalog load failed:',error.message);return []}
 return (data||[]).map((row:DbCard)=>mapDbCardToPersonCard(row));
}

export async function createCardInSupabase(card:PersonCard){
 const supabase=getSupabase(); if(!supabase) return {card,error:'Supabase is not configured'};
 const {data,error}=await supabase.from('cards').insert(mapPersonCardToDbCard(card)).select('*').single();
 return {card:data?mapDbCardToPersonCard(data as DbCard):card,error:error?.message||null};
}

export async function fetchUserStateFromSupabase(id:string,token?:string){
 const supabase=getSupabase(); if(!supabase) return null;
 const {data,error}=await supabase.rpc('get_player_state',{p_player_id:id,p_session_token:token||null});
 if(error){console.warn('Player state load failed:',error.message);return null}
 return data;
}

export async function fetchUserCollectionFromSupabase(id:string,token?:string){
 if(!isSupabaseConfigured()) return getStoredCollection(id);
 const state=await fetchUserStateFromSupabase(id,token);
 if(!state?.success) return {};
 return (state.collection||{}) as Record<string,CollectedCard>;
}

export async function fetchUserPacksFromSupabase(id:string){
 if(!isSupabaseConfigured()) return getStoredPackHistory(id);
 const state=await fetchUserStateFromSupabase(id,getSavedToken());
 if(!state?.success) return [];
 return (state.packs||[]) as PackHistoryItem[];
}

function getSavedToken(){try{return (JSON.parse(localStorage.getItem('pcc_session')||'{}') as {token?:string}).token||''}catch{return ''}}

export async function updateCardInSupabase(card:PersonCard){
 const supabase=getSupabase(); if(!supabase) {saveCustomCard(card);return{card,error:null as string|null}}
 const {data,error}=await supabase.from('cards').update(mapPersonCardToDbCard(card)).eq('id',card.id).select('*').single();
 return {card:data?mapDbCardToPersonCard(data as DbCard):card,error:error?.message||null};
}
export async function deleteCardFromSupabase(cardId:string){
 const supabase=getSupabase(); if(!supabase){localStorage.setItem(customKey,JSON.stringify(read<PersonCard[]>(customKey,[]).filter(c=>c.id!==cardId)));return{error:null as string|null}}
 const {error}=await supabase.from('cards').update({is_active:false}).eq('id',cardId);
 return {error:error?.message||null};
}
export async function seedInitialCardsToSupabase(){
 const supabase=getSupabase(); if(!supabase) return {count:INITIAL_CARDS.length,error:null as string|null};
 let count=0;
 for(const card of INITIAL_CARDS){
  const {error}=await supabase.from('cards').upsert({...mapPersonCardToDbCard(card),id:card.id,is_active:true},{onConflict:'id'});
  if(!error) count++;
 }
 return {count,error:null as string|null};
}
