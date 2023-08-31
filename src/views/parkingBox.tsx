import * as React from "react";
import styled from "styled-components";
import { useParking } from "../context/parkingContext";
import {
  ParkingSpace,
  ParkingSpaceWithPaidTicket,
  ParkingSpaceWithTicket,
  PaymentMethod,
  paymentMethods,
} from "../context/types";
import { formattedDate } from "../utils/utils";
import { calculatePriceByParkingSpace } from "../services/parking";

export function ParkingBox({
  parkingSpace,
}: {
  parkingSpace: ParkingSpace;
}): JSX.Element {
  const { park, leave, parkingSpaces, ticketPayment, setSelectedParkingSpace } =
    useParking();
  const { spaceNumber, ticket } = parkingSpace;

  const togglePlace = async () => {
    try {
      const res = ticket ? leave(spaceNumber) : park(spaceNumber);
      res.then((e) => {
        console.log(e.ticket?.barcode);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getTicket = async () => {
    const firstEmptyParkingSpace = parkingSpaces.find((obj) => {
      return !obj.ticket;
    });

    if (firstEmptyParkingSpace) {
      try {
        const res: ParkingSpaceWithTicket = await park(
          firstEmptyParkingSpace.spaceNumber
        );
        return res.ticket.barcode;
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Sorry, parking lot is full!");
    }
  };

  (window as any).getTicket = getTicket; //To access getTicket from developer console!

  const calculatePrice = (barcode: string) => {

    setSelectedParkingSpace(null);

    const parkingSpace = getParkingSpaceByBarcode(barcode);

    if (parkingSpace) {
      const price = calculatePriceByParkingSpace(
        parkingSpace as ParkingSpaceWithTicket
      );
      setSelectedParkingSpace(parkingSpace as ParkingSpaceWithTicket);
      if (price === 0) {
        //Paid before and display Payment Receipt !
        console.log("******** Payment Receipt *********");
        console.log("*  Barcode:   ", barcode, " *");
        console.log("*  Enter Date:   ", formattedDate(new Date((parkingSpace as ParkingSpaceWithPaidTicket).ticket.enterDate)), " *");
        console.log("*  Payment Date: ", formattedDate(new Date((parkingSpace as ParkingSpaceWithPaidTicket).ticket.paymentDate)), " *");
        
        const spaces = 12 - (parkingSpace as ParkingSpaceWithPaidTicket).ticket.paymentMethod.length;
        console.log("*  Payment Method:", Array(spaces).join(" "), parkingSpace.ticket?.paymentMethod, " *");
        console.log("**********************************");
      }
      return price;
    } else {
      return `No barcode #${barcode} found!`;
    }
  };

  (window as any).calculatePrice = calculatePrice; //To access calculatePrice from developer console!


  const calculateSpacePrice = () => {
    setSelectedParkingSpace(parkingSpace as ParkingSpaceWithTicket);
  };

  const getParkingSpaceByBarcode = (barcode: string) => {
    return parkingSpaces.find((obj) => {
      return obj.ticket?.barcode === barcode;
    });
  };

  const payTicket = async (barcode: string, paymentMethod: PaymentMethod) => {
    if (!paymentMethods.includes(paymentMethod)) {
      return `No payment method "${paymentMethod}" found!`;
    }
    
    const parkingSpace = getParkingSpaceByBarcode(barcode);

    if (parkingSpace) {
      try {
        await ticketPayment(
          parkingSpace as ParkingSpaceWithTicket,
          paymentMethod
        );
        return `Ticket #${barcode} paid!`;
      } catch (error) {
        console.log(error);
      }
    } else {
      return `No barcode #${barcode} found!`;
    }
  };

  (window as any).payTicket = payTicket; //To access payTicket from developer console!

  return (
    <ParkingBoxContainer className={ticket ? "occupied" : "free"}>
      <ParkingBoxContent
        className={!ticket ? "free" : ""}
        onClick={togglePlace}
      >
        {spaceNumber}
      </ParkingBoxContent>
      {ticket && (
        <ParkingBoxContent className="price" onClick={calculateSpacePrice}>
          €
        </ParkingBoxContent>
      )}
    </ParkingBoxContainer>
  );
}

const ParkingBoxContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
  font-size: 16px;
  cursor: pointer;
  &.free {
    background: var(--free-spot);
  }
  &.occupied {
    background: var(--occupied-spot);
  }
`;

const ParkingBoxContent = styled.div`
  width: 100%;
  height: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  &.free {
    height: 100%;
  }
  &.price {
    background: #00bcd4;
  }
`;
