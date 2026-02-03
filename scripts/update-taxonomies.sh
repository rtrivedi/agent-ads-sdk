#!/bin/bash

# Bulk update old taxonomies to new format across all files
# Run from repo root: bash scripts/update-taxonomies.sh

echo "🔄 Updating taxonomies across all files..."
echo ""

# Detect OS for cross-platform sed compatibility
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS (BSD sed)
  SED_INPLACE="sed -i ''"
else
  # Linux (GNU sed)
  SED_INPLACE="sed -i"
fi

# Function to replace taxonomy in files
update_taxonomy() {
  local old=$1
  local new=$2
  local description=$3

  echo "Updating: $old → $new ($description)"

  # Find and replace in all relevant files (cross-platform)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS (BSD sed requires empty string after -i)
    find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.md" \) \
      ! -path "*/node_modules/*" \
      ! -path "*/dist/*" \
      ! -path "*/.git/*" \
      ! -path "*/supabase/.temp/*" \
      -exec sed -i '' "s|'$old'|'$new'|g" {} + \
      -exec sed -i '' "s|\"$old\"|\"$new\"|g" {} + \
      -exec sed -i '' "s|\`$old\`|\`$new\`|g" {} +
  else
    # Linux (GNU sed doesn't use empty string)
    find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.md" \) \
      ! -path "*/node_modules/*" \
      ! -path "*/dist/*" \
      ! -path "*/.git/*" \
      ! -path "*/supabase/.temp/*" \
      -exec sed -i "s|'$old'|'$new'|g" {} + \
      -exec sed -i "s|\"$old\"|\"$new\"|g" {} + \
      -exec sed -i "s|\`$old\`|\`$new\`|g" {} +
  fi

  echo "  ✓ Done"
  echo ""
}

# Shopping & E-commerce
update_taxonomy "shopping.ecommerce.platform" "business.ecommerce.platform.trial" "E-commerce platforms"
update_taxonomy "shopping.online_store" "business.ecommerce.platform.trial" "Online stores"
update_taxonomy "shopping.store_setup" "business.ecommerce.platform.trial" "Store setup"
update_taxonomy "shopping.electronics.search" "shopping.electronics.computers.compare" "Electronics search"
update_taxonomy "shopping.electronics.phones" "shopping.electronics.phones.compare" "Phone shopping"

# Local Services → Home Services
update_taxonomy "local_services.movers.quote" "home_services.moving.local.quote" "Moving services"
update_taxonomy "local_services.contractors.home" "home_services.remodeling.kitchen.quote" "Home contractors"
update_taxonomy "local_services.cleaning" "home_services.cleaning.regular.book" "Cleaning services"
update_taxonomy "local_services.cleaners.quote" "home_services.cleaning.regular.book" "Cleaner quotes"
update_taxonomy "local_services.plumbers.quote" "home_services.plumbing.emergency.quote" "Plumber quotes"
update_taxonomy "local_services.electricians.quote" "home_services.electrical.repair.quote" "Electrician quotes"
update_taxonomy "local_services.restaurants.search" "travel.experiences.dining.book" "Restaurant search"
update_taxonomy "local_services.pet_care.dog_walking" "personal_services.pet_care.walking.book" "Dog walking"
update_taxonomy "local_services.lawyers.consultation" "legal.general.consultation" "Legal consultation"

# Business Tools → Business (B2B)
update_taxonomy "business.productivity.tools" "business.saas.project_management.trial" "Productivity tools"
update_taxonomy "business.software.ecommerce" "business.ecommerce.platform.trial" "E-commerce software"
update_taxonomy "business.startup.tools" "business.saas.crm.trial" "Startup tools"

# Travel
update_taxonomy "travel.booking.hotels" "travel.hotels.luxury.book" "Hotel bookings"
update_taxonomy "travel.booking.flights" "travel.flights.domestic.book" "Flight bookings"
update_taxonomy "travel.flights.search" "travel.flights.domestic.compare" "Flight search"
update_taxonomy "travel.experiences" "travel.experiences.tours.book" "Travel experiences"

echo "✅ All taxonomies updated!"
echo ""
echo "Files that were updated:"
echo "  - All .ts, .tsx, .js files (excluding node_modules, dist)"
echo "  - All .md documentation files"
echo ""
echo "Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Test: npm run build && npm test"
echo "  3. Commit: git add . && git commit -m 'Update to new taxonomy format'"
echo ""
