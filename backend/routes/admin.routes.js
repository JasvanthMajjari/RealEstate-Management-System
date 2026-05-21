import express from "express";
import { authorize, protect } from "../middleware/auth.middleware.js";
import {
  approveSeller,
  blockUser,
  deleteUser,
  getAllInquiries,
  getDashboardStats,
  getAllUsers,
  getPendingSellers,
} from "../controllers/admin.controller.js";
import {
  deleteProperty,
  getAllProperties,
} from "../controllers/property.controller.js";

const adminRouter = express.Router();
adminRouter.use(protect, authorize("admin"));
adminRouter.get("/users", getAllUsers);
adminRouter.patch("/users/:id/block", blockUser);
adminRouter.delete("/users/:id", deleteUser);
adminRouter.get("/properties", getAllProperties);
adminRouter.delete("/properties/:id", deleteProperty);
adminRouter.get("/inquiries", getAllInquiries);
adminRouter.get("/stats", getDashboardStats);
adminRouter.patch("/approve-seller/:id", approveSeller);
adminRouter.get("/pendingSellers", getPendingSellers);

export default adminRouter;
