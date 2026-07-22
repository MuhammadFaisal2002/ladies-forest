/** Normalize a Pakistani phone number for wa.me: 03XX... -> 923XX... */
export function waPhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `92${digits.slice(1)}`;
  else if (digits.startsWith("3")) digits = `92${digits}`;
  return digits;
}

/** wa.me link that opens a chat with the message pre-filled */
export function waLink(phone: string, message: string): string {
  return `https://wa.me/${waPhone(phone)}?text=${encodeURIComponent(message)}`;
}
