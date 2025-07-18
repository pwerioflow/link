-- Adicionar 'video' como um novo tipo de link
ALTER TABLE public.links 
DROP CONSTRAINT IF EXISTS links_type_check;

ALTER TABLE public.links 
ADD CONSTRAINT links_type_check 
CHECK (type IN ('link', 'email', 'whatsapp', 'download', 'video'));

-- Adicionar 'video' como um novo tipo de ícone
ALTER TABLE public.links 
DROP CONSTRAINT IF EXISTS links_icon_type_check;

ALTER TABLE public.links 
ADD CONSTRAINT links_icon_type_check 
CHECK (icon_type IN ('instagram', 'email', 'website', 'download', 'whatsapp', 'video'));
