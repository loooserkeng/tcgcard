import { Player, CooldownState, PersonCard } from '../types';
import { generatePack } from './packGenerator';
import { addCardsToCollection } from './storage';
const SESSION='pcc_session';
export function getSavedSession(){try{return JSON.parse(localStorage.getItem(SESSION)||'{}') as {token:string}}catch{return {token:''}}}
function cooldown(p:Player):CooldownState{const now=Date.now();if(p.lastPackBatchAt){const elapsed=(now-new Date(p.lastPackBatchAt).getTime())/1000;if(elapsed<3600&&p.packsInCurrentBatch>=5){return{packsAvailable:0,maxPacks:5,cooldownRemainingSeconds:Math.ceil(3600-elapsed),isCooldownActive:true,cooldownUntil:new Date(new Date(p.lastPackBatchAt).getTime()+3600000).toISOString()}}}return{packsAvailable:Math.max(0,5-p.packsInCurrentBatch),maxPacks:5,cooldownRemainingSeconds:0,isCooldownActive:false,cooldownUntil:null}}
export async function openPackAtomic(player:Player,_packType:string){const c=cooldown(player);if(c.packsAvailable<=0)return{success:false,cooldown:c,updatedPlayer:player,cards:[] as PersonCard[],newCardsCount:0};const cards=generatePack();const updated={...player,totalPacksOpened:player.totalPacksOpened+1,packsInCurrentBatch:player.packsInCurrentBatch+1,lastPackBatchAt:player.lastPackBatchAt||new Date().toISOString()};addCardsToCollection(cards,player.id);const next=cooldown(updated);return{success:true,cooldown:next,updatedPlayer:updated,cards,newCardsCount:cards.length}};

export async function fetchAdminPlayers(_adminId: string){
  const players: Player[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('pcc_user_')) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const value = JSON.parse(raw);
      if (value && value.id) players.push(value as Player);
    }
  } catch {}
  return { players, error: null as string | null };
}
export async function adminTogglePlayerStatus(_adminId: string, targetId: string, isActive: boolean){
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('pcc_user_')) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const value = JSON.parse(raw) as Player;
      if (value.id === targetId) {
        localStorage.setItem(key, JSON.stringify({...value, isActive}));
        return { success: true, error: null as string | null };
      }
    }
  } catch {}
  return { success: false, error: 'Player not found.' };
}
export async function adminResetPassword(_adminId: string, targetId: string, _newPassword: string){
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('pcc_user_')) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const value = JSON.parse(raw) as Player;
      if (value.id === targetId) return { success: true, error: null as string | null };
    }
  } catch {}
  return { success: false, error: 'Player not found.' };
}
export async function adminResetApplication(_adminId: string, _confirmation: string){
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('pcc_user_') || key.startsWith('pcc_collection_') || key.startsWith('pcc_packs_'))) keys.push(key);
    }
    keys.forEach(key => localStorage.removeItem(key));
  } catch {}
  return { success: true, error: null as string | null };
}
