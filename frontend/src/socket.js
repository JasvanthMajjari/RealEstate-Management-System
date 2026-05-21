import { io } from "socket.io-client";

const socket = io("https://realestate-management-system-6msr.onrender.com", {
  withCredentials: true,
});

export default socket;
