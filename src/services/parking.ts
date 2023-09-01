import { ticketState } from "../context/constant";
import { ParkingSpaceWithTicket } from "../context/types";

export const calculatePriceByParkingSpace = (
  parkingSpace: ParkingSpaceWithTicket
) => {
  if (parkingSpace?.ticket?.state === ticketState.paid) return 0;
  
  const paidBefore = parkingSpace.ticket?.paymentDate
    ? calculatePriceByDates(parkingSpace.ticket.enterDate, parkingSpace.ticket.paymentDate)
    : 0;

  const exitDate = Date.now();

  return calculatePriceByDates(parkingSpace.ticket.enterDate, exitDate) - paidBefore;
};

export const calculatePriceByDates = (enterDate: number, exitDate: number) => {
  const hours = Math.ceil((exitDate - enterDate) / (60 * 60 * 1000));
  return hours * 2;
};
