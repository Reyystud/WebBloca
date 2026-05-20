-- ============================================================
-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. AUTH TRIGGER: Auto-create user profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. Drop existing policies first (safe to re-run)
-- ============================================================
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;
DROP POLICY IF EXISTS "Users can view own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can add to own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can view own wishlist" ON wishlist_items;
DROP POLICY IF EXISTS "Users can add to own wishlist" ON wishlist_items;
DROP POLICY IF EXISTS "Users can delete own wishlist items" ON wishlist_items;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Shipping rates are viewable by everyone" ON shipping_rates;

-- ============================================================
-- 4. USERS TABLE POLICIES
-- ============================================================
CREATE POLICY "Users can view all users"
  ON users FOR SELECT
  USING (true);
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- ============================================================
-- 5. PRODUCTS TABLE POLICIES
-- ============================================================
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

-- ============================================================
-- 6. ORDERS TABLE POLICIES
-- ============================================================
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid()::text = "userId");
CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  USING (auth.uid()::text = "userId");

-- ============================================================
-- 7. ORDER_ITEMS TABLE POLICIES
-- ============================================================
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    "orderId" IN (
      SELECT id FROM orders WHERE "userId" = auth.uid()::text
    )
  );
CREATE POLICY "Users can create order items"
  ON order_items FOR INSERT
  WITH CHECK (
    "orderId" IN (
      SELECT id FROM orders WHERE "userId" = auth.uid()::text
    )
  );

-- ============================================================
-- 8. CART_ITEMS TABLE POLICIES
-- ============================================================
CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  USING (auth.uid()::text = "userId");
CREATE POLICY "Users can add to own cart"
  ON cart_items FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update own cart"
  ON cart_items FOR UPDATE
  USING (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  USING (auth.uid()::text = "userId");

-- ============================================================
-- 9. WISHLIST_ITEMS TABLE POLICIES
-- ============================================================
CREATE POLICY "Users can view own wishlist"
  ON wishlist_items FOR SELECT
  USING (auth.uid()::text = "userId");
CREATE POLICY "Users can add to own wishlist"
  ON wishlist_items FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can delete own wishlist items"
  ON wishlist_items FOR DELETE
  USING (auth.uid()::text = "userId");

-- ============================================================
-- 10. PAYMENTS TABLE POLICIES
-- ============================================================
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (
    "orderId" IN (
      SELECT id FROM orders WHERE "userId" = auth.uid()::text
    )
  );

-- ============================================================
-- 11. SHIPPING_RATES TABLE POLICIES
-- ============================================================
CREATE POLICY "Shipping rates are viewable by everyone"
  ON shipping_rates FOR SELECT
  USING (true);

-- ============================================================
-- 12. ADMIN_ROLES
-- ============================================================
UPDATE users SET role = 'ADMIN' WHERE email = 'mrafiandhis@gmail.com';
UPDATE users SET role = 'ADMIN' WHERE email = 'fadhillahfaiz2007@gmail.com';