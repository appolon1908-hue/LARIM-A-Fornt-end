export type Role =
  | 'customer' | 'provider' | 'dispatcher' | 'support' | 'safety'
  | 'finance' | 'quality' | 'compliance' | 'catalog_manager'
  | 'partner_booker' | 'platform_admin'

export type Capability =
  | 'request_intake' | 'provider_self_service' | 'matching' | 'quotes'
  | 'messaging' | 'reviews' | 'instant_booking' | 'automatic_assignment'
  | 'payments' | 'payouts' | 'memberships' | 'partners'
