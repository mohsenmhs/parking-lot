import * as React from "react";
import styled from "styled-components";
import { useParking } from "../context/parkingContext";
import { ParkingSpace, ParkingSpaceWithTicket } from "../context/types";

export function ParkingBox({
  parkingSpace,
}: {
  parkingSpace: ParkingSpace;
}): JSX.Element {
  const { park, leave, parkingSpaces, setSpacePrice } = useParking();
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
    setSpacePrice(null);

    const parkingSpace = parkingSpaces.find((obj) => {
      return obj.ticket?.barcode === barcode;
    });

    if (parkingSpace) {
      const price = calculatePriceByParkingSpace(
        parkingSpace as ParkingSpaceWithTicket
      );
      setSpacePrice(price);
      return price;
    } else {
      return `No barcode #${barcode} found!`;
    }
  };

  (window as any).calculatePrice = calculatePrice;

  const calculatePriceByParkingSpace = (
    parkingSpace: ParkingSpaceWithTicket
  ) => {
    const exitDate = Date.now();
    const hours = Math.ceil(
      (exitDate - parkingSpace.ticket.enterDate) / (60 * 60 * 1000)
    );
    return "€" + hours * 2;
  };

  const calculateSpacePrice = () => {
    setSpacePrice(
      calculatePriceByParkingSpace(parkingSpace as ParkingSpaceWithTicket)
    );
  };

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
