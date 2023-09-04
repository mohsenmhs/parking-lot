import { expirePaidDateDuration, ticketState } from "../context/constant";
import {
  ParkingSpaceWithPaidTicket,
  ParkingSpaceWithTicket,
} from "../context/types";
import { getRandumNumber } from "../utils/utils";

export const calculatePriceByParkingSpace = (
  parkingSpace: ParkingSpaceWithTicket
) => {
  const exitDate = Date.now();
  return calculatePriceByDates(parkingSpace.ticket.enterDate, exitDate);
};

export const calculatePriceByDates = (enterDate: number, exitDate: number) => {
  const hours = Math.ceil((exitDate - enterDate) / (60 * 60 * 1000));
  return hours * 2;
};

export const createNewTicket = () => {
  return {
    barcode: getRandumNumber(16).toString(),
    enterDate: Date.now(), // get current date
    state: ticketState.unpaid,
    paid: 0,
  };
};

export const paidDateExired = (paidDate: number) =>
  Date.now() - paidDate > expirePaidDateDuration;

export const updateTicketState = (
  ps: ParkingSpaceWithPaidTicket
): ParkingSpaceWithPaidTicket => {
  return {
    ...ps,
    ticket: {
      ...ps.ticket,
      state: paidDateExired(ps.ticket.paymentDate)
        ? ticketState.unpaid
        : ticketState.paid,
    },
  };
};
