export const brand = {
  colors: {
    larimarDeep: '#0B4F5C',
    caribbeanTeal: '#19A7A0',
    caribbeanTealSoft: '#E7F5F2',
    warmSand: '#F5EFE5',
    canvas: '#F8F5EF',
    nightSlate: '#17242B',
    warmGold: '#C89B5D',
    danger: '#8E2424',
    warning: '#9A6500',
    success: '#176B4D',
    border: '#E6E0D7',
    white: '#FFFFFF',
  },
  typography: {
    family: 'Manrope, Inter, ui-sans-serif, system-ui, sans-serif',
    displayWeight: 800,
    bodyWeight: 500,
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  radius: {
    control: '0.875rem',
    card: '1.375rem',
    hero: '1.875rem',
    pill: '999px',
  },
  shadow: {
    card: '0 8px 32px rgba(23, 36, 43, 0.04)',
    elevated: '0 18px 60px rgba(23, 36, 43, 0.08)',
  },
  motion: {
    fast: '120ms',
    normal: '220ms',
  },
} as const

export const bookingStatusLabels: Record<string, { es: string; en: string }> = {
  DRAFT: { es: 'Borrador', en: 'Draft' },
  QUOTED: { es: 'Cotizada', en: 'Quoted' },
  CONFIRMED: { es: 'Confirmada', en: 'Confirmed' },
  MATCHING: { es: 'Buscando profesional', en: 'Matching' },
  ASSIGNED: { es: 'Profesional asignado', en: 'Assigned' },
  EN_ROUTE: { es: 'En camino', en: 'En route' },
  ARRIVED: { es: 'Llegó', en: 'Arrived' },
  IN_SERVICE: { es: 'En servicio', en: 'In service' },
  COMPLETED: { es: 'Completada', en: 'Completed' },
  SETTLING: { es: 'Procesando pago', en: 'Settling' },
  SETTLED: { es: 'Liquidada', en: 'Settled' },
  CANCELLED: { es: 'Cancelada', en: 'Cancelled' },
  DISPUTED: { es: 'En disputa', en: 'Disputed' },
}
