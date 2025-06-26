import { supabase } from "@/lib/supabaseClient";
import RoutesClientPage from "./RoutesClientPage";

export const revalidate = 0;

export default async function RoutesPage() {
    const { data: initialRoutes, error } = await supabase.from('routes').select('*');

    if (error) {
        console.error("Error fetching routes:", error);
        return <div>Error loading routes. Please check the console for details.</div>
    }

    return <RoutesClientPage initialRoutes={initialRoutes || []} />;
} 