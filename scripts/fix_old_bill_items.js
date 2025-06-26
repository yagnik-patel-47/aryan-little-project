// Usage: NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... node scripts/fix_old_bill_items.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  // 1. Fetch all items and build a map of item_id -> rate
  const { data: items, error: itemsError } = await supabase.from('items').select('id, rate');
  if (itemsError) {
    console.error('Error fetching items:', itemsError);
    process.exit(1);
  }
  const itemRateMap = Object.fromEntries(items.map(item => [item.id, item.rate]));

  // 2. Fetch all bill_items
  const { data: billItems, error: billItemsError } = await supabase.from('bill_items').select('id, item_id, price');
  if (billItemsError) {
    console.error('Error fetching bill_items:', billItemsError);
    process.exit(1);
  }

  let updatedCount = 0;
  for (const billItem of billItems) {
    const correctRate = itemRateMap[billItem.item_id];
    if (typeof correctRate !== 'number') continue; // skip if item not found
    if (billItem.price !== correctRate) {
      // Update the bill_item with the correct price
      const { error } = await supabase.from('bill_items').update({ price: correctRate }).eq('id', billItem.id);
      if (error) {
        console.error(`Failed to update bill_item ${billItem.id}:`, error);
      } else {
        updatedCount++;
        console.log(`Updated bill_item ${billItem.id}: price set to ${correctRate}`);
      }
    }
  }
  console.log(`Done. Updated ${updatedCount} bill_items.`);
}

main(); 