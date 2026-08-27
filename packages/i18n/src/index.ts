export const messages = {
  'es-DO': {
    brandPromise: 'Tu bienestar llega a ti.',
    bookNow: 'Reservar',
    upcoming: 'Próximas citas',
    signIn: 'Iniciar sesión',
    signOut: 'Cerrar sesión',
    selectService: 'Selecciona un servicio',
    selectAddress: 'Selecciona una dirección',
    selectTime: 'Selecciona una hora',
    paymentUnavailable: 'El pago seguro todavía no está configurado.',
    retry: 'Reintentar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
  },
  'en-US': {
    brandPromise: 'Wellness, delivered personally.',
    bookNow: 'Book now',
    upcoming: 'Upcoming appointments',
    signIn: 'Sign in',
    signOut: 'Sign out',
    selectService: 'Select a service',
    selectAddress: 'Select an address',
    selectTime: 'Select a time',
    paymentUnavailable: 'Secure payment is not configured yet.',
    retry: 'Retry',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
} as const

export type LarimiaLocale = keyof typeof messages
export type LarimiaMessageKey = keyof typeof messages['es-DO']

export function translate(
  locale: LarimiaLocale,
  key: LarimiaMessageKey,
): string {
  return messages[locale]?.[key] || messages['es-DO'][key]
}
