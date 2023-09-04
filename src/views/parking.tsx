import * as React from "react";
import styled from "styled-components";
import { useParking } from "../context/parkingContext";
import { ParkingBox } from "./parkingBox";

function InnerRow({
  start,
  end,
  first = false,
}: {
  start: number;
  end: number;
  first?: boolean;
}) {
  const parkingSpaces = useParking();

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
  const parkingSpaces = useParking();
  return (
    <OuterRowContainer>
      {parkingSpaces.slice(start, end).map((space) => (
        <ParkingBox key={space.spaceNumber} parkingSpace={space} />
      ))}
    </OuterRowContainer>
  );
}

export default function ParkingView() {
  const parkingSpaces = useParking();
  const freeSpaces = parkingSpaces.filter((parkingSpace) => !parkingSpace.ticket).length;
  return (
    <Container>
      <Parking>
        <OuterRow start={0} end={16} />
        <div />
        <InnerRow first start={16} end={27} />
        <InnerRow start={27} end={38} />
        <div />
        <OuterRow start={38} end={54} />
      </Parking>
      <ParkingState>
        <div>Parking Spaces Available:</div>
        <div className={freeSpaces === 0 ? "full free-spaces" : "free-spaces"}>
          {freeSpaces === 0 ? "FULL" : freeSpaces}
        </div>
      </ParkingState>
      <Message>Please click on a parking place to park, leave, pay or get state.</Message>
    </Container>
  );
}

const Container = styled.div`
  margin: 64px 128px;
`;
const ParkingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 25px;
  width: 200px;
  background: black;
  color: #fff;
  margin: 10px auto;

  & .free-spaces {
    font-size: 45px;
    color: #8BC34A;
    font-family: fantasy;
    &.full {
      color: red;
    }
  }
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
