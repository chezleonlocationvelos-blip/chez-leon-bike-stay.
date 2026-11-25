-- Siège bébé (boutique), désactivé tant que son prix n'est pas fixé dans l'admin.
insert into public.accessories (code, label, daily_price_cents, is_included, is_enabled)
values ('baby_seat', 'Siège bébé', 0, false, false)
on conflict (code) do nothing;
