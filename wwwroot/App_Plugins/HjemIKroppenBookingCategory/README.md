# Bookingkategori – Umbraco-opsætning

Dropdown til Umbraco 17, hvor redaktøren vælger en af booking-API'ets kategorier. Den gemmer kategoriens **id**
(ikke navnet), så valget holder, selv om kategorien omdøbes.

## 1. Installér pluginet

Mappen ligger i `wwwroot/App_Plugins/HjemIKroppenBookingCategory` og kommer med i Docker-imaget ved publish.
Genstart sitet efter ændringer. Backoffice cacher `umbraco-package.json`, så hard-refresh browseren (Ctrl+F5).

Booking-API'et skal tillade Umbracos adresse i CORS:

- Lokalt: `"https://localhost:44304"` står i booking-API'ets `appsettings.Development.json`.
- Docker: sæt `UMBRACO_ORIGIN` i `.env` (bliver til `AllowedOrigins__1`).

## 2. Datatype

**Indstillinger → Datatyper → Opret**

| Felt | Værdi |
|---|---|
| Navn | Bookingkategori |
| Property editor | Bookingkategori (gruppen *Pickers*) |
| Booking-API-adresse | Lokalt `https://localhost:7079` (https, da backoffice kører på https). I drift booking-API'ets offentlige adresse. Uden `/` til sidst |

## 3. Element types (til Block Lists)

**Anmeldelse** (alias `testimonial`, *Is an element type*)

| Navn | Alias | Editor |
|---|---|---|
| Citat | `quote` | Textarea |
| Navn | `name` | Textstring |
| Stjerner | `rating` | Numeric (1–5) |

**Bookingmulighed** (alias `bookingOption`, *Is an element type*)

| Navn | Alias | Editor |
|---|---|---|
| Titel | `title` | Textstring |
| Forløbs-id (valgfri) | `seriesId` | Textstring |

## 4. Dokumenttype "Terapiside"

Alias **`therapyPage`** – frontenden finder siderne via dette alias. Tilføj den som tilladt barn under forsiden.
Brug samme SEO-composition som forsiden (`metaTitle`, `metaDescription`, `ogImage`).

| Navn | Alias | Editor |
|---|---|---|
| Titel | `heading` | Textstring |
| Beskrivelse | `info` | Textarea |
| Billede | `image` | Media Picker (ét billede) |
| Kortbillede | `cardImage` | Media Picker (ét billede, valgfrit). Bruges på forsidens kort; tomt = sidens billede |
| Målgruppe | `audience` | Textstring (fx "1:1" eller "Hold") |
| Deltagere | `participants` | Textstring (fx "4 personer pr. hold") |
| Anmeldelser | `testimonials` | Block List med *Anmeldelse* |
| Bookingmuligheder | `bookingOptions` | Block List med *Bookingmulighed* |
| Bookingkategori | `bookingCategory` | Datatypen *Bookingkategori* |

Kun Titel er nødvendig; alle andre felter må være tomme.

## Sådan bruges det

- Sidens adresse kommer fra dens navn i Umbraco, fx "Danseterapi" → `/danseterapi`.
- Forsidens kort vises i samme rækkefølge som siderne i Umbraco-træet.
- "Book"-knapperne på siden viser kalenderen filtreret på den valgte bookingkategori. Uden kategori vises alle tider.
- Kun udgivne sider vises på sitet.
