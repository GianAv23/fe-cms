import React from "react";
import styled from "styled-components";
import geaLogo from "/logo/gea.png";

interface LoaderProps {
  withLogo?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ withLogo }) => {
  return (
    <StyledWrapper>
      <section className="dots-container flex flex-col gap-8">
        {withLogo && (
          <div>
            <img src={geaLogo} alt="" className="w-50" />
          </div>
        )}
        <div className="flex flex-row">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </div>
      </section>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .dots-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
  }

  .dot {
    height: 14px;
    width: 14px;
    margin-right: 10px;
    border-radius: 10px;
    background-color: #ea4e49;
    animation: pulse 1.5s infinite ease-in-out;
  }

  .dot:last-child {
    margin-right: 0;
  }

  .dot:nth-child(1) {
    animation-delay: -0.3s;
  }

  .dot:nth-child(2) {
    animation-delay: -0.1s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.1s;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.8);
      background-color: #fde4e3;
      box-shadow: 0 0 0 0 rgba(253, 228, 227, 0.7);
    }

    50% {
      transform: scale(1.2);
      background-color: #ea4e49;
      box-shadow: 0 0 0 8px rgba(234, 78, 73, 0.1);
    }

    100% {
      transform: scale(0.8);
      background-color: #ea4e49;
      box-shadow: 0 0 0 0 rgba(253, 228, 227, 0.7);
    }
  }
`;

export default Loader;
