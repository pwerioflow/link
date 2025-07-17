-- =============================================
-- SCRIPT COMPLETO PARA CONFIGURAR O LINKTREE
-- Execute este script único no Supabase
-- =============================================

-- 1. CRIAR TABELAS (se não existirem)
-- =============================================

-- Criar tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  business_name TEXT NOT NULL DEFAULT 'Meu Negócio',
  business_description TEXT DEFAULT 'Descrição do negócio',
  business_logo_url TEXT,
  company_logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela settings
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  button_color TEXT DEFAULT '#EBE4DA',
  button_hover_color TEXT DEFAULT '#6C3F21',
  text_color TEXT DEFAULT '#374151',
  text_hover_color TEXT DEFAULT '#ffffff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela links
CREATE TABLE IF NOT EXISTS public.links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  href TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('link', 'email', 'whatsapp', 'download')),
  icon_type TEXT NOT NULL CHECK (icon_type IN ('instagram', 'email', 'website', 'download', 'whatsapp')),
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela qr_code_metrics
CREATE TABLE IF NOT EXISTS public.qr_code_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE, -- UNIQUE para garantir uma entrada por usuário
  scan_count INTEGER NOT NULL DEFAULT 0,
  last_scanned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. HABILITAR RLS (Row Level Security)
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_code_metrics ENABLE ROW LEVEL SECURITY;

-- 3. REMOVER POLÍTICAS EXISTENTES (se houver)
-- =============================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.settings;
DROP POLICY IF EXISTS "Public can view settings" ON public.settings;

DROP POLICY IF EXISTS "Users can view own links" ON public.links;
DROP POLICY IF EXISTS "Users can insert own links" ON public.links;
DROP POLICY IF EXISTS "Users can update own links" ON public.links;
DROP POLICY IF EXISTS "Users can delete own links" ON public.links;
DROP POLICY IF EXISTS "Public can view active links" ON public.links;

DROP POLICY IF EXISTS "Users can view own qr_code_metrics" ON public.qr_code_metrics;
DROP POLICY IF EXISTS "Users can update own qr_code_metrics" ON public.qr_code_metrics;
DROP POLICY IF EXISTS "Users can insert own qr_code_metrics" ON public.qr_code_metrics;

-- 4. CRIAR POLÍTICAS RLS
-- =============================================

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can view profiles" ON public.profiles
  FOR SELECT USING (true);

-- Políticas para settings
CREATE POLICY "Users can view own settings" ON public.settings
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own settings" ON public.settings
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own settings" ON public.settings
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can view settings" ON public.settings
  FOR SELECT USING (true);

-- Políticas para links
CREATE POLICY "Users can view own links" ON public.links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own links" ON public.links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own links" ON public.links
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own links" ON public.links
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public can view active links" ON public.links
  FOR SELECT USING (is_active = true);

-- Políticas para qr_code_metrics
CREATE POLICY "Users can view own qr_code_metrics" ON public.qr_code_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own qr_code_metrics" ON public.qr_code_metrics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own qr_code_metrics" ON public.qr_code_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. CRIAR BUCKETS DE STORAGE (se não existirem)
-- =============================================

INSERT INTO storage.buckets (id, name, public) 
SELECT 'logos', 'logos', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'logos');

INSERT INTO storage.buckets (id, name, public) 
SELECT 'downloads', 'downloads', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'downloads');

-- 6. REMOVER POLÍTICAS DE STORAGE EXISTENTES
-- =============================================

DROP POLICY IF EXISTS "Users can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete logos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view logos" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload downloads" ON storage.objects;
DROP POLICY IF EXISTS "Users can update downloads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete downloads" ON storage.objects;
DROP POLICY IF EXISTS "Public can view downloads" ON storage.objects;

-- 7. CRIAR POLÍTICAS DE STORAGE
-- =============================================

-- Políticas para bucket logos
CREATE POLICY "Users can upload logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'logos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update logos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'logos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete logos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'logos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public can view logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'logos');

-- Políticas para bucket downloads
CREATE POLICY "Users can upload downloads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'downloads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update downloads" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'downloads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete downloads" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'downloads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public can view downloads" ON storage.objects
  FOR SELECT USING (bucket_id = 'downloads');

-- 8. REMOVER FUNÇÕES E TRIGGERS EXISTENTES
-- =============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;
DROP TRIGGER IF EXISTS update_links_updated_at ON public.links;
DROP TRIGGER IF EXISTS update_qr_code_metrics_updated_at ON public.qr_code_metrics; -- Novo trigger

DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- 9. CRIAR FUNÇÕES E TRIGGERS
-- =============================================

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, business_name, business_description)
  VALUES (NEW.id, 'Meu Negócio', 'Descrição do meu negócio');
  
  INSERT INTO public.settings (id)
  VALUES (NEW.id);

  -- Inserir registro inicial para qr_code_metrics
  INSERT INTO public.qr_code_metrics (user_id, scan_count)
  VALUES (NEW.id, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_links_updated_at
  BEFORE UPDATE ON public.links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_qr_code_metrics_updated_at -- Novo trigger
  BEFORE UPDATE ON public.qr_code_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- CONFIGURAÇÃO COMPLETA!
-- Agora você pode usar o sistema normalmente
-- =============================================
