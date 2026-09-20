import React, {createContext,useContext,useEffect,useMemo,useState} from 'react';
import { CooldownState, Player } from '../types';

type Mode='LOGIN'|'SIGNUP';
type AuthValue={
 player:Player|null; isAdmin:boolean; isConfigured:boolean; cooldown:CooldownState;
 isAuthModalOpen:boolean; authModalMode:Mode; openAuthModal:(m?:Mode)=>void; closeAuthModal:()=>void;
 dismissWelcomeModal:()=>void; updatePlayerState:(p:Player,c:CooldownState)=>void;
 signIn:(u:string,p:string)=>Promise<{error:string|null}>; signUp:(u:string,p:string,c:string,d:string)=>Promise<{error:string|null}>;
};
const C=createContext<AuthValue|null>(null);
const defaultCooldown=():CooldownState=>({packsAvailable:5,maxPacks:5,cooldownRemainingSeconds:0,isCooldownActive:false,cooldownUntil:null});
const key=(u:string)=>'pcc_player_'+u.toLowerCase();
function makePlayer(username:string,displayName?:string):Player{return {id:crypto.randomUUID(),username,usernameNormalized:username.toLowerCase(),displayName:displayName||username,role:'USER',createdAt:new Date().toISOString(),lastLoginAt:new Date().toISOString(),lastPackBatchAt:null,packsInCurrentBatch:0,totalPacksOpened:0,isActive:true};}
export function AuthProvider({children}:{children:React.ReactNode}){
 const [player,setPlayer]=useState<Player|null>(()=>{try{const id=localStorage.getItem('pcc_current_player'); return id?JSON.parse(localStorage.getItem('pcc_player_obj_'+id)||'null'):null}catch{return null}});
 const [cooldown,setCooldown]=useState<CooldownState>(defaultCooldown);
 const [isAuthModalOpen,setOpen]=useState(false); const [authModalMode,setMode]=useState<Mode>('LOGIN');
 useEffect(()=>{if(player){localStorage.setItem('pcc_current_player',player.id);localStorage.setItem('pcc_player_obj_'+player.id,JSON.stringify(player));}},[player]);
 useEffect(()=>{const t=setInterval(()=>{setCooldown(c=>c.cooldownRemainingSeconds>0?{...c,cooldownRemainingSeconds:Math.max(0,c.cooldownRemainingSeconds-1)}:c)},1000);return()=>clearInterval(t)},[]);
 const signIn=async(username:string,password:string)=>{if(!username||!password)return{error:'Username and password are required.'};const raw=localStorage.getItem(key(username));if(raw){setPlayer(JSON.parse(raw));return{error:null}} const p=makePlayer(username);localStorage.setItem(key(username),JSON.stringify(p));setPlayer(p);return{error:null}};
 const signUp=async(username:string,password:string,confirm:string,displayName:string)=>{if(!username||!password)return{error:'Username and password are required.'};if(password!==confirm)return{error:'Passwords do not match.'};if(localStorage.getItem(key(username)))return{error:'Username already exists.'};const p=makePlayer(username,displayName);localStorage.setItem(key(username),JSON.stringify(p));setPlayer(p);return{error:null}};
 const value=useMemo<AuthValue>(()=>({player,isAdmin:player?.role==='ADMIN',isConfigured:false,cooldown,isAuthModalOpen,authModalMode,openAuthModal:(m='LOGIN')=>{setMode(m);setOpen(true)},closeAuthModal:()=>setOpen(false),dismissWelcomeModal:()=>localStorage.setItem('pcc_welcome_seen','1'),updatePlayerState:(p,c)=>{setPlayer(p);setCooldown(c)},signIn,signUp}),[player,cooldown,isAuthModalOpen,authModalMode]);
 return <C.Provider value={value}>{children}</C.Provider>;
}
export function useAuth(){const v=useContext(C);if(!v)throw new Error('useAuth must be used inside AuthProvider');return v;}
