import { ParkingSpaceWithTicket } from "../context/types";

export const calculatePriceByParkingSpace = (
  parkingSpace: ParkingSpaceWithTicket
) => {
  if (parkingSpace.ticket?.paymentDate) {
    return 0; // Ticket paid before
  }
  const exitDate = Date.now();

  return calculatePriceByDates(parkingSpace.ticket.enterDate, exitDate);
};


export const calculatePriceByDates = (
  enterDate: number,
  exitDate: number,
) => {

  const hours = Math.ceil(
    (exitDate - enterDate) / (60 * 60 * 1000)
  );
  return hours * 2;

}
