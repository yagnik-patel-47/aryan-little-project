import { createSupabaseServerClient } from "@/lib/supabaseClient";
import { SummaryPageClient } from './SummaryPageClient';

// Re-define interfaces here for the server component
interface BillItem {
    id: string;
    item_id: string;
    quantity: number;
    price?: number;
}
interface Bill {
    id: string;
    vendor_id: string;
    date: string | number | Date;
    items: BillItem[];
}
interface Vendor {
    id: string;
    name: string;
    address?: string;
    contact?: string;
}
interface Item {
    id: string;
    name_en: string;
    name_gu: string;
}

export const revalidate = 0; // Don't cache this page

export default async function SummaryPage() {
    const supabase = createSupabaseServerClient();
    // Fetch data on the server
    const { data: billsData, error: billsError } = await supabase
        .from('bills')
        .select('*, bill_items:bill_items(*)')
        .order('date', { ascending: false });
    
    const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*');

    const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('*');

    if (billsError || itemsError || vendorsError) {
        const error = billsError || itemsError || vendorsError;
        console.error("Error fetching summary data (raw):", error);
        return <div><p>Error loading data:</p><pre>{JSON.stringify(error, null, 2)}</pre></div>;
    }

    const billsWithItems: Bill[] = (billsData || []).map(bill => ({
        ...bill,
        items: bill.bill_items || []
    }));

    // Pass server-fetched data to the client component
    return <SummaryPageClient 
                initialBills={billsWithItems} 
                initialItems={itemsData || []} 
                initialVendors={vendorsData || []} 
            />;
}