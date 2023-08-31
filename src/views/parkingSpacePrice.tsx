import * as React from "react";
import styled from "styled-components";
import { useParking } from "../context/parkingContext";

export function ParkingSpacePrice({ price }: { price: string }) {
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

