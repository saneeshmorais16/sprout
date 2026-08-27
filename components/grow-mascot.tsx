import Image from "next/image";
import { Award, Backpack, CircleEllipsis, Flame, Glasses, GraduationCap, Headphones, Lightbulb, PartyPopper, Pause, Ribbon, ShieldAlert, Sparkles, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export type MascotState = "welcome" | "learning" | "celebrating" | "thinking" | "warning" | "streak" | "achievement" | "goal" | "idle" | "greeting" | "explaining" | "encouraging" | "surprised" | "reflecting";
export type AvatarCharacter = "SPROUT" | "SPRIG" | "EMBER" | "PIP" | "NOVA";
export type AvatarColour = "MINT" | "OCEAN" | "BERRY" | "SUNSET";
export type AvatarAccessory = "NONE" | "GLASSES" | "HEADPHONES" | "BACKPACK" | "SCARF" | "GRADUATION_CAP";

const stateIcons = { welcome: Sparkles, learning: Lightbulb, celebrating: PartyPopper, thinking: Lightbulb, warning: ShieldAlert, streak: Flame, achievement: Award, goal: Target, idle:Pause, greeting:Sparkles, explaining:Lightbulb, encouraging:Target, surprised:CircleEllipsis, reflecting:Lightbulb };
const accessoryIcons = { GLASSES: Glasses, HEADPHONES: Headphones, BACKPACK: Backpack, SCARF: Ribbon, GRADUATION_CAP: GraduationCap };
const names: Record<AvatarCharacter, string> = { SPROUT: "Sprout", SPRIG: "Sprout", EMBER: "Ember", PIP: "Pip", NOVA: "Nova" };

export function GrowMascot({ state = "welcome", character = "SPROUT", colour = "MINT", accessory = "NONE", message, compact = false, className }: { state?: MascotState; character?: AvatarCharacter; colour?: AvatarColour; accessory?: AvatarAccessory; message?: string; compact?: boolean; className?: string }) {
  const StateIcon = stateIcons[state];
  const AccessoryIcon = accessory === "NONE" ? null : accessoryIcons[accessory];
  return <div className={cn("grow-mascot", compact && "compact", className)} data-state={state} data-character={character} data-colour={colour}>
    <div className="mascot-portrait">
      <span className="mascot-halo" aria-hidden="true"/>
      <Image src="/grow-sprout.png" width={300} height={300} sizes={compact ? "72px" : "160px"} alt={`${names[character]}, your GROW financial-learning companion, feeling ${state}`} loading="eager"/>
      <span className="mascot-state" aria-hidden="true"><StateIcon/></span>
      {AccessoryIcon&&<span className="mascot-accessory" aria-label={`${accessory.toLowerCase().replaceAll("_", " ")} accessory`}><AccessoryIcon/></span>}
    </div>
    {message&&<p className="mascot-message"><strong>{names[character]} says</strong>{message}</p>}
  </div>;
}

