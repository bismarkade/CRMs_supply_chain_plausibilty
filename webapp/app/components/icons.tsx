import { BatteryCharging, Magnet, Coins, type LucideIcon } from "lucide-react";

export const MINERAL_ICON: Record<string, LucideIcon> = {
  lithium: BatteryCharging,
  rare_earths: Magnet,
  gold: Coins,
};

export function MineralIcon({
  mineral,
  className = "h-4 w-4",
}: {
  mineral: string;
  className?: string;
}) {
  const Icon = MINERAL_ICON[mineral] ?? Coins;
  return <Icon className={className} />;
}
