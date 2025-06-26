CREATE OR REPLACE FUNCTION create_bill_with_items(
  p_vendor_id uuid,
  p_date date,
  p_items jsonb
)
RETURNS uuid AS $$
DECLARE
  new_bill_id uuid;
  item_record jsonb;
  item_price numeric;
BEGIN
  -- Insert the new bill and get its ID
  INSERT INTO bills (vendor_id, date)
  VALUES (p_vendor_id, p_date)
  RETURNING id INTO new_bill_id;

  -- Loop through the items and insert them into bill_items
  FOR item_record IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Get the price from the items table
    SELECT rate INTO item_price
    FROM items
    WHERE id = (item_record->>'item_id')::uuid;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Item with ID % not found', item_record->>'item_id';
    END IF;

    -- Insert into bill_items
    INSERT INTO bill_items (bill_id, item_id, quantity, price)
    VALUES (
      new_bill_id,
      (item_record->>'item_id')::uuid,
      (item_record->>'quantity')::integer,
      item_price
    );
  END LOOP;

  RETURN new_bill_id;
END;
$$ LANGUAGE plpgsql; 