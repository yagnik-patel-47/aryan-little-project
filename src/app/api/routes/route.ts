import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  const { data, error } = await supabase.from('routes').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received body for new route:", body);

    // Handle both single object and array of objects
    const routesToInsert = (Array.isArray(body) ? body : [body]).map(item => {
      // Accommodate CSV import with "Route Name" and single additions with "name"
      const name = item.name || item['Route Name'];
      const description = item.description || item.Day;
      if (!name) return null;
      return { name, description };
    }).filter(Boolean);

    if (routesToInsert.length === 0) {
      return NextResponse.json({ error: "No valid route data provided." }, { status: 400 });
    }

    const { data, error } = await supabase.from('routes').insert(routesToInsert).select();
    
    if (error) {
      console.error("Supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    console.error("Error processing request:", e.message);
    return NextResponse.json({ error: "Error processing request" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, name, description } = body;
  const { data, error } = await supabase.from('routes').update({ name, description }).eq('id', id).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const { error } = await supabase.from('routes').delete().eq('id', id);

  if (error) {
    console.error('Error deleting route:', error);
    const userFriendlyError = error.message.includes('foreign key constraint') 
      ? 'Cannot delete this route because it is still assigned to one or more vendors. Please re-assign those vendors first.'
      : 'Failed to delete route.';
    return NextResponse.json({ error: userFriendlyError, details: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
} 