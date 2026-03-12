-- Set default value for user_id to auth.uid() if the column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'templates' 
        AND column_name = 'user_id'
    ) THEN
        EXECUTE 'ALTER TABLE public.templates ALTER COLUMN user_id SET DEFAULT auth.uid()';
    END IF;
END $$;

-- Drop any existing policies on the templates table to avoid conflicts
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'templates'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.templates', pol.policyname);
    END LOOP;
END
$$;

-- Create permissive policies for authenticated users
CREATE POLICY "templates_select_policy" 
ON public.templates FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "templates_insert_policy" 
ON public.templates FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "templates_update_policy" 
ON public.templates FOR UPDATE 
TO authenticated 
USING (true) WITH CHECK (true);

CREATE POLICY "templates_delete_policy" 
ON public.templates FOR DELETE 
TO authenticated 
USING (true);
