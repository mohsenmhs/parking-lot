import * as React from "react";
import styled from "styled-components";
import { useParkingDispatch } from "../context/parkingContext";
import {
  ParkingSpaceWithPaidTicket,
  ParkingSpaceWithTicket,
  PaymentMethod,
} from "../context/types";
import { calculatePriceByParkingSpace } from "../services/parking";
import { formattedDate } from "../utils/utils";
import { paymentMethods, ticketState } from "../context/constant";

export function ParkingSpaceModalComponent({
  parkingSpace,
  closeModal,
}: {
  parkingSpace: ParkingSpaceWithTicket;
  closeModal: () => void;
}) {
  const price =
    calculatePriceByParkingSpace(parkingSpace) - parkingSpace.ticket.paid;
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
          <PaymentMethods
            closeModal={closeModal}
            price={price}
            parkingSpace={parkingSpace as ParkingSpaceWithTicket}
          />
        ) : (
          <PaymentReceipt
            price={price}
            parkingSpace={parkingSpace as ParkingSpaceWithPaidTicket}
          />
        )}
      </ParkingSpaceContainer>
    </ParkingSpaceModal>
  );
}

const PaymentReceipt = ({
  price,
  parkingSpace,
}: {
  price: number;
  parkingSpace: ParkingSpaceWithPaidTicket;
}) => {
  const dispatch = useParkingDispatch();
  const updateParkingSpace = async () => {
    try {
      dispatch({
        type: "update",
        parkingSpace: {
          ...parkingSpace,
          ticket: {
            ...parkingSpace.ticket,
            paymentDate: Date.now(),
            state: ticketState.paid,
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  };
  React.useEffect(() => {
    if (parkingSpace.ticket.state === ticketState.unpaid) {
      updateParkingSpace();
    }
  }, []);
  return (
    <PaymentReceiptContainer>
      <div className="bold-text">Payment Receipt</div>

      <div>
        <div className="receipt-item">
          <div>Barcode:</div>
          <div>{parkingSpace.ticket.barcode}</div>
        </div>

        <div className="receipt-item">
          <div>Enter Date:</div>
          <div>{formattedDate(new Date(parkingSpace.ticket.enterDate))}</div>
        </div>

        <div className="receipt-item">
          <div>Payment Date:</div>
          <div>{formattedDate(new Date(parkingSpace.ticket.paymentDate))}</div>
        </div>

        <div className="receipt-item">
          <div>Last Payment Method:</div>
          <div>{parkingSpace.ticket.paymentMethod}</div>
        </div>
      </div>

      <div>
        <div className="receipt-item bold-text">
          <div>Paid:</div>
          <div>€{parkingSpace.ticket.paid}</div>
        </div>
      </div>

      <div className="bold-text">THANK YOU AND LUCKY ROAD!</div>
    </PaymentReceiptContainer>
  );
};

const PaymentMethods = ({
  closeModal,
  price,
  parkingSpace,
}: {
  closeModal: () => void;
  price: number;
  parkingSpace: ParkingSpaceWithTicket;
}) => {
  const dispatch = useParkingDispatch();

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    React.useState<PaymentMethod | null>(null);

  const payNow = async () => {
    try {
      dispatch({
        type: "update",
        parkingSpace: {
          ...parkingSpace,
          ticket: {
            ...parkingSpace.ticket,
            paymentMethod: selectedPaymentMethod,
            paymentDate: Date.now(),
            state: ticketState.paid,
            paid: price + parkingSpace.ticket.paid,
          },
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
        {parkingSpace && parkingSpace.ticket.paid > 0 && (
          <div className="subtitle">
            You have paid €{parkingSpace.ticket.paid} on{" "}
            {formattedDate(new Date(parkingSpace.ticket.enterDate))}
          </div>
        )}
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
    border: 1px solid var(--box-border);
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
  border: 1px dashed var(--box-border);
  position: relative;
  & .price {
    font-size: 45px;
    text-align: center;
  }
  & .subtitle {
    font-size: 12px;
    color: var(--box-border);
  }

  & .close-button {
    background: transparent;
    border: none;
    font-size: 35px;
    position: absolute;
    left: 0;
    top: 0;
    color: var(--box-border);
    cursor: pointer;
    &:hover {
      color: #000;
    }
  }

  & .pay-button {
    background: #4caf50;
    border: 1px solid var(--box-border);
    padding: 5px 15px;
  }
`;
const PaymentReceiptContainer = styled.div`
  width: 250px;
  border: 1px dashed var(--box-border);
  padding: 10px;
  font-family: monospace;
  gap: 30px;
  display: flex;
  flex-direction: column;
  & .receipt-item {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
  }
`;
