import * as React from "react";
import { PARKING_CAPACITY } from "../config";
import {
  ParkingContextType,
  ParkingSpace,
  ParkingSpaceWithPaidTicket,
  ParkingSpaceWithTicket,
} from "./types";
import { getRandumNumber, paidDateExired } from "../utils/utils";
import { ticketState } from "./constant";
import {
  calculatePriceByDates
} from "../services/parking";

export const ParkingContext = React.createContext<
  ParkingContextType | undefined
>(undefined);

function initParking(): ParkingSpace[] {
  if (localStorage.getItem("parkingSpaces")) {
    const localStorageParkingSpaces = JSON.parse(
      localStorage.getItem("parkingSpaces") || ""
    );
    return localStorageParkingSpaces.map((parkingSpace: ParkingSpace) => {
      //if State was undefined (from old version localstorage)
      if (parkingSpace.ticket && !parkingSpace.ticket?.state)
        (parkingSpace as ParkingSpaceWithPaidTicket).ticket.state =
          ticketState.unpaid;

      //if State was paid and expired
      if (parkingSpace.ticket?.state === ticketState.paid) {
        const ps = parkingSpace as ParkingSpaceWithPaidTicket;
        ps.ticket.state = paidDateExired(ps.ticket.paymentDate)
          ? ticketState.unpaid
          : ticketState.paid;
      }

      //if Paid was undefined (from old version localstorage)
      if (
        parkingSpace.ticket &&
        !((parkingSpace as ParkingSpaceWithTicket).ticket?.paid >= 0)
      ) {
        parkingSpace.ticket.paid = parkingSpace.ticket.paymentDate
          ? calculatePriceByDates(
              parkingSpace.ticket.enterDate,
              parkingSpace.ticket.paymentDate
            )
          : 0;
      }
      return parkingSpace;
    });
  }

  return [...Array(PARKING_CAPACITY)].map((_, idx: number) => ({
    spaceNumber: idx + 1,
    ticket: null,
  }));
}

export function ParkingContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [parkingSpaces, setParkingSpaces] = React.useState(initParking());
  const [selectedParkingSpace, setSelectedParkingSpace] =
    React.useState<ParkingSpaceWithTicket | null>(null);

  const updateParkingSpace = (parkingSpace: ParkingSpace) => {
    setParkingSpaces((prev: ParkingSpace[]) => {
      const temp = prev.map((space) =>
        space.spaceNumber === parkingSpace.spaceNumber ? parkingSpace : space
      );
      localStorage.setItem("parkingSpaces", JSON.stringify(temp));
      return temp;
    });

    return parkingSpace;
  };

  const park = (spaceNumber: number) => {
    const parkingSpace: ParkingSpaceWithTicket = {
      spaceNumber,
      ticket: {
        barcode: getRandumNumber(16).toString(),
        enterDate: Date.now(), // get current date
        state: ticketState.unpaid,
        paid: 0,
      },
    };
    const p = new Promise<ParkingSpaceWithTicket>((resolve, rejct) => {
      const temp = updateParkingSpace(parkingSpace) as ParkingSpaceWithTicket;
      if (temp) resolve(temp);
      else rejct("Error!");
    });
    return p;
  };

  const leave = (spaceNumber: number) => {
    const p = new Promise<ParkingSpace>((resolve) =>
      resolve(
        updateParkingSpace({
          spaceNumber,
          ticket: null,
        })
      )
    );
    return p;
  };

  const updateTicket = (parkingSpace: ParkingSpaceWithTicket) => {
    const p = new Promise<ParkingSpaceWithTicket>((resolve, rejct) => {
      const temp = updateParkingSpace(
        parkingSpace
      ) as ParkingSpaceWithPaidTicket;
      if (temp) resolve(temp);
      else rejct("Error!");
    });
    return p;
  };

  const initialState: ParkingContextType = {
    parkingSpaces,
    park,
    leave,
    selectedParkingSpace,
    setSelectedParkingSpace,
    updateTicket,
  };

  return (
    <ParkingContext.Provider value={initialState}>
      {children}
    </ParkingContext.Provider>
  );
}

export function useParking(): ParkingContextType {
  const context = React.useContext(ParkingContext);
  if (context === undefined) {
    throw new Error("useParking called outside context.");
  }

  return context;
}
