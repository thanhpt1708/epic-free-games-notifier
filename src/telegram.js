/**
 * Telegram Bot API integration
 */

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Send text message using Telegram sendMessage API
 */
export async function sendTelegramMessage(botToken, chatId, htmlText) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: htmlText,
      parse_mode: 'HTML',
      disable_web_page_preview: false
    })
  });

  const data = await response.json();
  if (!data.ok) {
    throw new Error(`Telegram sendMessage failed: ${data.description || 'Unknown error'}`);
  }
  return data;
}

/**
 * Send photo with caption using Telegram sendPhoto API
 */
export async function sendTelegramPhoto(botToken, chatId, photoUrl, htmlCaption) {
  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      photo: photoUrl,
      caption: htmlCaption,
      parse_mode: 'HTML'
    })
  });

  const data = await response.json();
  if (!data.ok) {
    // If photo failed (e.g. image format issue), fallback to standard message
    console.warn(`[WARN] sendPhoto failed (${data.description}), falling back to sendMessage...`);
    return sendTelegramMessage(botToken, chatId, htmlCaption);
  }
  return data;
}

/**
 * Build and send notifications for both current and upcoming free games
 */
export async function notifyFreeGames({ botToken, chatId, currentFreeGames, upcomingFreeGames, dryRun = false }) {
  if (currentFreeGames.length === 0 && upcomingFreeGames.length === 0) {
    console.log('[INFO] No free games found to notify.');
    return;
  }

  console.log(`[INFO] Found ${currentFreeGames.length} current free games, ${upcomingFreeGames.length} upcoming games.`);

  // 1. Notify current free games
  for (const game of currentFreeGames) {
    const shortDesc = game.description 
      ? (game.description.length > 200 ? game.description.slice(0, 197) + '...' : game.description)
      : '';

    const caption = [
      '🎮 <b>EPIC GAMES MIỄN PHÍ TUẦN NÀY</b>',
      '',
      `🕹️ <b><a href="${game.storeUrl}">${escapeHtml(game.title)}</a></b>`,
      `💰 <b>Giá gốc:</b> <s>${escapeHtml(game.originalPrice)}</s> ➡️ <b>0₫ (MIỄN PHÍ)</b>`,
      `⏰ <b>Hạn nhận:</b> ${game.endDateFormatted}`,
      shortDesc ? `📝 <i>${escapeHtml(shortDesc)}</i>` : '',
      '',
      `👉 <a href="${game.storeUrl}"><b>BẤM VÀO ĐÂY ĐỂ LẤY GAME TRÊN EPIC</b></a>`
    ].filter(line => line !== '').join('\n');

    if (dryRun) {
      console.log('\n--- [DRY RUN TELEGRAM MESSAGE] ---');
      console.log(caption);
      console.log('Image:', game.imageUrl);
      console.log('----------------------------------\n');
    } else {
      if (game.imageUrl) {
        await sendTelegramPhoto(botToken, chatId, game.imageUrl, caption);
      } else {
        await sendTelegramMessage(botToken, chatId, caption);
      }
      console.log(`[SUCCESS] Notified game: ${game.title}`);
    }
  }

  // 2. Notify upcoming games summary (if any)
  if (upcomingFreeGames.length > 0) {
    const upcomingLines = upcomingFreeGames.map(g => {
      const openDate = g.startDateFormatted || 'Tuần sau';
      return `• <b><a href="${g.storeUrl}">${escapeHtml(g.title)}</a></b> (Mở từ: ${openDate})`;
    });

    const upcomingMessage = [
      '🔮 <b>GAME SẮP ĐƯỢC TẶNG TUẦN TỚI:</b>',
      '',
      ...upcomingLines,
      '',
      '<i>Bot sẽ tự động báo lại vào tuần sau khi game chính thức mở!</i>'
    ].join('\n');

    if (dryRun) {
      console.log('\n--- [DRY RUN UPCOMING SUMMARY] ---');
      console.log(upcomingMessage);
      console.log('----------------------------------\n');
    } else {
      await sendTelegramMessage(botToken, chatId, upcomingMessage);
      console.log('[SUCCESS] Sent upcoming games notification.');
    }
  }
}

