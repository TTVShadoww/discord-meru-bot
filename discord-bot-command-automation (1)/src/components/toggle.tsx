"use client";

import { motion } from "framer-motion";

export function Toggle({
  on,
  onChange,
  disabled,
}: {
  on: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`relative h-5.5 w-10 shrink-0 rounded-full border transition-colors duration-300 ${
        on ? "border-blurple/60 bg-blurple" : "border-line bg-abyss"
      } ${disabled ? "opacity-50" : "cursor-pointer hover:brightness-110"}`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow ${
          on ? "right-[3px]" : "right-[calc(100%-19px)]"
        }`}
      />
    </button>
  );
}
