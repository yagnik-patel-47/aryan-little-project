import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  const { data, error } = await supabase.from('vendors').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (Array.isArray(body)) {
    // Bulk insert
    const vendors = body;
    // Get all routes to map names to IDs
    const { data: routes, error: routesError } = await supabase.from('routes').select('id, name');
    if (routesError) {
      console.error('Error fetching routes:', routesError);
      return NextResponse.json({ error: "Could not fetch routes to map names to IDs." }, { status: 500 });
    }

    const routeNameToIdMap = routes ? Object.fromEntries(routes.map(r => [r.name, r.id])) : {};

    const vendorsToInsert = vendors.map(vendor => {
      const { name, route_name, contact, address } = vendor;
      const route_id = routeNameToIdMap[route_name];
      if (!route_id) {
        // You could choose to throw an error or skip this vendor
        console.warn(`Could not find route with name: ${route_name}. Skipping vendor: ${name}`);
        return null;
      }
      return { name, route_id, contact, address };
    }).filter(v => v !== null); // Filter out nulls more robustly

    if (vendorsToInsert.length === 0) {
      return NextResponse.json({ error: "No valid vendors to insert. Check route_name values." }, { status: 400 });
    }

    const { data, error } = await supabase.from('vendors').insert(vendorsToInsert).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });

  } else {
    // Single insert
    const { name, route_id, contact, address } = body;
    if (!name || !route_id) {
        return NextResponse.json({ error: "Name and route_id are required for a single vendor insert." }, { status: 400 });
    }
    const { data, error } = await supabase.from('vendors').insert([{ name, route_id, contact, address }]).select();
    if (error) {
        console.error('Error inserting single vendor:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, name, route_id, contact, address } = body;
  const { data, error } = await supabase.from('vendors').update({ name, route_id, contact, address }).eq('id', id).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const { error } = await supabase.from('vendors').delete().eq('id', id);
  
  if (error) {
    console.error("Error deleting vendor:", error);
    const userFriendlyError = error.message.includes('foreign key constraint') 
      ? 'Cannot delete this vendor because they still have bills associated with them. Please delete their bills first.'
      : 'Failed to delete vendor.';
    return NextResponse.json({ error: userFriendlyError, details: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
} 