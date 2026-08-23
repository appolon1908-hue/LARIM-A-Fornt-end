export interface BookingFlowState {
  quote:any|null; booking:any|null; quoteKey:string|null; bookingKey:string|null; paymentKey:string|null; confirmKey:string|null
}
export function useBookingFlow(){
  return useState<BookingFlowState>('booking-flow',()=>({quote:null,booking:null,quoteKey:null,bookingKey:null,paymentKey:null,confirmKey:null}))
}
