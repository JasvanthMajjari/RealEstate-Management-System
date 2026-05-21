import express from "express";
import { authorize, protect } from "../middleware/auth.middleware.js";
import {
  getsellerInquiries,
  markAsRead,
  sendInquiry,
} from "../controllers/inquiry.controller.js";

const inquiryRouter = express.Router();
inquiryRouter.post("/", protect, authorize("buyer"), sendInquiry);
inquiryRouter.get("/seller", protect, authorize("seller"), getsellerInquiries);
inquiryRouter.patch("/:id/read", protect, markAsRead);
export default inquiryRouter;
