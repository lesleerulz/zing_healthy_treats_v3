-- Allow authenticated users to view their own orders
CREATE POLICY "Users can view their own orders"
  ON guest_order
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt()->>'email');

-- Allow authenticated users to view order items for their own orders
CREATE POLICY "Users can view their own order items"
  ON order_item
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM guest_order WHERE email = auth.jwt()->>'email'
    )
  );
