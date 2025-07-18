-- Atualizar função para criar assinatura junto com o usuário
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

  -- Inserir assinatura inicial (trial de 7 dias)
  INSERT INTO public.subscriptions (user_id, status, trial_end, plan_name, plan_price)
  VALUES (NEW.id, 'trialing', NOW() + INTERVAL '7 days', 'basic', 29.90);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
