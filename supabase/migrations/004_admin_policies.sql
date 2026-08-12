-- Admin policies for product table
CREATE POLICY "Admin can insert products" ON public.product FOR INSERT TO authenticated WITH CHECK ((auth.jwt() ->> 'email') = 'zingtreats@gmail.com');
CREATE POLICY "Admin can update products" ON public.product FOR UPDATE TO authenticated USING ((auth.jwt() ->> 'email') = 'zingtreats@gmail.com') WITH CHECK ((auth.jwt() ->> 'email') = 'zingtreats@gmail.com');
CREATE POLICY "Admin can delete products" ON public.product FOR DELETE TO authenticated USING ((auth.jwt() ->> 'email') = 'zingtreats@gmail.com');

-- Admin policies for guest_order table
CREATE POLICY "Admin can view all guest orders" ON public.guest_order FOR SELECT TO authenticated USING ((auth.jwt() ->> 'email') = 'zingtreats@gmail.com');

-- Admin policies for order_item table
CREATE POLICY "Admin can view all order items" ON public.order_item FOR SELECT TO authenticated USING ((auth.jwt() ->> 'email') = 'zingtreats@gmail.com');
