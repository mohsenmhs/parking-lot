import { paymentMethods, ticketState } from "./constant";

export interface ParkingSpace {
  spaceNumber: number;
  ticket: {
    barcode: string;
    enterDate: number;
    paymentMethod?: PaymentMethod | null;
    paymentDate?: number | null;
    state: keyof typeof ticketState;
  } | null;
}

export interface ParkingSpaceWithTicket extends ParkingSpace {
  ticket: {
    barcode: string;
    enterDate: number;
    paymentMethod?: PaymentMethod | null;
    paymentDate?: number | null;
    state: keyof typeof ticketState;
  };
}

export interface ParkingSpaceWithPaidTicket extends ParkingSpace {
  ticket: {
    barcode: string;
    enterDate: number;
    paymentMethod: PaymentMethod;
    paymentDate: number;
    state: keyof typeof ticketState;
  };
}

export interface ParkingContextType {
  parkingSpaces: ParkingSpace[];
  park: (spaceNumber: number) => Promise<ParkingSpaceWithTicket>;
  leave: (spaceNumber: number) => Promise<ParkingSpace>;
  selectedParkingSpace: ParkingSpaceWithTicket | null;
  setSelectedParkingSpace: (
    selectedParkingSpace: ParkingSpaceWithTicket | null
  ) => void;
  updateTicket: (
    parkingSpace: ParkingSpaceWithTicket,
  ) => Promise<ParkingSpaceWithTicket>;
}

export type PaymentMethod = (typeof paymentMethods)[number];
