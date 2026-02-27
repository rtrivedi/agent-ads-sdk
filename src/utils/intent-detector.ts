/**
 * Intent detection and context extraction utilities
 * Used to automatically detect user intent stage and extract interests
 */

/**
 * Keywords that indicate different stages of the buying journey
 */
const INTENT_PATTERNS = {
  research: [
    'what is', 'how does', 'explain', 'tell me about',
    'learn about', 'understand', 'guide', 'tips',
    'basics', 'introduction', 'overview', 'how to'
  ],
  comparison: [
    'vs', 'versus', 'compare', 'better than', 'difference',
    'which', 'choose between', 'alternative', 'review',
    'pros and cons', 'best', 'top', 'recommend'
  ],
  ready_to_buy: [
    'buy now', 'purchase', 'get quote', 'sign up', 'subscribe',
    'order now', 'book now', 'reserve', 'apply now', 'start now',
    'pricing', 'cost', 'how much', 'discount', 'deal',
    'promo code', 'coupon', 'special offer', 'ready to buy',
    'want to buy', 'where can i buy', 'how to purchase'
  ]
};

/**
 * Common interest categories and their keywords
 */
const INTEREST_PATTERNS: Record<string, string[]> = {
  travel: ['travel', 'trip', 'vacation', 'flight', 'hotel', 'destination', 'tour', 'cruise'],
  fitness: ['fitness', 'workout', 'gym', 'exercise', 'health', 'diet', 'nutrition', 'yoga'],
  technology: ['tech', 'software', 'app', 'computer', 'phone', 'gadget', 'device', 'AI'],
  finance: ['finance', 'money', 'invest', 'savings', 'loan', 'credit', 'mortgage', 'budget'],
  insurance: ['insurance', 'coverage', 'policy', 'claim', 'premium', 'deductible'],
  automotive: ['car', 'auto', 'vehicle', 'drive', 'truck', 'SUV', 'motorcycle'],
  education: ['learn', 'course', 'class', 'school', 'university', 'degree', 'certification'],
  shopping: ['shop', 'store', 'buy', 'sale', 'discount', 'deal', 'online shopping'],
  food: ['food', 'restaurant', 'cooking', 'recipe', 'meal', 'dining', 'cuisine'],
  entertainment: ['movie', 'show', 'music', 'game', 'concert', 'event', 'streaming'],
  home: ['home', 'house', 'apartment', 'furniture', 'decor', 'renovation', 'real estate'],
  business: ['business', 'company', 'startup', 'entrepreneur', 'marketing', 'sales'],
  legal: ['legal', 'lawyer', 'attorney', 'law', 'contract', 'lawsuit', 'court'],
  healthcare: ['health', 'medical', 'doctor', 'hospital', 'treatment', 'therapy', 'medicine'],
  parenting: ['baby', 'child', 'parent', 'family', 'kids', 'pregnancy', 'school'],
  wedding: ['wedding', 'marriage', 'engagement', 'bride', 'groom', 'ceremony'],
  pets: ['pet', 'dog', 'cat', 'animal', 'vet', 'puppy', 'kitten'],
  beauty: ['beauty', 'makeup', 'skincare', 'hair', 'cosmetics', 'salon', 'spa'],
  sports: ['sports', 'game', 'team', 'player', 'football', 'basketball', 'soccer'],
  fashion: ['fashion', 'clothing', 'style', 'outfit', 'designer', 'shoes', 'accessories']
};

/**
 * Detect the user's intent stage based on their message
 */
export function detectIntentStage(
  message: string,
  conversationHistory?: string[]
): 'research' | 'comparison' | 'ready_to_buy' | undefined {
  const lowerMessage = message.toLowerCase();
  const fullContext = conversationHistory
    ? [...conversationHistory, message].join(' ').toLowerCase()
    : lowerMessage;

  // Check for ready_to_buy signals (highest priority)
  for (const pattern of INTENT_PATTERNS.ready_to_buy) {
    if (fullContext.includes(pattern)) {
      return 'ready_to_buy';
    }
  }

  // Check for comparison signals
  for (const pattern of INTENT_PATTERNS.comparison) {
    if (fullContext.includes(pattern)) {
      return 'comparison';
    }
  }

  // Check for research signals
  for (const pattern of INTENT_PATTERNS.research) {
    if (lowerMessage.includes(pattern)) {
      return 'research';
    }
  }

  // Default to undefined (let backend decide)
  return undefined;
}

/**
 * Extract user interests from conversation
 */
export function extractInterests(
  message: string,
  conversationHistory?: string[]
): string[] {
  const interests = new Set<string>();

  // Filter out empty strings and validate input
  const validHistory = (conversationHistory || [])
    .filter(msg => typeof msg === 'string' && msg.trim().length > 0);

  const fullContext = validHistory.length > 0
    ? [...validHistory, message].join(' ').toLowerCase()
    : message.toLowerCase();

  // Check each interest category
  for (const [interest, keywords] of Object.entries(INTEREST_PATTERNS)) {
    for (const keyword of keywords) {
      if (fullContext.includes(keyword)) {
        interests.add(interest);
        break; // Found this interest, move to next
      }
    }
  }

  return Array.from(interests);
}

/**
 * Extract topics from conversation for context
 */
export function extractTopics(
  conversationHistory?: string[]
): string[] {
  if (!conversationHistory || conversationHistory.length === 0) {
    return [];
  }

  const topics: string[] = [];
  const seen = new Set<string>();

  // Extract main topics from each message
  for (const message of conversationHistory.slice(-5)) { // Last 5 messages
    const lowerMessage = message.toLowerCase();

    // Check each interest category as a potential topic
    for (const [topic, keywords] of Object.entries(INTEREST_PATTERNS)) {
      if (!seen.has(topic)) {
        for (const keyword of keywords) {
          if (lowerMessage.includes(keyword)) {
            topics.push(topic);
            seen.add(topic);
            break;
          }
        }
      }
    }
  }

  return topics.slice(0, 3); // Return top 3 topics
}

/**
 * Generate a session ID if not provided
 */
export function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `sess_${timestamp}_${random}`;
}

/**
 * Detect purchase intent from message
 */
export function detectPurchaseIntent(
  message: string,
  intentStage?: 'research' | 'comparison' | 'ready_to_buy'
): boolean {
  // If already marked as ready_to_buy, definitely has purchase intent
  if (intentStage === 'ready_to_buy') {
    return true;
  }

  const lowerMessage = message.toLowerCase();
  const purchaseKeywords = [
    'buy', 'purchase', 'order', 'get', 'subscribe',
    'sign up', 'apply', 'book', 'reserve', 'quote',
    'pricing', 'cost', 'how much', 'where can i'
  ];

  return purchaseKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Calculate message count for session
 */
export function calculateMessageCount(
  conversationHistory?: string[]
): number {
  return (conversationHistory?.length || 0) + 1; // +1 for current message
}