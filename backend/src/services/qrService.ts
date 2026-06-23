import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface QRPayload {
  registrationId: string;
  eventId: string;
  tenantId: string;
}

export async function generateQRCode(payload: QRPayload, eventEndDate: Date): Promise<string> {
  const expiration = new Date(eventEndDate.getTime() + 24 * 60 * 60 * 1000);
  
  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: Math.floor((expiration.getTime() - Date.now()) / 1000),
  });
  
  const qrDataUrl = await QRCode.toDataURL(token, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
  
  return qrDataUrl;
}

export function verifyQRToken(token: string): QRPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as QRPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
