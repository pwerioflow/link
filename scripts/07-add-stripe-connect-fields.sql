-- Adicionar campos do Stripe Connect à tabela profiles
ALTER TABLE public.profiles
ADD COLUMN stripe_account_id TEXT,
ADD COLUMN stripe_onboarding_complete BOOLEAN DEFAULT false,
ADD COLUMN stripe_charges_enabled BOOLEAN DEFAULT false,
ADD COLUMN stripe_payouts_enabled BOOLEAN DEFAULT false;

-- Criar índice para buscas por stripe_account_id
CREATE INDEX IF NOT EXISTS profiles_stripe_account_id_idx ON public.profiles (stripe_account_id);
