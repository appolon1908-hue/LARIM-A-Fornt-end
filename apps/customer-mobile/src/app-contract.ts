export const CUSTOMER_REGION = 'DO · Santo Domingo' as const
export const CUSTOMER_TAGLINE = 'Tu bienestar llega a ti.' as const

export const CUSTOMER_SERVICES = [
  'Massage',
  'Haircut',
  'Makeup',
  'Personal Training',
] as const

export type CustomerService = (typeof CUSTOMER_SERVICES)[number]
