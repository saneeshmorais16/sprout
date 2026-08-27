"use client";
import {useEffect,useState} from "react";
import {Bell,Check,EyeOff,LoaderCircle,LockKeyhole,Volume2} from "lucide-react";
type PreferenceKey="notifications"|"privacyMode"|"sprigSounds";
export function ProfilePreferences({notifications:initialNotifications,privacyMode:initialPrivacy,sprigSounds:initialSproutSounds=false}:{notifications:boolean;privacyMode:string;sprigSounds?:boolean}){
  const[notifications,setNotifications]=useState(initialNotifications);const[privacyMode,setPrivacyMode]=useState(initialPrivacy);const[sprigSounds,setSproutSounds]=useState(initialSproutSounds);const[busy,setBusy]=useState("");const[saved,setSaved]=useState("");
  useEffect(()=>{fetch("/api/profile/preferences",{cache:"no-store"}).then(response=>response.ok?response.json():null).then(data=>{if(data?.sprigSounds!==undefined)setSproutSounds(Boolean(data.sprigSounds))}).catch(()=>undefined)},[]);
  async function update(key:PreferenceKey,value:boolean|string){setBusy(key);setSaved("");const response=await fetch("/api/profile/preferences",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({[key]:value})});if(response.ok){if(key==="notifications")setNotifications(Boolean(value));else if(key==="sprigSounds")setSproutSounds(Boolean(value));else setPrivacyMode(String(value));setSaved(key)}setBusy("")}
  return <div className="preference-list">
    <div><Bell/><div><strong>Learning reminders</strong><small>Show gentle in-product reminder preferences.</small></div><button className={`toggle ${notifications?"on":""}`} onClick={()=>update("notifications",!notifications)} disabled={Boolean(busy)} aria-pressed={notifications} aria-label="Toggle learning reminders">{busy==="notifications"?<LoaderCircle className="spin"/>:saved==="notifications"?<Check/>:<i/>}</button></div>
    <div><Volume2/><div><strong>Sprout sounds</strong><small>Optional quiet cues. Off by default.</small></div><button className={`toggle ${sprigSounds?"on":""}`} onClick={()=>update("sprigSounds",!sprigSounds)} disabled={Boolean(busy)} aria-pressed={sprigSounds} aria-label="Toggle Sprout sounds">{busy==="sprigSounds"?<LoaderCircle className="spin"/>:saved==="sprigSounds"?<Check/>:<i/>}</button></div>
    <div><LockKeyhole/><div><strong>Privacy view</strong><small>Choose how much detail appears on shared demo screens.</small></div><select value={privacyMode} onChange={event=>update("privacyMode",event.target.value)} disabled={Boolean(busy)} aria-label="Privacy view"><option value="STANDARD">Standard</option><option value="MINIMAL">Minimal</option></select></div>
    <p><EyeOff/> Preferences are stored with your profile. GROW does not sell learning activity or financial simulation data.</p>
  </div>;
}

