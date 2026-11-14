# Chez Léon Bike & Stay

Application web de location de vélos en libre-service, accessible par QR code dans les hébergements partenaires.
Stack : Next.js (React, TypeScript, Tailwind), Supabase (base de données PostgreSQL et connexion), Stripe (paiement, caution, Connect), Resend (emails), Vercel (hébergement).

> **Le projet est fonctionnel en mode démonstration dès l'étape 4 : aucun paiement réel, aucune caution réelle, aucun vrai cadenas.**
> Le paiement réel (Stripe) et les emails sont des étapes suivantes, à votre rythme.

## Ce que fait l'application

- **Client** : scanne le QR code de l'hébergement (`/h/<slug>`), choisit dates ou demi-journée, vélos et sacoches, paie, autorise la caution dans les 24 h avant le retrait, reçoit son code d'accès.
- **Hébergeur** (`/partner`) : voit ses vélos, ses réservations, sa commission estimée ; déclare le retour des vélos.
- **Administrateur Chez Léon** (`/admin`) : hébergements, vélos, tarifs et cautions, comptes partenaires, QR codes, réservations, clôture de location (libération ou capture partielle de la caution), versement des commissions.

## Tarifs de départ (modifiables dans l'administration)

| | Demi-journée | 1 jour | 2 jours | Dès 3 jours | Caution |
|---|---|---|---|---|---|
| Électrique | 26 € | 36 € | 65 € | 28 €/jour | 1 000 € |
| Musculaire | 16 € | 19 € | 32 € | 15 €/jour | 300 € |

Casque et antivol inclus, sacoche 5 € par jour. Journée : 9 h 00 – 18 h 30. Demi-journées : 9 h – 13 h et 14 h 30 – 18 h 30 (paramétrables).

---

## Installation pas à pas

### 1. Installer Node.js
Téléchargez la version « LTS » sur https://nodejs.org (version 20 ou plus). Vérifiez dans un terminal : `node -v`.

### 2. Créer la base de données (Supabase)
1. Créez un compte gratuit sur https://supabase.com puis un projet, **région Europe** (Paris ou Francfort). Notez le mot de passe de la base.
2. Dans le projet : **SQL Editor** → nouvelle requête → collez **tout** le contenu de `supabase/setup_complete.sql` → **Run**.
3. (Facultatif, recommandé pour tester) Collez et exécutez `supabase/seed_demo.sql` : 3 hébergements fictifs et 12 vélos, tous marqués « [DÉMO] ».
4. **Authentication → Users → Add user** : votre email et un mot de passe, cochez « Auto Confirm User ».
5. Ouvrez `supabase/make_admin.sql`, remplacez `VOTRE_EMAIL` par cet email, exécutez dans le SQL Editor. Vous êtes administrateur.

### 3. Renseigner les clés
1. Copiez `.env.example` en `.env.local`.
2. Dans Supabase : **Project Settings → API** : copiez l'URL dans `NEXT_PUBLIC_SUPABASE_URL`, la clé « anon public » dans `NEXT_PUBLIC_SUPABASE_ANON_KEY`, la clé « service_role » dans `SUPABASE_SERVICE_ROLE_KEY`.
   **La clé service_role est secrète : ne la partagez jamais, ne la mettez jamais dans un fichier public.**
3. Générez `APP_SECRET` : `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
4. Générez `CRON_SECRET` : `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
5. Laissez `NEXT_PUBLIC_DEMO_MODE=true` pour l'instant.

### 4. Lancer l'application
```
npm install
npm run dev
```
Ouvrez http://localhost:3000.
- `/login` : connectez-vous avec votre compte administrateur → `/admin`.
- Dans **Hébergements**, ouvrez « [DÉMO] Domaine de la Loire » : téléchargez son QR code.
- Ouvrez `/h/demo-domaine-villandry`, faites une réservation, puis « Simuler le paiement et la caution » : un **code fictif** s'affiche (il n'ouvre rien).
- Retournez dans **Réservations** pour la voir, et clôturez-la.

### 5. Brancher Stripe (mode test)
1. Dans votre compte Stripe, restez en **mode test**. Activez **Connect** (Tableau de bord → Connect).
2. Copiez la clé secrète de test dans `STRIPE_SECRET_KEY`.
3. Installez la Stripe CLI (https://docs.stripe.com/stripe-cli), puis : `stripe listen --forward-to localhost:3000/api/stripe/webhook`. Elle affiche un secret `whsec_…` : mettez-le dans `STRIPE_WEBHOOK_SECRET`.
4. Passez `NEXT_PUBLIC_DEMO_MODE=false`, redémarrez `npm run dev`.
5. Réservez : paiement avec la carte de test `4242 4242 4242 4242` (date future, CVC quelconque). Pour tester l'authentification 3D Secure : `4000 0025 0000 3155`.
6. La caution se propose dans les 24 h avant le retrait. Pour tester, créez une réservation pour le jour même.
7. Pour l'inscription d'un hébergeur à Stripe Connect : fiche de l'hébergement → « Lancer l'inscription Stripe ». Utilisez les données de test de Stripe.

### 6. Emails (Resend)
Créez un compte sur https://resend.com, vérifiez votre domaine d'envoi, renseignez `RESEND_API_KEY` et `EMAIL_FROM`. Sans ces valeurs, les emails sont simplement ignorés.

### 7. Mise en ligne (Vercel)
1. Mettez le projet dans un dépôt GitHub privé.
2. Sur https://vercel.com : « Add New Project », importez le dépôt, ajoutez **toutes** les variables du `.env.local` (avec `NEXT_PUBLIC_APP_URL=https://bike.chezleonlocation.com`).
3. Dans Vercel → Domains : ajoutez `bike.chezleonlocation.com` ; chez votre hébergeur de domaine, créez l'enregistrement DNS (CNAME) indiqué par Vercel.
4. Stripe (mode live, plus tard) : ajoutez un webhook vers `https://bike.chezleonlocation.com/api/stripe/webhook` avec les événements `checkout.session.completed`, `payment_intent.amount_capturable_updated`, `account.updated`, et copiez son secret dans Vercel.
5. Les rappels de caution tournent tous les jours à 15 h UTC (`vercel.json`).

> ⚠️ **Le plan gratuit « Hobby » de Vercel est réservé à un usage non commercial.** Pour une activité commerciale, prévoyez le plan Pro. Vérifiez les conditions actuelles de Vercel.

---

## Avant d'ouvrir au public (liste de contrôle)

- [ ] Compléter et faire valider par un juriste : `/conditions`, `/confidentialite`, `/mentions-legales` (modèles à trous) et le barème de dommages.
- [ ] Tester tout le parcours en mode test Stripe, avec 2 ou 3 vrais téléphones.
- [ ] Choisir les horaires de demi-journée définitifs (table `application_settings`, clé `half_day_slots`).
- [ ] Définir la politique de retard et d'annulation, et l'assurance.
- [ ] Passer Stripe en mode live (nouvelles clés, nouveau webhook) et faire valider les comptes Connect des hébergeurs.
- [ ] Changer les mots de passe provisoires des hébergeurs (page `/account/password`).
- [ ] Imprimer les QR codes **après** avoir figé les adresses web (slug) des hébergements.
- [ ] Supprimer les données de démonstration (hébergements et vélos « [DÉMO] »).

## Exploitation au quotidien

- Après chaque retour de vélo : contrôle, changement du code du cadenas, puis fiche du vélo → statut « Disponible ».
- Le code d'accès réel n'est pas encore généré automatiquement : en mode réel, vous communiquez le code du cadenas selon votre procédure (fonctionnalité à ajouter selon la marque du cadenas).
- Un retour déclaré par l'hébergeur apparaît dans le tableau de bord ; vous le clôturez en indiquant le dommage éventuel (0 € = caution libérée).

## Vérifications automatiques

```
npm run typecheck   # types TypeScript
npm test            # tests unitaires (prix, créneaux, Stripe, emails…)
npm run test:db     # base de données : migrations, sécurité, paiements, restitutions
```

## Limites connues

- Le test réel avec Supabase et Stripe n'a pas encore été fait : prévoyez une phase de recette.
- Stock de sacoches : limité par établissement, sans tenir compte des autres réservations simultanées.
- Pas de disponibilité affichée en direct avant validation du formulaire.
- Pas de remboursement manuel ni de gestion des litiges bancaires dans l'application (à faire depuis Stripe).
- Textes en français uniquement dans le code (l'anglais est prévu dans `src/i18n`, pas encore branché partout).
- Protection anti-abus de base (limitation par email, champ piège). Pour aller plus loin : captcha (Cloudflare Turnstile) et pare-feu Vercel.
