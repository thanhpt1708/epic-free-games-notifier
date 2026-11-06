/**
 * Main application entrypoint
 */
import { config, validateConfig } from './config.js';
import { fetchFreeGames } from './epic.js';
import { notifyFreeGames } from './telegram.js';

async function main() {
  console.log(`[START] Epic Games Free Games Notifier`);
  console.log(`[INFO] Current time: ${new Date().toISOString()}`);

  validateConfig();

  console.log(`[INFO] Fetching promotions from Epic Games (Locale: ${config.locale}, Country: ${config.country})...`);
  const { currentFreeGames, upcomingFreeGames } = await fetchFreeGames(config.locale, config.country);

  console.log(`[INFO] Current free games: ${currentFreeGames.length}`);
  currentFreeGames.forEach(g => console.log(`  - ${g.title} (Hạn: ${g.endDateFormatted}) -> ${g.storeUrl}`));

  console.log(`[INFO] Upcoming free games: ${upcomingFreeGames.length}`);
  upcomingFreeGames.forEach(g => console.log(`  - ${g.title} (Từ: ${g.startDateFormatted})`));

  console.log(`[INFO] Sending notifications...`);
  await notifyFreeGames({
    botToken: config.telegramBotToken,
    chatId: config.telegramChatId,
    currentFreeGames,
    upcomingFreeGames,
    dryRun: config.dryRun
  });

  console.log(`[DONE] Finished successfully.`);
}

main().catch(err => {
  console.error(`[FATAL] Error occurred:`, err);
  process.exit(1);
});

