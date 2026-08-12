ALTER TABLE guest_order ADD COLUMN user_id UUID REFERENCES auth.users(id);

DROP FUNCTION IF EXISTS create_guest_order(JSONB, TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION create_guest_order(
    p_items JSONB,
    p_email TEXT,
    p_phone TEXT,
    p_address TEXT,
    p_reference TEXT
) RETURNS TABLE(order_id UUID, total_ksh NUMERIC)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    v_order_id UUID;
    v_total NUMERIC(10,2) := 0;
    v_item RECORD;
    v_unit_price NUMERIC(10,2);
BEGIN
    -- Calculate total
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id INT, quantity INT)
    LOOP
        SELECT price INTO v_unit_price FROM product WHERE id = v_item.product_id;
        IF v_unit_price IS NULL THEN
            RAISE EXCEPTION 'Product % not found', v_item.product_id;
        END IF;
        v_total := v_total + (v_unit_price * v_item.quantity);
    END LOOP;

    -- Create order
    INSERT INTO guest_order (user_id, email, phone, address, reference, total_ksh)
    VALUES (auth.uid(), p_email, p_phone, p_address, p_reference, v_total)
    RETURNING id INTO v_order_id;

    -- Create order items (no quantity decrement here)
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id INT, quantity INT)
    LOOP
        SELECT price INTO v_unit_price FROM product WHERE id = v_item.product_id;
        INSERT INTO order_item (order_id, product_id, quantity, unit_price)
        VALUES (v_order_id, v_item.product_id, v_item.quantity, v_unit_price);
    END LOOP;

    RETURN QUERY SELECT v_order_id, v_total;
END;
$$;

DROP POLICY IF EXISTS "Users can view their own orders" ON guest_order;
CREATE POLICY "Users can view their own orders"
  ON guest_order
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their own order items" ON order_item;
CREATE POLICY "Users can view their own order items"
  ON order_item
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM guest_order WHERE user_id = auth.uid()
    )
  );
