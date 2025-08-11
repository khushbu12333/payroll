import React from "react";

interface NotificationProps {
  message: string;
  show: boolean;
  type?: "success" | "error";
}

const Notification: React.FC<NotificationProps> = ({ message, show, type = "success" }) => (
  <div
    className={`
      fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-lg font-semibold
      transition-all duration-500
      ${show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 pointer-events-none"}
      ${type === "success" ? "bg-green-100 border border-green-300 text-green-800" : "bg-red-100 border border-red-300 text-red-800"}
    `}
    style={{ minWidth: 320, textAlign: "center" }}
  >
    {message}
  </div>
);

export default Notification;
