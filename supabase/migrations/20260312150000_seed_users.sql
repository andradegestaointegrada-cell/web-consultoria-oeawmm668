DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  -- Insert seed auth user
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, email_change_token_current,
    phone, phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@agiconsult.com',
    crypt('password123', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Admin Consultor"}',
    false, 'authenticated', 'authenticated',
    '', '', '', '', '', NULL, '', '', ''
  );

  -- Insert corresponding profile in public.usuarios
  INSERT INTO public.usuarios (id, email, nome, role)
  VALUES (new_user_id, 'admin@agiconsult.com', 'Admin Consultor', 'admin');
END $$;
