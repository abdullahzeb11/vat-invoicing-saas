import QRCode from "qrcode";

export interface ZatcaTlvInput {
  sellerName: string;
  vatNumber: string;
  timestamp: string;
  total: number;
  vat: number;
}

export function buildZatcaTlvBase64(input: ZatcaTlvInput): string {
  const fields = [
    encodeTlv(1, input.sellerName),
    encodeTlv(2, input.vatNumber),
    encodeTlv(3, input.timestamp),
    encodeTlv(4, input.total.toFixed(2)),
    encodeTlv(5, input.vat.toFixed(2)),
  ];
  return Buffer.concat(fields).toString("base64");
}

export async function buildZatcaQrDataUrl(input: ZatcaTlvInput): Promise<string> {
  const payload = buildZatcaTlvBase64(input);
  return QRCode.toDataURL(payload, { width: 220, margin: 1 });
}

function encodeTlv(tag: number, value: string): Buffer {
  const v = Buffer.from(value, "utf-8");
  return Buffer.concat([Buffer.from([tag, v.length]), v]);
}
