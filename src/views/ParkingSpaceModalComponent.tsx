import * as React from "react";
import styled from "styled-components";
import { useParking } from "../context/parkingContext";
import {
  ParkingSpaceWithPaidTicket,
  ParkingSpaceWithTicket,
  PaymentMethod,
} from "../context/types";
import {
  calculatePriceByDates,
  calculatePriceByParkingSpace,
} from "../services/parking";
import { formattedDate } from "../utils/utils";
import { paymentMethods, ticketState } from "../context/constant";

export function ParkingSpaceModalComponent() {
  const { selectedParkingSpace, setSelectedParkingSpace } = useParking();
  const closeModal = () => setSelectedParkingSpace(null);

  const price = calculatePriceByParkingSpace(
    selectedParkingSpace as ParkingSpaceWithTicket
  );

  return (
    <ParkingSpaceModal onClick={closeModal}>
      <ParkingSpaceContainer
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

        {price > 0 ? (
          <PaymentMethods closeModal={closeModal} price={price} />
        ) : (
          <PaymentReceipt />
        )}
      </ParkingSpaceContainer>
    </ParkingSpaceModal>
  );
}

const PaymentReceipt = () => {
  const { selectedParkingSpace } = useParking();
  const ps = selectedParkingSpace as ParkingSpaceWithPaidTicket;
  return (
    <PaymentReceiptContainer>
      <div className="bold-text">Payment Receipt</div>

      <div>
        <div className="receiot-item">
          <div>Barcode:</div>
          <div>{selectedParkingSpace?.ticket.barcode}</div>
        </div>

        <div className="receiot-item">
          <div>Enter Date:</div>
          <div>
            {formattedDate(
              new Date(
                (
                  selectedParkingSpace as ParkingSpaceWithPaidTicket
                ).ticket.enterDate
              )
            )}
          </div>
        </div>

        <div className="receiot-item">
          <div>Payment Date:</div>
          <div>
            {formattedDate(
              new Date(
                (
                  selectedParkingSpace as ParkingSpaceWithPaidTicket
                ).ticket.paymentDate
              )
            )}
          </div>
        </div>

        <div className="receiot-item">
          <div>Payment Method:</div>
          <div>{selectedParkingSpace?.ticket.paymentMethod}</div>
        </div>
      </div>

      <div>
        <div className="receiot-item bold-text">
          <div>Paid:</div>
          <div>
            €{calculatePriceByDates(ps.ticket.enterDate, ps.ticket.paymentDate)}
          </div>
        </div>
      </div>

      <div className="bold-text">THANK YOU AND LUCKY ROAD!</div>
    </PaymentReceiptContainer>
  );
};

const PaymentMethods = ({
  closeModal,
  price,
}: {
  closeModal: () => void;
  price: number;
}) => {
  const { selectedParkingSpace, updateTicket } = useParking();

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    React.useState<PaymentMethod | null>(null);

  const payNow = async () => {
    try {
      const ps = selectedParkingSpace as ParkingSpaceWithTicket;
      await updateTicket({
        ...ps,
        ticket: {
          ...ps.ticket,
          paymentMethod: selectedPaymentMethod,
          paymentDate: Date.now(),
          state: ticketState.paid,
        },
      });

      closeModal();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="bold-text">Total price:</div>
      <div className="price">
        €{price}
        <div className="subtitle">€2 per started hour</div>
      </div>
      <div>How do you want to pay?</div>
      <PaymentMethodItem>
        {paymentMethods.map((paymentMethod) => {
          return (
            <div
              className={
                selectedPaymentMethod === paymentMethod
                  ? "payment-method active"
                  : "payment-method"
              }
              key={paymentMethod}
              onClick={() => setSelectedPaymentMethod(paymentMethod)}
            >
              {paymentMethod}
            </div>
          );
        })}
      </PaymentMethodItem>

      <button
        onClick={payNow}
        className="pay-button"
        aria-label="Pay Now"
        type="button"
        disabled={!selectedPaymentMethod}
      >
        Pay Now
      </button>
    </>
  );
};

const ParkingSpaceModal = styled.div`
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

  & .bold-text {
    font-weight: bold;
    text-align: center;
  }
`;

const PaymentMethodItem = styled.div`
  display: flex;
  gap: 20px;
  & .payment-method {
    padding: 7px 15px;
    background: #f1f1f1;
    border: 1px solid #676767;
    cursor: pointer;
    &.active {
      background: #ffeb3b;
    }
  }
`;

const ParkingSpaceContainer = styled.div`
  padding: 10px;
  height: 300px;
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

  & .pay-button {
    background: #4caf50;
    border: 1px solid #676767;
    padding: 5px 15px;
  }
`;
const PaymentReceiptContainer = styled.div`
  width: 220px;
  border: 1px dashed #676767;
  padding: 10px;
  font-family: monospace;
  gap: 30px;
  display: flex;
  flex-direction: column;
  & .receiot-item {
    display: flex;
    justify-content: space-between;
  }
`;
