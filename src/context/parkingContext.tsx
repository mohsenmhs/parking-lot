import * as React from "react";
import { PARKING_CAPACITY } from "../config";
import { ParkingContextType, ParkingSpace } from "./types";

export const ParkingContext = React.createContext<
  ParkingContextType | undefined
>(undefined);

function initParking(): ParkingSpace[] {
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

  const updateParkingSpace = (spaceNumber: number, ticket: string | null) => {
    setParkingSpaces((prev: ParkingSpace[]) =>
      prev.map((space) =>
        space.spaceNumber === spaceNumber ? { ...space, ticket } : space
      )
    );
  };

  const park = async (spaceNumber: number) => {
    const ticket = `ticket-${spaceNumber}`;
    const p = new Promise((resolve) =>
      resolve(updateParkingSpace(spaceNumber, ticket))
    );
    return await p;
  };

  const leave = async (spaceNumber: number) => {
    const p = new Promise((resolve) =>
      resolve(updateParkingSpace(spaceNumber, null))
    );
    return await p;
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
