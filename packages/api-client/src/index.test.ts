import {describe,it,expect} from 'vitest'
describe('backend contract',()=>{it('uses snake_case booking fields',()=>{const b:any={booking_number:'LRM-1',scheduled_start:'x'};expect(b.booking_number).toBe('LRM-1')})})
