/**
 * Fetch and parse free games from Epic Games Store
 */

const EPIC_API_URL = 'https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions';

/**
 * Format ISO date string to readable VN format: HH:mm DD/MM/YYYY
 */
export function formatVNDate(isoDate) {
  if (!isoDate) return 'Chưa xác định';
  try {
    const d = new Date(isoDate);
    // Convert to Vietnam timezone (+7)
    const formatter = new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour12: false
    });
    return formatter.format(d);
  } catch {
    return isoDate;
  }
}

/**
 * Extract clean store slug
 */
export function extractSlug(element) {
  let slug = null;

  // 1. Check catalogNs mappings
  const mapping = element.catalogNs?.mappings?.find(m => m.pageType === 'productHome');
  if (mapping?.pageSlug) {
    slug = mapping.pageSlug;
  }

  // 2. Check offerMappings
  if (!slug && element.offerMappings?.length) {
    const offer = element.offerMappings.find(m => m.pageType === 'productHome');
    if (offer?.pageSlug) {
      slug = offer.pageSlug;
    }
  }

  // 3. Check productSlug / urlSlug
  if (!slug) {
    slug = element.productSlug || element.urlSlug;
  }

  if (slug && slug.endsWith('/home')) {
    slug = slug.replace(/\/home$/, '');
  }

  return slug || '';
}

/**
 * Extract the best cover image URL
 */
export function extractImage(element) {
  if (!element.keyImages || element.keyImages.length === 0) return null;

  const priorityTypes = [
    'OfferImageWide',
    'DieselStoreFrontWide',
    'VaultClosed',
    'Thumbnail',
    'OfferImageTall'
  ];

  for (const type of priorityTypes) {
    const found = element.keyImages.find(img => img.type === type);
    if (found?.url) return found.url;
  }

  return element.keyImages[0]?.url || null;
}

/**
 * Parse Epic Games API elements into current free games & upcoming free games
 */
export function parseGames(elements, now = new Date()) {
  const currentFreeGames = [];
  const upcomingFreeGames = [];

  for (const item of elements) {
    // Must have price info
    const price = item.price?.totalPrice;
    const originalPriceFmt = price?.fmtPrice?.originalPrice || 'Miễn phí';
    const slug = extractSlug(item);
    const storeUrl = slug ? `https://store.epicgames.com/p/${slug}` : 'https://store.epicgames.com/free-games';
    const imageUrl = extractImage(item);

    // 1. Check current free promotions
    const promotionalOffers = item.promotions?.promotionalOffers;
    if (promotionalOffers && promotionalOffers.length > 0) {
      const activeOffer = promotionalOffers
        .flatMap(po => po.promotionalOffers || [])
        .find(offer => {
          const start = new Date(offer.startDate);
          const end = new Date(offer.endDate);
          const is100PercentOff = offer.discountSetting?.discountPercentage === 0;
          return now >= start && now <= end && is100PercentOff;
        });

      // Price discount must be 0 for free claim
      if (activeOffer && price?.discountPrice === 0) {
        currentFreeGames.push({
          id: item.id,
          title: item.title,
          description: item.description || '',
          originalPrice: originalPriceFmt,
          startDate: activeOffer.startDate,
          endDate: activeOffer.endDate,
          endDateFormatted: formatVNDate(activeOffer.endDate),
          storeUrl,
          imageUrl
        });
        continue;
      }
    }

    // 2. Check upcoming free promotions (next week)
    const upcomingOffers = item.promotions?.upcomingPromotionalOffers;
    if (upcomingOffers && upcomingOffers.length > 0) {
      const nextOffer = upcomingOffers
        .flatMap(uo => uo.promotionalOffers || [])
        .find(offer => {
          const start = new Date(offer.startDate);
          const is100PercentOff = offer.discountSetting?.discountPercentage === 0;
          return now < start && is100PercentOff;
        });

      if (nextOffer) {
        upcomingFreeGames.push({
          id: item.id,
          title: item.title,
          description: item.description || '',
          originalPrice: originalPriceFmt,
          startDate: nextOffer.startDate,
          startDateFormatted: formatVNDate(nextOffer.startDate),
          endDate: nextOffer.endDate,
          endDateFormatted: formatVNDate(nextOffer.endDate),
          storeUrl,
          imageUrl
        });
      }
    }
  }

  return { currentFreeGames, upcomingFreeGames };
}

/**
 * Fetch free games from Epic Games Store API
 */
export async function fetchFreeGames(locale = 'vi-VN', country = 'VN') {
  const url = `${EPIC_API_URL}?locale=${encodeURIComponent(locale)}&country=${encodeURIComponent(country)}&allowCountries=${encodeURIComponent(country)}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Epic Games API error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  const elements = json?.data?.Catalog?.searchStore?.elements || [];

  return parseGames(elements);
}

