-- Boutique Chez Léon : point de location « au comptoir » (retrait et retour en boutique, sans commission ni boîte à clés).
-- Ajout sans effet sur l'existant : tous les hébergements actuels restent en "self_service".
alter table public.accommodations
  add column if not exists mode text not null default 'self_service'
  check (mode in ('self_service', 'counter'));

comment on column public.accommodations.mode is
  'self_service = hébergement partenaire en libre-service ; counter = boutique Chez Léon, retrait au comptoir';
