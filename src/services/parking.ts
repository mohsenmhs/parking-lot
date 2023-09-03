import { ticketState } from "../context/constant";
import { ParkingSpaceWithTicket } from "../context/types";

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
