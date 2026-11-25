-- Tailles de vélo, tandem et accessoires supplémentaires (boutique Chez Léon).
-- Compatible avec l'existant : une ligne de réservation sans taille réserve n'importe quel vélo du type, comme avant.

-- 1) Tailles proposées par type de vélo (ordre d'affichage)
alter table public.bike_types add column if not exists sizes text[] not null default '{}';
update public.bike_types set sizes = '{S,M,L}'   where code = 'classic' and sizes = '{}';
update public.bike_types set sizes = '{S/M,L/XL}' where code = 'electric' and sizes = '{}';

-- 2) Taille demandée sur une ligne de réservation (null = taille indifférente)
alter table public.reservation_items add column if not exists frame_size text;

-- 3) Nouveaux accessoires payants, désactivés tant que leur prix n'est pas fixé dans l'admin
insert into public.accessories (code, label, daily_price_cents, is_included, is_enabled) values
  ('phone_holder', 'Support smartphone', 0, false, false),
  ('child_trailer', 'Remorque enfant', 0, false, false),
  ('girafe', 'Girafe (vélo suiveur)', 0, false, false)
on conflict (code) do nothing;

-- 4) Attribution des vélos : respecte la taille demandée quand il y en a une
create or replace function public.create_reservation_draft(p_accommodation_id uuid, p_start timestamp with time zone, p_end timestamp with time zone, p_billed_days integer, p_items jsonb, p_accessories jsonb, p_customer jsonb, p_total_cents integer, p_deposit_cents integer, p_token_hash text, p_hold_minutes integer, p_is_demo boolean)
 returns uuid
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_period tstzrange := tstzrange(p_start, p_end, '[)');
  v_customer uuid; v_res uuid; v_bike uuid; v_number text; item jsonb; i int; v_size text;
begin
  perform release_expired_holds();

  insert into customers (first_name, last_name, email, phone, country, marketing_consent)
  values (p_customer->>'first_name', p_customer->>'last_name', lower(p_customer->>'email'), p_customer->>'phone',
          p_customer->>'country', coalesce((p_customer->>'marketing_consent')::boolean, false))
  returning id into v_customer;

  v_number := 'CL-' || to_char(now() at time zone 'Europe/Paris', 'YYYY') || '-' || lpad(nextval('reservation_number_seq')::text, 4, '0');

  insert into reservations (number, accommodation_id, customer_id, start_at, end_at, billed_days, status, payment_status,
                            deposit_status, total_cents, deposit_amount_cents, access_token_hash, accepted_terms_at, is_demo)
  values (v_number, p_accommodation_id, v_customer, p_start, p_end, p_billed_days, 'pending_payment', 'pending',
          'pending', p_total_cents, p_deposit_cents, p_token_hash, now(), p_is_demo)
  returning id into v_res;

  for item in select * from jsonb_array_elements(p_items) loop
    v_size := nullif(item->>'frame_size', '');
    insert into reservation_items (reservation_id, bike_type_id, quantity, unit_price_cents, frame_size)
    values (v_res, (item->>'bike_type_id')::uuid, (item->>'quantity')::int, (item->>'unit_price_cents')::int, v_size);

    for i in 1 .. (item->>'quantity')::int loop
      v_bike := null;
      select b.id into v_bike from bikes b
       where b.accommodation_id = p_accommodation_id
         and b.bike_type_id = (item->>'bike_type_id')::uuid
         and (v_size is null or b.frame_size = v_size)
         and b.status = 'available'
         and not exists (select 1 from reservation_bike_assignments a
                          where a.bike_id = b.id and a.active and a.period && v_period)
       order by b.internal_code
       limit 1
       for update of b skip locked;
      if v_bike is null then raise exception 'NOT_ENOUGH_BIKES'; end if;
      insert into reservation_bike_assignments (reservation_id, bike_id, period) values (v_res, v_bike, v_period);
      insert into availability_holds (reservation_id, bike_id, period, expires_at)
      values (v_res, v_bike, v_period, now() + make_interval(mins => p_hold_minutes));
    end loop;
  end loop;

  for item in select * from jsonb_array_elements(p_accessories) loop
    if (item->>'quantity')::int > 0 then
      insert into reservation_accessories (reservation_id, accessory_id, quantity, unit_price_cents)
      values (v_res, (item->>'accessory_id')::uuid, (item->>'quantity')::int, (item->>'unit_price_cents')::int);
    end if;
  end loop;

  return v_res;
end $function$;
