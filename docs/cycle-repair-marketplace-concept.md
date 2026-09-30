# Kaamly - Cycle Repair Marketplace (condensed product spec)

## Concept
A hyperlocal on-demand cycle repair marketplace. A customer finds local cycle shops and their mechanics, sees profiles, ratings, services and charges, and books a mechanic who comes to the customer's location to repair the cycle at their doorstep. Not just a directory. Existing local cycle shops are the supply side.

## Customer flow
Choose location -> see cycle shops there (sort by nearest / highest rated / most available) -> open a shop -> see its mechanics -> open mechanic profile (rating, experience, services, visit charge, availability) -> pick a repair service -> see estimated price -> book -> mechanic accepts -> on the way -> arrived -> inspection -> extra work needs customer approval -> repair -> payment -> rating/review.

## Location
Two modes: current location (GPS) or manual search of a city/area. If the customer searched a place other than where they are, show distance from the SELECTED location, not their GPS position.

## Shop sources
Shops come from two places: map/API discovery, and admin-added shops (many small shops are not on Google Maps). Customers see them together in one list. The shops table has a source column: MAP or ADMIN. Our own database is the source of truth, never the map provider.

## Shop vs mechanic
A shop has many mechanics. Mechanics can also be independent later. Shop rating and mechanic rating are SEPARATE and never merged.

## Three interfaces
1. Customer (mobile): signup/login, location, shop list, shop page, mechanics, book, track, pay, review.
2. Mechanic (same mobile app, role-based screens): login, profile, shop association, services, availability ON/OFF, receive requests, accept/reject, mark on the way / arrived, submit final charges, complete job, earnings, history.
3. Admin (web dashboard, built later): add/edit/deactivate shops manually, add/manage mechanics, approve mechanic registrations, manage services and pricing, view bookings, customers, payments, ratings.
Mechanic onboarding is manual at first (admin creates/approves mechanics).

## Pricing
Total = service charge + visit/inspection charge + distance/travel charge + parts. Show an estimate before booking. Additional work or parts found on inspection require customer approval before charging. Use standardized services with baseline prices (puncture, brake adjustment, gear adjustment, chain repair, wheel repair, general inspection, full servicing) rather than every mechanic inventing prices. Example travel fee: base 30 rupees, plus 10 per km after the first 2 km (placeholder numbers).

## Booking state machine (exact states, in order)
REQUESTED -> SEARCHING -> MECHANIC_ASSIGNED -> MECHANIC_ACCEPTED -> ON_THE_WAY -> ARRIVED -> INSPECTION -> CUSTOMER_APPROVAL -> REPAIR_IN_PROGRESS -> COMPLETED -> PAYMENT -> RATING
(Also allow CANCELLED and REJECTED.)
For now the customer chooses the mechanic directly; SEARCHING and MECHANIC_ASSIGNED exist for future automatic matching.

## Core entities
User (role: CUSTOMER / MECHANIC / ADMIN), Shop, Mechanic, Service, Booking, Payment, Review, Location.
Shop fields: id, name, ownerName, phone, address, city, area, latitude, longitude, rating, source (MAP/ADMIN), status.
Relationships: Shop has many Mechanics and Services. Customer has many Bookings. Mechanic has many Bookings and Reviews. A Booking links Customer, Mechanic, Shop, Service and Payment.

## MVP scope
Customer: login/signup, location search, shop listing and sorting, shop profile, mechanic listing and profile, ratings, services, price estimate, booking, booking status, payment, review.
Mechanic: login, profile, availability toggle, receive/accept/reject requests, status updates, add final charges, complete job, history.
Admin: login, add/edit/deactivate shops, add/manage mechanics, verify mechanics, manage services and pricing, view bookings/customers/payments/ratings.
Later (V2): live tracking, in-app chat, coupons, subscriptions, emergency repair mode, automatic matching.

## Principles
Customer should not see internal complexity. Shop and mechanic ratings stay separate. Price must be transparent. Admin can always intervene. External map data is never the only source. Launch in one small area first.
