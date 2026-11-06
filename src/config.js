/**
 * Configuration and environment variable loader
 */
export const config = {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  country: process.env.EPIC_COUNTRY || 'VN',
  locale: process.env.EPIC_LOCALE || 'vi-VN',
  // Set to true to print message to console instead of throwing if Telegram credentials are missing
  dryRun: process.env.DRY_RUN === 'true'
};

export function validateConfig() {
  const errors = [];
  if (!config.telegramBotToken && !config.dryRun) {
    errors.push('TELEGRAM_BOT_TOKEN is required');
  }
  if (!config.telegramChatId && !config.dryRun) {
    errors.push('TELEGRAM_CHAT_ID is required');
  }
  if (errors.length > 0) {
    throw new Error(`Configuration error:\n- ${errors.join('\n- ')}`);
  }
}

