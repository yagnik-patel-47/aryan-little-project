import ItemsClientPage from "./ItemsClientPage";
import { createSupabaseServerClient } from "@/lib/supabaseClient";

export const revalidate = 0;

export default async function ItemsPage() {
    console.log("Available environment variables on server:", Object.keys(process.env));
    const supabase = createSupabaseServerClient();
    const { data: initialItems, error } = await supabase.from('items').select('*');

    if (error) {
        console.error("Error fetching items (raw):", error);
        return <div><p>Error loading items:</p><pre>{JSON.stringify(error, null, 2)}</pre></div>;
    }

    return <ItemsClientPage initialItems={initialItems || []} />;
} 