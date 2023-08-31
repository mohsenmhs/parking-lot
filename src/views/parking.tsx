import * as React from "react";
import styled from "styled-components";
import { useParking } from "../context/parkingContext";
import { ParkingSpace, ParkingSpaceWithTicket } from "../context/types";

function SpacePrice({ price }: { price: string }) {
  const { setSpacePrice } = useParking();
  const closeModal = () => setSpacePrice(null);
  return (
    <ParkingSpacePriceModal onClick={closeModal}>
      <ParkingSpacePriceContainer
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <button
          onClick={closeModal}
          className="close-button"
          aria-label="Close Modal"
          type="button"
        >
          <span aria-hidden="true">&times;</span>
        </button>

        <div>Total price:</div>
        <div className="price">
          {price}
          <div className="subtitle">€2 per started hour</div>
        </div>
      </ParkingSpacePriceContainer>
    </ParkingSpacePriceModal>
  );
}

function ParkingBox({
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

function InnerRow({
  start,
  end,
  first = false,
}: {
  start: number;
  end: number;
  first?: boolean;
}) {
  const { parkingSpaces } = useParking();

  const blank = [0, 1].map((idx) => <div key={idx} />);

  return (
    <InnerRowContainer first={first}>
      {blank}
      {parkingSpaces.slice(start, end).map((space) => (
        <ParkingBox key={space.spaceNumber} parkingSpace={space} />
      ))}
      {blank}
    </InnerRowContainer>
  );
}

function OuterRow({ start, end }: { start: number; end: number }) {
  const { parkingSpaces } = useParking();
  return (
    <OuterRowContainer>
      {parkingSpaces.slice(start, end).map((space) => (
        <ParkingBox key={space.spaceNumber} parkingSpace={space} />
      ))}
    </OuterRowContainer>
  );
}

export default function ParkingView() {
  const { spacePrice } = useParking();

  return (
    <Container>
      {spacePrice && <SpacePrice price={spacePrice} />}
      <Parking>
        <OuterRow start={0} end={16} />
        <div />
        <InnerRow first start={16} end={27} />
        <InnerRow start={27} end={38} />
        <div />
        <OuterRow start={38} end={54} />
      </Parking>
      <Message>Please click on a parking place to park or leave.</Message>
      <Message>Please click on blue box to get the parking place price.</Message>
    </Container>
  );
}

const Container = styled.div`
  margin: 64px 128px;
`;

const Message = styled.p`
  margin-top: 40px;
  text-align: center;
`;

const Parking = styled.div`
  display: grid;
  grid-template-rows: 80px 100px 80px 80px 100px 80px;
  border: 1px solid var(--main-border);
`;

const OuterRowContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  & > div {
    height: 80px;
    flex: 1;
  }
  & > div:not(:last-of-type) {
    border-right: 1px solid black;
  }
`;

interface InnerRowContainerProps {
  readonly first?: boolean;
}

const InnerRowContainer = styled(OuterRowContainer)<InnerRowContainerProps>`
  & > div {
    border-bottom: ${(props) => (props.first ? "1px solid black" : "none")};
    z-index: ${(props) => (props.first ? "1" : "0")};
  }
  & > div:first-of-type,
  & > div:nth-of-type(14) {
    border-right: none;
  }
  & > div:first-of-type,
  & > div:nth-of-type(2),
  & > div:nth-of-type(14),
  & > div:nth-of-type(15) {
    border-bottom: none;
  }
`;

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

const ParkingSpacePriceModal = styled.div`
  width: 100%;
  height: 100%;
  background: rgb(166 166 166 / 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 99;
`;

const ParkingSpacePriceContainer = styled.div`
  width: 200px;
  height: 150px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-direction: column;
  border: 1px dashed #676767;
  position: relative;
  & .price {
    font-size: 45px;
    text-align: center;
  }
  & .subtitle {
    font-size: 12px;
    color: #676767;
  }

  & .close-button {
    background: transparent;
    border: none;
    font-size: 35px;
    position: absolute;
    left: 0;
    top: 0;
    color: #676767;
    cursor: pointer;
    &:hover {
      color: #000;
    }
  }
`;
