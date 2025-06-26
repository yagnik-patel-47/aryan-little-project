import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  const { data, error } = await supabase.from('bills').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vendor_id, date, items } = body;

    // Validate request body
    if (
      !vendor_id ||
      !date ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Call the RPC function to handle the transaction
    const { data, error } = await supabase.rpc("create_bill_with_items", {
      p_vendor_id: vendor_id,
      p_date: date,
      p_items: items,
    });

    if (error) {
      console.error("Error creating bill:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, bill_id: data }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, vendor_id, date, total, gst_total } = body;
  const { data, error } = await supabase.from('bills').update({ vendor_id, date, total, gst_total }).eq('id', id).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');

  // If an ID is provided, delete a single bill and its items
  if (id) {
    // Transaction-like behavior:
    // 1. Delete all associated bill_items
    const { error: itemError } = await supabase.from('bill_items').delete().eq('bill_id', id);
    if (itemError) {
      console.error("Error deleting bill's items:", itemError);
      return NextResponse.json({ error: "Failed to delete the items within the bill.", details: itemError.message }, { status: 500 });
    }

    // 2. Delete the bill itself
    const { error: billError } = await supabase.from('bills').delete().eq('id', id);
    if (billError) {
      console.error("Error deleting bill:", billError);
      return NextResponse.json({ error: "Failed to delete the bill.", details: billError.message }, { status: 500 });
    }
  } else {
    // If NO ID is provided, delete all bills
    // 1. Delete all bill_items first to maintain relational integrity
    const { error: allItemsError } = await supabase.from('bill_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (allItemsError) {
      console.error("Error deleting all bill items:", allItemsError);
      return NextResponse.json({ error: "Failed to delete all bill items.", details: allItemsError.message }, { status: 500 });
    }

    // 2. Delete all bills
    const { error: allBillsError } = await supabase.from('bills').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (allBillsError) {
      console.error("Error deleting all bills:", allBillsError);
      return NextResponse.json({ error: "Failed to delete all bills.", details: allBillsError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
} 