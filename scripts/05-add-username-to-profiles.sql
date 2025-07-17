-- Adicionar coluna username à tabela profiles
ALTER TABLE public.profiles
ADD COLUMN username TEXT UNIQUE;

-- Opcional: Adicionar uma restrição de formato para o username (apenas letras minúsculas, números, hífens e underscores)
-- Isso ajuda a garantir URLs limpas.
ALTER TABLE public.profiles
ADD CONSTRAINT username_format_check CHECK (username ~ '^[a-z0-9_-]+$' OR username IS NULL);

-- Opcional: Criar um índice para buscas mais rápidas por username
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (username);

-- Atualizar a função handle_new_user para definir um username inicial (opcional, mas útil)
-- Isso pode ser um UUID ou um username temporário.
-- Para simplicidade, vamos deixar como NULL e o usuário define no admin.
-- Se você quiser um username padrão, pode modificar a função handle_new_user.
