import React from "react";
import SuccessImage from "@/assets/images/success.png";
import { useParams } from "react-router-dom";

export const Success: React.FC = () => {
  const { name } = useParams();
  return (
    <div className="min-h-screen min-h-[100dvh] bg-white flex items-center justify-center relative">
      <div className="w-full max-w-md mx-auto">
        <img
          src={SuccessImage}
          alt="Success"
          className="w-full h-auto object-contain"
        />
      </div>
      <div className="flex items-center justify-center absolute top-40 z-10">
        <h1
          className="text-center font-nunito"
          style={{
            fontFamily: "Nunito",
            fontWeight: 700,
            fontStyle: "normal",
            fontSize: "35.95px",
            lineHeight: "138%",
            letterSpacing: "0px",
            textAlign: "center",
          }}
        >
          Hurray!!!! <br /> You did well {name}!
        </h1>
      </div>
    </div>
  );
};

export default Success;
