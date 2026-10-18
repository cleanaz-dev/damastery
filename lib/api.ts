// lib/api.ts

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL

export function getWebhookUrl(taskId: string): string {
  if (!BASE_URL) {
    throw new Error('NEXT_PUBLIC_APP_URL is not set')
  }
  return `${BASE_URL}/api/webhooks/system-tasks/${encodeURIComponent(taskId)}`
}