import express from "express";
import {
  deleteProperty,
  getAllProperties,
  getMyProperties,
  getPropertyDetails,
  getSellerDashboard,
  updateProperty,
  updatePropertyStatus,
  addProperty,
  getPropertyCount,
} from "../controllers/property.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const propertyRouter = express.Router();

//public routes
propertyRouter.get("/", getAllProperties);
propertyRouter.get("/counts", getPropertyCount);

//Property the routes that only seller can do these works

//seller routes
propertyRouter.post(
  "/",
  protect,
  authorize("seller"),
  upload.array("images", 10),
  addProperty,
);
propertyRouter.get("/my", protect, authorize("seller"), getMyProperties);
propertyRouter.get(
  "/seller/dashboard",
  protect,
  authorize("seller"),
  getSellerDashboard,
);
propertyRouter.put(
  "/:id",
  protect,
  authorize("seller"),
  upload.array("images", 10),
  updateProperty,
);
propertyRouter.delete("/:id", protect, authorize("seller"), deleteProperty);
propertyRouter.patch(
  "/:id/status",
  protect,
  authorize("seller"),
  updatePropertyStatus,
);
propertyRouter.get("/:id", getPropertyDetails);

export default propertyRouter;
