import { Player, CooldownState, PersonCard } from '../types';
import { generatePack } from './packGenerator';
import { addCardsToCollection } from './storage';
import { getSupabase, isSupabaseConfigured } from './supabase';

const SESSION='pcc_session';
export function getSavedSession(){try{return JSON.parse(localStorage.getItem(SESSION)||'{}') as {token:string}}catch{return {token:''}}}
function localCooldown(p:Player):CooldownState{
 const now=Date.now(); if(p.lastPackBatchAt){const elapsed=(now-new Date(p.lastPackBatchAt).getTime())/1000;if(elapsed<3600&&p.packsInCurrentBatch>=1)return{packsAvailable:0,maxPacks:1,cooldownRemainingSeconds:Math.ceil(3600-elapsed),isCooldownActive:true,cooldownUntil:new Date(new Date(p.lastPackBatchAt).getTime()+3600000).toISOString()}}
 return{packsAvailable:Math.max(0,1-p.packsInCurrentBatch),maxPacks:1,cooldownRemainingSeconds:0,isCooldownActive:false,cooldownUntil:null}
}
function mapPlayer(raw:any,fallback:Player):Player{
 return {...fallback,id:raw.id||fallback.id,username:raw.username||fallback.username,usernameNormalized:(raw.username||fallback.username).toLowerCase(),displayName:raw.displayName??raw.display_name??fallback.displayName,role:raw.role||fallback.role,createdAt:raw.createdAt||raw.created_at||fallback.createdAt,lastLoginAt:raw.lastLoginAt||raw.last_login_at||fallback.lastLoginAt,lastPackBatchAt:raw.lastPackBatchAt??raw.last_pack_batch_at??null,packsInCurrentBatch:raw.packsInCurrentBatch??raw.packs_in_current_batch??0,totalPacksOpened:raw.totalPacksOpened??raw.total_packs_opened??0,isActive:raw.isActive??raw.is_active??true};
}
function mapCooldown(raw:any):CooldownState{
 const remaining=Number(raw?.cooldownRemainingSeconds??0);
 return{packsAvailable:Number(raw?.packsAvailable??1),maxPacks:1,cooldownRemainingSeconds:remaining,isCooldownActive:remaining>0,cooldownUntil:remaining>0?new Date(Date.now()+remaining*1000).toISOString():null};
}
export async function openPackAtomic(player:Player,packType:string){
 if(isSupabaseConfigured()){
  const supabase=getSupabase(); const token=getSavedSession().token;
  const {data,error}=await supabase!.rpc('open_pack',{p_player_id:player.id,p_pack_type:packType,p_session_token:token||null});
  if(error)return{success:false,error:error.message,cooldown:localCooldown(player),updatedPlayer:player,cards:[] as PersonCard[],newCardsCount:0};
  if(!data?.success)return{success:false,error:data?.message||data?.error||'Unable to open pack',cooldown:mapCooldown(data),updatedPlayer:player,cards:[] as PersonCard[],newCardsCount:0};
  const updated=mapPlayer(data.player||{}, {...player,totalPacksOpened:Number(data.totalPacksOpened??player.totalPacksOpened+1)});
  return{success:true,cooldown:mapCooldown(data),updatedPlayer:updated,cards:(data.cards||[]) as PersonCard[],newCardsCount:Number(data.newCardsCount??0)};
 }
 const c=localCooldown(player); if(c.packsAvailable<=0)return{success:false,cooldown:c,updatedPlayer:player,cards:[] as PersonCard[],newCardsCount:0};
 const cards=generatePack(); const updated={...player,totalPacksOpened:player.totalPacksOpened+1,packsInCurrentBatch:1,lastPackBatchAt:new Date().toISOString()};
 addCardsToCollection(cards,player.id); return{success:true,cooldown:localCooldown(updated),updatedPlayer:updated,cards,newCardsCount:cards.filter((x,i)=>i===cards.findIndex(y=>y.id===x.id)).length};
}
export async function fetchAdminPlayers(adminId:string){
 const supabase=getSupabase(); if(isSupabaseConfigured()&&supabase){const {data,error}=await supabase.rpc('admin_get_players',{p_admin_id:adminId,p_session_token:getSavedSession().token||null});return{players:data?.players||[],error:error?.message||data?.error||null}}
 const players:Player[]=[]; try{for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(!key||!key.startsWith('pcc_user_'))continue;const raw=localStorage.getItem(key);if(raw){const value=JSON.parse(raw);if(value?.id)players.push(value)}}}catch{} return{players,error:null as string|null};
}
export async function adminTogglePlayerStatus(adminId:string,targetId:string,isActive:boolean){
 const supabase=getSupabase(); if(isSupabaseConfigured()&&supabase){const {data,error}=await supabase.rpc('admin_toggle_player_status',{p_admin_id:adminId,p_target_player_id:targetId,p_is_active:isActive,p_session_token:getSavedSession().token||null});return{success:!!data?.success,error:error?.message||data?.error||null}}
 return{success:false,error:'Local administrator controls are unavailable.'};
}
export async function adminResetPassword(adminId:string,targetId:string,newPassword:string){
 const supabase=getSupabase(); if(isSupabaseConfigured()&&supabase){const {data,error}=await supabase.rpc('admin_reset_player_password',{p_admin_id:adminId,p_target_player_id:targetId,p_new_password:newPassword,p_session_token:getSavedSession().token||null});return{success:!!data?.success,error:error?.message||data?.error||null}}
 return{success:false,error:'Local administrator controls are unavailable.'};
}
export async function adminResetApplication(adminId:string,confirmation:string){
 const supabase=getSupabase(); if(isSupabaseConfigured()&&supabase){const {data,error}=await supabase.rpc('admin_reset_application',{p_admin_id:adminId,p_confirmation_code:confirmation,p_session_token:getSavedSession().token||null});return{success:!!data?.success,error:error?.message||data?.error||null}}
 return{success:false,error:'Local administrator controls are unavailable.'};
}
