import { ParkingSpaceWithTicket } from "../context/types";

export const calculatePriceByParkingSpace = (
  parkingSpace: ParkingSpaceWithTicket
) => {
  if (parkingSpace.ticket?.paymentDate) {
    return 0; // Ticket paid before
  }
  const exitDate = Date.now();
  const hours = Math.ceil(
    (exitDate - parkingSpace.ticket.enterDate) / (60 * 60 * 1000)
  );
  return hours * 2;
};
