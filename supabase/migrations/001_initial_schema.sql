-- Tables
DROP TABLE IF EXISTS order_item, guest_order, product CASCADE;

CREATE TABLE product (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image TEXT,
    price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 50,
    is_peoples_choice BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE guest_order (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    reference TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    total_ksh NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE order_item (
    id SERIAL PRIMARY KEY,
    order_id UUID REFERENCES guest_order(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES product(id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL
);

-- RLS
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous SELECT on product" ON product
    FOR SELECT TO anon
    USING (true);

-- RPC
DROP FUNCTION IF EXISTS create_guest_order;
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

    -- Create order items and decrement quantity
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id INT, quantity INT)
    LOOP
        SELECT price INTO v_unit_price FROM product WHERE id = v_item.product_id;
        INSERT INTO order_item (order_id, product_id, quantity, unit_price)
        VALUES (v_order_id, v_item.product_id, v_item.quantity, v_unit_price);
        
        UPDATE product SET quantity = quantity - v_item.quantity WHERE id = v_item.product_id;
    END LOOP;

    RETURN QUERY SELECT v_order_id, v_total;
END;
$$;

-- Seed data
INSERT INTO product (title, description, price, is_peoples_choice, image) VALUES
('Golden Hour Granola', 'Slow-roasted oats with wildflower honey, toasted almonds, and a whisper of cinnamon. Best at sunrise.', 850, true, 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg'),
('The Morning Jar', 'Cashews and pecans tumbled in grade-A maple, roasted until the kitchen smells like Saturday.', 950, false, 'https://images.pexels.com/photos/4594648/pexels-photo-4594648.jpeg'),
('Sunrise Bowl', 'Walnuts, dried berry, and a swirl of yogurt dust. The breakfast that doesn''t need a recipe.', 780, false, 'https://images.pexels.com/photos/1359326/pexels-photo-1359326.jpeg'),
('Midnight Almond', 'Marcona almonds kissed with smoked salt. For the ones who eat breakfast after dark.', 1100, true, 'https://images.pexels.com/photos/3622479/pexels-photo-3622479.jpeg'),
('Honeycrisp Cashew', 'Raw honey, Ceylon cinnamon, and whole cashews roasted low and slow. Sweet without asking.', 920, false, 'https://images.pexels.com/photos/161559/background-bitter-breakfast-brown-161559.jpeg'),
('Orchard Pecan', 'Brown butter pecans with fleur de sel. What the orchard would eat if it could sit down.', 1050, false, 'https://images.pexels.com/photos/108035/pexels-photo-108035.jpeg');
