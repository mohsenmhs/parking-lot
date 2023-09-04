import { paymentMethods, ticketState } from "./constant";

export interface ParkingSpace {
  spaceNumber: number;
  ticket: {
    barcode: string;
    enterDate: number;
    paymentMethod?: PaymentMethod | null;
    paymentDate?: number | null;
    state: keyof typeof ticketState;
    paid?: number;
  } | null;
}

export interface ParkingSpaceWithTicket extends ParkingSpace {
  ticket: {
    barcode: string;
    enterDate: number;
    paymentMethod?: PaymentMethod | null;
    paymentDate?: number | null;
    state: keyof typeof ticketState;
    paid: number;
  };
}

export interface ParkingSpaceWithPaidTicket extends ParkingSpace {
  ticket: {
    barcode: string;
    enterDate: number;
    paymentMethod: PaymentMethod;
    paymentDate: number;
    state: keyof typeof ticketState;
    paid: number;
  };
}

export type DispatchType = {
  type: string;
  parkingSpace: ParkingSpace;
};

export type ParkingContextType = ParkingSpace[];

export type ParkingDispatchContextType = ({
  type,
  parkingSpace,
}: DispatchType) => void;

export type PaymentMethod = (typeof paymentMethods)[number];
