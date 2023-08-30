import * as React from "react";
import { PARKING_CAPACITY } from "../config";
import {
  ParkingContextType,
  ParkingSpace,
  ParkingSpaceWithTicket,
} from "./types";
import { getRandumNumber } from "../utils/utils";

export const ParkingContext = React.createContext<
  ParkingContextType | undefined
>(undefined);

function initParking(): ParkingSpace[] {
  const parkingSpaces: ParkingSpace[] = localStorage.getItem("parkingSpaces")
    ? JSON.parse(localStorage.getItem("parkingSpaces") || "")
    : [...Array(PARKING_CAPACITY)].map((_, idx: number) => ({
        spaceNumber: idx + 1,
        ticket: null,
      }));

  return parkingSpaces;
}

export function ParkingContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [parkingSpaces, setParkingSpaces] = React.useState(initParking());

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
      },
    };
    const p = new Promise<ParkingSpaceWithTicket>((resolve, rejct) => {
      const temp = updateParkingSpace(parkingSpace) as ParkingSpaceWithTicket;
      if(temp) resolve(temp);
      else rejct("Error!")
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

  const initialState: ParkingContextType = {
    parkingSpaces,
    park,
    leave,
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
