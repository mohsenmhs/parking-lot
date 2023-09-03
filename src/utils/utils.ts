import { expirePaidDateDuration } from "../context/constant";

export function getRandumNumber(length: number) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length);
  return Math.floor(Math.random() * (max - min) + min);
}

export function formattedDate(date: Date) {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const paidDateExired = (paidDate: number) =>
  (Date.now() - paidDate) > expirePaidDateDuration;
