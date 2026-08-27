"use client";
import { useState } from "react";
import { Check, LockKeyhole, LoaderCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarAccessory, AvatarCharacter, AvatarColour, GrowMascot } from "@/components/grow-mascot";

const characters: { id: AvatarCharacter; name: string; note: string }[] = [
  { id: "SPROUT", name: "Sprout", note: "Curious and bright" }, { id: "EMBER", name: "Ember", note: "Bold and warm" }, { id: "PIP", name: "Pip", note: "Calm and kind" }, { id: "NOVA", name: "Nova", note: "Playful and brave" },
];
const colours: { id: AvatarColour; name: string }[] = [{ id: "MINT", name: "Mint" }, { id: "OCEAN", name: "Ocean" }, { id: "BERRY", name: "Berry" }, { id: "SUNSET", name: "Sunset" }];
const accessories: { id: AvatarAccessory; name: string; xp: number }[] = [{ id: "NONE", name: "None", xp: 0 }, { id: "GLASSES", name: "Glasses", xp: 0 }, { id: "HEADPHONES", name: "Headphones", xp: 250 }, { id: "BACKPACK", name: "Backpack", xp: 500 }, { id: "SCARF", name: "Scarf", xp: 750 }, { id: "GRADUATION_CAP", name: "Grad cap", xp: 1000 }];

export function AvatarPicker({ initial, xp }: { initial: { character: string; colourVariant: string; accessory: string } | null; xp: number }) {
  const [character, setCharacter] = useState<AvatarCharacter>((initial?.character as AvatarCharacter) || "SPROUT");
  const [colour, setColour] = useState<AvatarColour>((initial?.colourVariant as AvatarColour) || "MINT");
  const [accessory, setAccessory] = useState<AvatarAccessory>((initial?.accessory as AvatarAccessory) || "NONE");
  const [busy, setBusy] = useState(false); const [saved, setSaved] = useState(false); const [error, setError] = useState("");
  async function save() { setBusy(true); setSaved(false); setError(""); const response = await fetch("/api/profile/avatar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ character, colourVariant: colour, accessory }) }); const body = await response.json(); if (response.ok) setSaved(true); else setError(body.error || "Your character could not be saved."); setBusy(false); }
  return <div className="avatar-picker">
    <div className="avatar-preview"><GrowMascot state="welcome" character={character} colour={colour} accessory={accessory}/><p>Characters are just for expression. They never represent wealth, ability or financial success.</p></div>
    <fieldset><legend>Choose your GROW character</legend><div className="character-options">{characters.map(item=><button type="button" key={item.id} onClick={()=>setCharacter(item.id)} className={character===item.id?"selected":""} aria-pressed={character===item.id}><span className={`character-dot character-${item.id.toLowerCase()}`}>{item.name[0]}</span><strong>{item.name}</strong><small>{item.note}</small>{character===item.id&&<Check/>}</button>)}</div></fieldset>
    <fieldset><legend>Colour variation</legend><div className="colour-options">{colours.map(item=><button type="button" key={item.id} onClick={()=>setColour(item.id)} className={colour===item.id?"selected":""} aria-label={`${item.name} colour`} aria-pressed={colour===item.id}><i data-colour={item.id}/><span>{item.name}</span></button>)}</div></fieldset>
    <fieldset><legend>Learning accessories</legend><div className="accessory-options">{accessories.map(item=>{const locked=item.xp>xp;return <button type="button" key={item.id} disabled={locked} onClick={()=>setAccessory(item.id)} className={accessory===item.id?"selected":""} aria-pressed={accessory===item.id}><span>{locked?<LockKeyhole/>:accessory===item.id?<Check/>:null}</span><strong>{item.name}</strong><small>{locked?`${item.xp} XP`:"Unlocked"}</small></button>})}</div></fieldset>
    {error&&<p className="inline-error" role="alert">{error}</p>}<Button onClick={save} disabled={busy} className="avatar-save">{busy?<LoaderCircle className="spin"/>:saved?<Check/>:<Save/>}{busy?"Saving…":saved?"Character saved":"Save my character"}</Button>
  </div>;
}

