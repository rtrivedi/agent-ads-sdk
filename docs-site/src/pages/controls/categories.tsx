import React from 'react';
import Link from 'next/link';
import CodeBlock from '../../components/CodeBlock';

export default function CategoriesPage() {
  return (
    <div>
      <h1>Category Filtering</h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
        Control which advertiser categories can appear using the IAB Content Taxonomy 3.0 (704 categories across 38 top-level verticals).
      </p>

      <div className="mb-12">
        <h2>Allowed Categories</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Whitelist specific categories. Only ads from these categories will be shown.
        </p>
        <CodeBlock language="typescript" code={`// Insurance comparison app: only show insurance ads
const ad = await client.decideFromContext({
  userMessage: "I need car insurance",
  allowedCategories: [31]  // 31 = Auto Insurance (IAB category)
});

// Wedding planner: allow wedding + photography + food
const ad = await client.decideFromContext({
  userMessage: "Help me plan my wedding",
  allowedCategories: [603, 162, 190]  // Weddings, Photography, Restaurants
});`} />
      </div>

      <div className="mb-12">
        <h2>Blocked Categories</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Blacklist specific categories. Ads from these categories will never be shown.
        </p>
        <CodeBlock language="typescript" code={`// Block all sensitive content
const ad = await client.decideFromContext({
  userMessage: "Help me with something",
  blockedCategories: [601]  // Blocks "Sensitive Topics" + all children
});

// Legal assistant: block competitor law firms
const ad = await client.decideFromContext({
  userMessage: "I need legal help",
  blockedCategories: [318]  // Block "Legal Services"
});`} />
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
          <p className="text-blue-900 dark:text-blue-100 font-medium mb-2">Parent-Child Relationships</p>
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            Blocking a parent category automatically blocks all subcategories. For example, blocking category 1 (Automotive) blocks Auto Insurance, Auto Repair, Auto Parts, etc.
          </p>
        </div>
      </div>

      <div className="mb-12">
        <h2>Discovering Categories</h2>
        <CodeBlock language="typescript" code={`// Get all 38 top-level categories
const tier1 = await client.getCategories({ tier: 1 });
tier1.categories.forEach(cat => {
  console.log(\`\${cat.id}: \${cat.name}\`);
});

// Get all subcategories of "Automotive" (ID: 1)
const automotive = await client.getCategories({ parent_id: 1 });

// Search for insurance-related categories
const insurance = await client.getCategories({ search: 'insurance' });`} />
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
        <h2>Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/controls/revenue" className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors">
            <h3 className="font-semibold">Revenue Optimization →</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Maximize earnings with minimum CPC filters.</p>
          </Link>
          <Link href="/api/parameters" className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-primary-500 transition-colors">
            <h3 className="font-semibold">Request Parameters →</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">See all available filtering parameters.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
