-- Add expires_at to guest_order
ALTER TABLE guest_order ADD COLUMN expires_at TIMESTAMPTZ DEFAULT (now() + interval '1 hour');

-- Recreate create_guest_order to skip decrementing quantity
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
    INSERT INTO guest_order (email, phone, address, reference, total_ksh)
    VALUES (p_email, p_phone, p_address, p_reference, v_total)
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

-- Create confirm_payment RPC
CREATE OR REPLACE FUNCTION confirm_payment(p_reference TEXT)
RETURNS VOID
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    v_order_id UUID;
    v_status TEXT;
    v_item RECORD;
BEGIN
    -- Get order
    SELECT id, status INTO v_order_id, v_status FROM guest_order WHERE reference = p_reference FOR UPDATE;
    
    IF v_order_id IS NULL THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    IF v_status != 'pending' THEN
        -- If already paid or otherwise, do not decrement again
        RETURN;
    END IF;

    -- Update status
    UPDATE guest_order SET status = 'paid' WHERE id = v_order_id;

    -- Decrement quantities
    FOR v_item IN SELECT product_id, quantity FROM order_item WHERE order_id = v_order_id
    LOOP
        UPDATE product SET quantity = quantity - v_item.quantity WHERE id = v_item.product_id;
    END LOOP;
END;
$$;
