import * as React from "react";
import styled from "styled-components";

export function ModalComponent({
  closeModal,
  children,
}: {
  closeModal: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal onClick={closeModal}>
      <ModalContainer
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

        <ModalContent>{children}</ModalContent>
      </ModalContainer>
    </Modal>
  );
}

const Modal = styled.div`
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

const ModalContent = styled.div``;
const ModalContainer = styled.div`
  padding: 10px;
  height: 300px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-direction: column;
  border: 1px dashed var(--box-border);
  position: relative;

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
`;
