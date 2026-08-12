-- Drop old policies
DROP POLICY IF EXISTS "Admin can insert products" ON public.product;
DROP POLICY IF EXISTS "Admin can update products" ON public.product;
DROP POLICY IF EXISTS "Admin can delete products" ON public.product;
DROP POLICY IF EXISTS "Admin can view all guest orders" ON public.guest_order;
DROP POLICY IF EXISTS "Admin can view all order items" ON public.order_item;

-- Recreate with new email
CREATE POLICY "Admin can insert products" ON public.product FOR INSERT TO authenticated WITH CHECK ((auth.jwt() ->> 'email') = 'lesleenyanducha@gmail.com');
CREATE POLICY "Admin can update products" ON public.product FOR UPDATE TO authenticated USING ((auth.jwt() ->> 'email') = 'lesleenyanducha@gmail.com') WITH CHECK ((auth.jwt() ->> 'email') = 'lesleenyanducha@gmail.com');
CREATE POLICY "Admin can delete products" ON public.product FOR DELETE TO authenticated USING ((auth.jwt() ->> 'email') = 'lesleenyanducha@gmail.com');

CREATE POLICY "Admin can view all guest orders" ON public.guest_order FOR SELECT TO authenticated USING ((auth.jwt() ->> 'email') = 'lesleenyanducha@gmail.com');
CREATE POLICY "Admin can view all order items" ON public.order_item FOR SELECT TO authenticated USING ((auth.jwt() ->> 'email') = 'lesleenyanducha@gmail.com');
