-- Drop all existing policies first
DROP POLICY IF EXISTS "Enable insert for admin users only" ON campaigns;
DROP POLICY IF EXISTS "Enable update for admin users only" ON campaigns;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON campaigns;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON campaigns;
DROP POLICY IF EXISTS "Enable read access for all users" ON campaigns;
DROP POLICY IF EXISTS "Enable delete for admins and owners" ON campaigns;
DROP POLICY IF EXISTS "Enable update for admins and owners" ON campaigns;
DROP POLICY IF EXISTS "Policy to implement Time To Live (TTL)" ON campaigns;
DROP POLICY IF EXISTS "adminr" ON campaigns;

-- Create new policies using auth.jwt() for role checks
CREATE POLICY "Enable insert for admins" ON campaigns
FOR INSERT TO authenticated
WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin');

CREATE POLICY "Enable update for admins" ON campaigns
FOR UPDATE TO authenticated
USING ((auth.jwt() ->> 'role')::text = 'admin')
WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin');

CREATE POLICY "Enable read access for all users" ON campaigns
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Enable delete for admins" ON campaigns
FOR DELETE TO authenticated
USING ((auth.jwt() ->> 'role')::text = 'admin');