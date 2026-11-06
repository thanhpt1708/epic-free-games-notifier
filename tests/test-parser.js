import assert from 'node:assert';
import { parseGames, extractSlug, formatVNDate } from '../src/epic.js';

console.log('[TEST] Running parser unit tests...');

// Mock current time: 2026-11-06T15:00:00.000Z
const mockNow = new Date('2026-11-06T15:00:00.000Z');

const sampleElements = [
  // 1. Current Free Game
  {
    id: 'game-1',
    title: 'The Great Adventure',
    description: 'An exciting adventure game.',
    catalogNs: {
      mappings: [{ pageSlug: 'the-great-adventure-offer', pageType: 'productHome' }]
    },
    keyImages: [
      { type: 'OfferImageWide', url: 'https://cdn.epicgames.com/image1.jpg' }
    ],
    price: {
      totalPrice: {
        discountPrice: 0,
        originalPrice: 350000,
        fmtPrice: { originalPrice: '350.000 ₫' }
      }
    },
    promotions: {
      promotionalOffers: [
        {
          promotionalOffers: [
            {
              startDate: '2026-11-05T15:00:00.000Z',
              endDate: '2026-11-12T15:00:00.000Z',
              discountSetting: { discountPercentage: 0 }
            }
          ]
        }
      ]
    }
  },
  // 2. Upcoming Free Game
  {
    id: 'game-2',
    title: 'Space Commander 2',
    description: 'Conquer the galaxy.',
    productSlug: 'space-commander-2/home',
    keyImages: [
      { type: 'Thumbnail', url: 'https://cdn.epicgames.com/image2.jpg' }
    ],
    price: {
      totalPrice: {
        discountPrice: 200000,
        originalPrice: 200000,
        fmtPrice: { originalPrice: '200.000 ₫' }
      }
    },
    promotions: {
      upcomingPromotionalOffers: [
        {
          promotionalOffers: [
            {
              startDate: '2026-11-12T15:00:00.000Z',
              endDate: '2026-11-19T15:00:00.000Z',
              discountSetting: { discountPercentage: 0 }
            }
          ]
        }
      ]
    }
  },
  // 3. Regular Paid Game (Should be ignored)
  {
    id: 'game-3',
    title: 'Regular Paid Game',
    price: {
      totalPrice: {
        discountPrice: 500000,
        originalPrice: 500000
      }
    },
    promotions: null
  }
];

const { currentFreeGames, upcomingFreeGames } = parseGames(sampleElements, mockNow);

// Verification 1: Current free games
assert.strictEqual(currentFreeGames.length, 1, 'Should find exactly 1 current free game');
assert.strictEqual(currentFreeGames[0].title, 'The Great Adventure');
assert.strictEqual(currentFreeGames[0].storeUrl, 'https://store.epicgames.com/p/the-great-adventure-offer');
assert.strictEqual(currentFreeGames[0].imageUrl, 'https://cdn.epicgames.com/image1.jpg');
assert.strictEqual(currentFreeGames[0].originalPrice, '350.000 ₫');

// Verification 2: Upcoming free games
assert.strictEqual(upcomingFreeGames.length, 1, 'Should find exactly 1 upcoming free game');
assert.strictEqual(upcomingFreeGames[0].title, 'Space Commander 2');
assert.strictEqual(upcomingFreeGames[0].storeUrl, 'https://store.epicgames.com/p/space-commander-2');

// Verification 3: Date formatting
const formattedDate = formatVNDate('2026-11-12T15:00:00.000Z');
assert.ok(formattedDate.includes('12/11/2026'), 'Date should format with DD/MM/YYYY');

console.log('[TEST] All tests passed successfully! ✅');

