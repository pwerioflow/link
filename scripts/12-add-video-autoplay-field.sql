-- Adicionar campo autoplay_video à tabela links
ALTER TABLE public.links 
ADD COLUMN autoplay_video BOOLEAN DEFAULT false;

-- Comentário: Este campo controla se o vídeo deve começar automaticamente quando expandido
