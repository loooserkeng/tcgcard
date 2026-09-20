import { CollectedCard, PackHistoryItem, PersonCard, UserProfile } from '../types';
import { INITIAL_CARDS } from '../data/cards';
const colKey=(id?:string)=>'pcc_collection_'+(id||'guest');
const packKey=(id?:string)=>'pcc_packs_'+(id||'guest');
const profileKey=(id?:string)=>'pcc_profile_'+(id||'guest');
const customKey='pcc_custom_cards';
function read<T>(k:string,f:T):T{try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch{return f}}
export function getAllAvailableCards():PersonCard[]{return [...INITIAL_CARDS,...read<PersonCard[]>(customKey,[])]}
export function getStoredCollection(id?:string):Record<string,CollectedCard>{return read(colKey(id),{})}
export function getStoredPackHistory(id?:string):PackHistoryItem[]{return read(packKey(id),[])}
export function getStoredProfile(id?:string):UserProfile{return read(profileKey(id),{name:'Collector',title:'Premier Collector',avatar:'',packsOpened:0,totalCardsCollected:0,level:1})}
export function updateStoredProfile(p:Partial<UserProfile>,id?:string){const n={...getStoredProfile(id),...p};localStorage.setItem(profileKey(id),JSON.stringify(n));return n}
export function addCardsToCollection(cs:PersonCard[],id?:string){const c=getStoredCollection(id);const now=new Date().toISOString();for(const card of cs)c[card.id]=c[card.id]?{...c[card.id],copies:c[card.id].copies+1,lastDiscoveredAt:now}:{cardId:card.id,card,copies:1,firstDiscoveredAt:now,lastDiscoveredAt:now};localStorage.setItem(colKey(id),JSON.stringify(c));return{updatedCollection:c}}
export function resetEntireCollection(id?:string){localStorage.removeItem(colKey(id));localStorage.removeItem(packKey(id))}
export function saveCustomCard(card:PersonCard){const a=read<PersonCard[]>(customKey,[]);localStorage.setItem(customKey,JSON.stringify([card,...a.filter(x=>x.id!==card.id)]))}
export async function createCardInSupabase(card:PersonCard){return {card,error:null as string|null}}
export async function fetchCardsCatalogFromSupabase(){return [] as PersonCard[]}
export async function fetchUserCollectionFromSupabase(id:string,_token?:string){return getStoredCollection(id)}
export async function fetchUserPacksFromSupabase(id:string){return getStoredPackHistory(id)}

export async function updateCardInSupabase(card: PersonCard){
  const cards = read<PersonCard[]>(customKey, []);
  const existsInInitial = INITIAL_CARDS.some(c => c.id === card.id);
  if (existsInInitial) return { card, error: null as string | null };
  localStorage.setItem(customKey, JSON.stringify([card, ...cards.filter(c => c.id !== card.id)]));
  return { card, error: null as string | null };
}
export async function deleteCardFromSupabase(cardId: string){
  const cards = read<PersonCard[]>(customKey, []);
  localStorage.setItem(customKey, JSON.stringify(cards.filter(c => c.id !== cardId)));
  return { error: null as string | null };
}
export async function seedInitialCardsToSupabase(){
  const cards = read<PersonCard[]>(customKey, []);
  const merged = [...cards];
  for (const card of INITIAL_CARDS) {
    if (!merged.some(c => c.id === card.id)) merged.push(card);
  }
  localStorage.setItem(customKey, JSON.stringify(merged));
  return { count: INITIAL_CARDS.length, error: null as string | null };
}
