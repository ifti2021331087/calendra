import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function timeToFloat(time:string):number{
  const [hours,minitues]=time.split(":").map(Number);

  return hours+minitues/60;
}