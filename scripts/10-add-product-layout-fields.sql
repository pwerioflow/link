-- Adicionar novos campos à tabela products
ALTER TABLE public.products
ADD COLUMN display_size TEXT DEFAULT 'full' CHECK (display_size IN ('half', 'full')),
ADD COLUMN stock_quantity INTEGER,
ADD COLUMN gallery_images TEXT[]; -- Array de URLs das imagens da galeria

-- Adicionar campo hero_banner_url à tabela profiles
ALTER TABLE public.profiles
ADD COLUMN hero_banner_url TEXT;
