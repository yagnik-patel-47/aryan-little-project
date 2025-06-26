import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  const { data, error } = await supabase.from('bill_items').select('*');
  if (error) {
    console.error('Error fetching bill items:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = Array.isArray(body) ? body : [body];

    for (const item of items) {
      if (!item.bill_id || !item.item_id || item.quantity === undefined) {
        return NextResponse.json({ error: "Missing required fields: bill_id, item_id, quantity for at least one item." }, { status: 400 });
      }
    }

    const { data, error } = await supabase.from('bill_items').insert(items).select();
    
    if (error) {
      console.error('Error inserting bill items:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, bill_id, item_id, quantity } = body;

    if (!id || !bill_id || !item_id || quantity === undefined) {
      return NextResponse.json({ error: "Missing required fields: id, bill_id, item_id, quantity" }, { status: 400 });
    }

    const { data, error } = await supabase.from('bill_items').update(body).eq('id', id).select();
    
    if (error) {
      console.error('Error updating bill item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: "Bill Item ID is required" }, { status: 400 });
  }

  const { error } = await supabase.from('bill_items').delete().eq('id', id);

  if (error) {
    console.error('Error deleting bill item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
} 