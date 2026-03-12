CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    nome TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'consultor', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
    ON public.usuarios
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.usuarios
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
