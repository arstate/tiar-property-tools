"use client";

import React from "react";
import { Icon } from "@iconify/react";

interface IconifyIconProps {
  icon: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  inline?: boolean;
}

/**
 * Universal Iconify Component:
 * Renders icons from any Iconify set (e.g. "solar:calculator-linear", "ph:pencil-simple", "fluent-emoji:house")
 * with local fallback support.
 */
export function IconifyIcon({
  icon,
  className = "w-5 h-5",
  width,
  height,
  inline = false,
}: IconifyIconProps) {
  return (
    <Icon
      icon={icon}
      className={className}
      width={width}
      height={height}
      inline={inline}
    />
  );
}
