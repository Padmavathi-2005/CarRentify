"use client"

import * as React from "react"

export interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export default function Switch({ className, checked, onCheckedChange, ...props }: SwitchProps) {
  const isChecked = checked ?? false;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onCheckedChange?.(!isChecked);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      data-state={isChecked ? "checked" : "unchecked"}
      onClick={handleClick}
      className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${isChecked ? 'bg-primary' : 'bg-slate-200'} ${className || ''}`}
      {...props}
    >
      <span
        data-state={isChecked ? "checked" : "unchecked"}
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${isChecked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  )
}

Switch.displayName = "Switch"
