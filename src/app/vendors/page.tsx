import VendorsClientPage from "./VendorsClientPage";
import { createSupabaseServerClient } from "@/lib/supabaseClient";

export const revalidate = 0;

export default async function VendorsPage() {
    const supabase = createSupabaseServerClient();
    const { data: initialVendors, error: vendorsError } = await supabase.from('vendors').select('*');
    const { data: initialRoutes, error: routesError } = await supabase.from('routes').select('*');

    if (vendorsError || routesError) {
        console.error("Error fetching data:", vendorsError || routesError);
        return <div>Error loading data. Please check the console for details.</div>
    }

    return <VendorsClientPage initialVendors={initialVendors || []} initialRoutes={initialRoutes || []} />;
} 