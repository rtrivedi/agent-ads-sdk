/**
 * attentionmarket.js
 * AttentionMarket for Web — plain JavaScript, no dependencies.
 * Get API keys at https://api.attentionmarket.ai
 */

const ATTENTIONMARKET_URL = 'https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/decide';

/**
 * Get a relevant ad for a user message.
 * @param {string} userMessage - The user's message or conversation context
 * @param {string} apiKey - Your AttentionMarket API key (am_live_... or am_test_...)
 * @returns {Promise<object|null>} Ad object or null if no match
 */
async function getAd(userMessage, apiKey) {
  try {
    const response = await fetch(ATTENTIONMARKET_URL, {
      method: 'POST',
      headers: {
        'X-AM-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        context: userMessage,
        platform: 'web'
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.status !== 'filled' || !data.units.length) return null;

    return data.units[0].suggestion;
  } catch {
    return null;
  }
}

// --- Usage example ---
//
// const ad = await getAd(userMessage, 'am_live_YOUR_KEY');
//
// if (ad) {
//   // Show ad in your chat UI
//   const adEl = document.createElement('div');
//   adEl.className = 'am-ad';
//   adEl.innerHTML = `
//     <strong>${ad.title}</strong>
//     <p>${ad.body}</p>
//     <a href="${ad.tracking_url}" target="_blank">${ad.cta}</a>
//   `;
//   chatContainer.appendChild(adEl);
//   // Note: always use tracking_url for clicks — that's how you get paid
// }

// --- React hook example ---
//
// function useAttentionMarket(apiKey) {
//   const fetchAd = useCallback(async (userMessage) => {
//     return await getAd(userMessage, apiKey);  // calls module-level getAd above
//   }, [apiKey]);
//   return { getAd: fetchAd };
// }
