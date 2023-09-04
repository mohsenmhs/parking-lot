export const paymentMethods = ["credit card", "debit", "card", "cash"];
export enum ticketState {
    paid =  "paid",
    unpaid =  "unpaid" 
}

export const expirePaidDateDuration = 15 * 60 * 1000; ///15 Minutes in milisecond