"use client";
import {useEffect,useRef} from "react";
import type {SproutSoundName} from "@/lib/sprout-reactions";

const soundShape:Record<Exclude<SproutSoundName,null>,number[]>={achievement:[523,659,784],success:[440,659],warning:[330,262],appearance:[392,523]};
export function SproutSound({sound,enabled}:{sound:SproutSoundName;enabled:boolean}){const played=useRef(false);useEffect(()=>{if(!enabled||!sound||played.current)return;played.current=true;const AudioContextClass=window.AudioContext||window.webkitAudioContext;if(!AudioContextClass)return;const audio=new AudioContextClass();const start=audio.currentTime;const notes=soundShape[sound];notes.forEach((frequency,index)=>{const oscillator=audio.createOscillator();const gain=audio.createGain();oscillator.type="sine";oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.0001,start+index*.09);gain.gain.exponentialRampToValueAtTime(.025,start+index*.09+.015);gain.gain.exponentialRampToValueAtTime(.0001,start+index*.09+.08);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(start+index*.09);oscillator.stop(start+index*.09+.09)});const timer=window.setTimeout(()=>void audio.close(),notes.length*100+180);return()=>window.clearTimeout(timer)},[enabled,sound]);return null}

declare global{interface Window{webkitAudioContext?:typeof AudioContext}}


