// Fallback SplashCursor component if not available in "react-bits"
import React from "react";

type SplashCursorProps = {
  color?: string;
  size?: number;
  splashRadius?: number;
};

const Cursor: React.FC<SplashCursorProps> = ({
  color = "#00BFFF",
  size = 25,
  splashRadius = 100,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      boxShadow: `0 0 ${splashRadius}px ${color}66`,
      pointerEvents: "none",
      position: "fixed",
      left: 0,
      top: 0,
      zIndex: 9999,
    }}
  />
);

export default function SplashCursor() {
  return <Cursor color="#00BFFF" size={25} splashRadius={100} />;
}
