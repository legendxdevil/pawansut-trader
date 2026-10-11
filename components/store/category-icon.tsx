import React from "react";
import {
  Zap,
  PlugZap,
  Cable,
  Headphones,
  BatteryCharging,
  Smartphone,
  ShieldCheck,
  MemoryStick,
  HardDrive,
  Watch,
  Speaker,
  Dock,
  Package,
  type LucideIcon,
} from "lucide-react";
import type { CategoryIconKey } from "@/types";

export const CATEGORY_ICON_MAP: Record<CategoryIconKey, LucideIcon> = {
  Zap,
  PlugZap,
  Cable,
  Headphones,
  BatteryCharging,
  Smartphone,
  ShieldCheck,
  MemoryStick,
  HardDrive,
  Watch,
  Speaker,
  Dock,
  Package,
};

interface CategoryIconProps {
  iconName?: string;
  size?: number;
  className?: string;
}

export function CategoryIcon({
  iconName,
  size = 28,
  className = "",
}: CategoryIconProps) {
  const IconComponent =
    (iconName && CATEGORY_ICON_MAP[iconName as CategoryIconKey]) || Package;

  return <IconComponent size={size} className={className} />;
}
