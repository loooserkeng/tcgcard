const KEY='pcc_sound_enabled';
const MUSIC='pcc_music_enabled';
let master=1, music=1;
export const soundManager = {
  init(){},
  getSoundEnabled(){ return localStorage.getItem(KEY)!=='false'; },
  setSoundEnabled(v:boolean){ localStorage.setItem(KEY,String(v)); },
  getMusicEnabled(){ return localStorage.getItem(MUSIC)!=='false'; },
  setMusicEnabled(v:boolean){ localStorage.setItem(MUSIC,String(v)); },
  getMasterVolume(){ return master; }, setMasterVolume(v:number){master=v;},
  getMusicVolume(){ return music; }, setMusicVolume(v:number){music=v;},
  playButtonClick(){}, playCardFlip(){}, playCollectionAdded(){}, playPackClick(){}
};
