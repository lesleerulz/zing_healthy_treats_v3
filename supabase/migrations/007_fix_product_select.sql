-- Fix RLS so authenticated users (like the admin) can also view products
CREATE POLICY "Allow authenticated SELECT on product" ON public.product
    FOR SELECT TO authenticated
    USING (true);
