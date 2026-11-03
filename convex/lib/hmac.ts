export const SIGNATURE_HEADER = "X-LendLoop-Signature";

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function signPayload(
  secret: string,
  body: string,
): Promise<string> {
  return hmacSha256Hex(secret, body);
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const left = a.trim().toLowerCase();
  const right = b.trim().toLowerCase();
  if (left.length !== right.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return diff === 0;
}

export async function verifySignature(
  secret: string,
  body: string,
  signatureHeader: string | null,
): Promise<boolean> {
  if (!secret || !signatureHeader?.trim()) {
    return false;
  }
  const expected = await signPayload(secret, body);
  return timingSafeEqualHex(expected, signatureHeader);
}
