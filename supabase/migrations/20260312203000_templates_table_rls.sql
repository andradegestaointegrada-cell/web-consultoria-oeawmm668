DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow authenticated to insert templates" ON public.templates;
    DROP POLICY IF EXISTS "Allow authenticated to update templates" ON public.templates;
    DROP POLICY IF EXISTS "Allow authenticated to delete templates" ON public.templates;
END
$$;

CREATE POLICY "Allow authenticated to insert templates" 
ON public.templates FOR INSERT TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated to update templates" 
ON public.templates FOR UPDATE TO authenticated 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated to delete templates" 
ON public.templates FOR DELETE TO authenticated 
USING (true);
