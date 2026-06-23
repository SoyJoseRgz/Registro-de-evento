import { env } from '../config/env';

interface WhaConnectPayload {
  to: string;
  message: string;
  templateName?: string;
  templateParams?: Record<string, string>;
}

interface WhaConnectResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendWhatsAppMessage(payload: WhaConnectPayload): Promise<WhaConnectResponse> {
  if (!env.WHACONNECT_WEBHOOK_URL) {
    console.warn('WhaConnect webhook URL not configured');
    return { success: false, error: 'WhaConnect not configured' };
  }

  try {
    const response = await fetch(env.WHACONNECT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.WHACONNECT_API_KEY}`,
      },
      body: JSON.stringify({
        phone: payload.to,
        message: payload.message,
        template: payload.templateName ? {
          name: payload.templateName,
          params: payload.templateParams,
        } : undefined,
      }),
    });

    const data = await response.json() as { error?: string; messageId?: string };

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to send message' };
    }

    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error('WhaConnect error:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function sendRegistrationConfirmation(
  phone: string,
  eventName: string,
  eventDate: string
): Promise<WhaConnectResponse> {
  const message = `Te has registrado exitosamente en: ${eventName}\nFecha: ${eventDate}\n\nGuarda tu codigo QR para el check-in.`;
  
  return sendWhatsAppMessage({
    to: phone,
    message,
  });
}

export async function sendEventReminder(
  phone: string,
  eventName: string,
  eventDate: string
): Promise<WhaConnectResponse> {
  const message = `Recordatorio: ${eventName}\nManana a las ${eventDate}\n\nTe esperamos!`;
  
  return sendWhatsAppMessage({
    to: phone,
    message,
  });
}
