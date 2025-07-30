-- Add waitlist table for users who want early access
CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  company text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('urgent', 'high', 'normal')),
  source text DEFAULT 'napoleon-ai-signup',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'invited', 'declined')),
  notes text,
  contacted_at timestamptz,
  invited_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(email)
);

-- Add RLS policy for waitlist
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow public inserts for waitlist signups
CREATE POLICY "Allow public waitlist signups" ON public.waitlist
  FOR INSERT TO anon WITH CHECK (true);

-- Allow authenticated users to view their own waitlist entry
CREATE POLICY "Users can view own waitlist entry" ON public.waitlist
  FOR SELECT TO authenticated USING (email = (auth.jwt() ->> 'email'));

-- Allow admin users to manage waitlist (you'll need to set up admin roles)
CREATE POLICY "Admin can manage waitlist" ON public.waitlist
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Add indexes for performance
CREATE INDEX idx_waitlist_email ON public.waitlist(email);
CREATE INDEX idx_waitlist_priority ON public.waitlist(priority, created_at);
CREATE INDEX idx_waitlist_status ON public.waitlist(status, created_at);

-- Update function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for waitlist updated_at
CREATE TRIGGER update_waitlist_updated_at 
  BEFORE UPDATE ON public.waitlist 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add clerk_id column to users table if not exists
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS clerk_id text UNIQUE;

-- Update RLS policies to work with Clerk
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

CREATE POLICY "Users can view own data via Clerk" ON public.users
  FOR SELECT TO authenticated USING (
    clerk_id = (auth.jwt() ->> 'sub') OR 
    id = auth.uid()
  );

CREATE POLICY "Users can update own data via Clerk" ON public.users
  FOR UPDATE TO authenticated USING (
    clerk_id = (auth.jwt() ->> 'sub') OR 
    id = auth.uid()
  );

-- Allow Clerk user creation
CREATE POLICY "Allow Clerk user creation" ON public.users
  FOR INSERT TO authenticated WITH CHECK (
    clerk_id = (auth.jwt() ->> 'sub')
  );

-- Update other table policies to work with Clerk
DROP POLICY IF EXISTS "Users can manage own profiles" ON public.user_profiles;
CREATE POLICY "Users can manage own profiles via Clerk" ON public.user_profiles
  FOR ALL TO authenticated USING (
    user_id IN (
      SELECT id FROM public.users 
      WHERE clerk_id = (auth.jwt() ->> 'sub')
    )
  );

DROP POLICY IF EXISTS "Users can manage own accounts" ON public.connected_accounts;
CREATE POLICY "Users can manage own accounts via Clerk" ON public.connected_accounts
  FOR ALL TO authenticated USING (
    user_id IN (
      SELECT id FROM public.users 
      WHERE clerk_id = (auth.jwt() ->> 'sub')
    )
  );

DROP POLICY IF EXISTS "Users can manage own messages" ON public.messages;
CREATE POLICY "Users can manage own messages via Clerk" ON public.messages
  FOR ALL TO authenticated USING (
    user_id IN (
      SELECT id FROM public.users 
      WHERE clerk_id = (auth.jwt() ->> 'sub')
    )
  );

DROP POLICY IF EXISTS "Users can manage own action items" ON public.action_items;
CREATE POLICY "Users can manage own action items via Clerk" ON public.action_items
  FOR ALL TO authenticated USING (
    user_id IN (
      SELECT id FROM public.users 
      WHERE clerk_id = (auth.jwt() ->> 'sub')
    )
  );

DROP POLICY IF EXISTS "Users can manage own vip contacts" ON public.vip_contacts;
CREATE POLICY "Users can manage own vip contacts via Clerk" ON public.vip_contacts
  FOR ALL TO authenticated USING (
    user_id IN (
      SELECT id FROM public.users 
      WHERE clerk_id = (auth.jwt() ->> 'sub')
    )
  );

DROP POLICY IF EXISTS "Users can manage own insights" ON public.relationship_insights;
CREATE POLICY "Users can manage own insights via Clerk" ON public.relationship_insights
  FOR ALL TO authenticated USING (
    user_id IN (
      SELECT id FROM public.users 
      WHERE clerk_id = (auth.jwt() ->> 'sub')
    )
  );