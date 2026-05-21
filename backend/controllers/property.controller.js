import Property from "../models/property.models.js";
import Inquiry from "../models/inquiry.model.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import jwt from "jsonwebtoken";
import upload from "../middleware/upload.middleware.js";
import cloudinary from "../config/cloudinary.js";

//Add a property
export const addProperty = async (req, res) => {
  try {
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const result = await uploadToCloudinary(file.buffer, "properties");
        imageUrls.push(result.secure_url);
      }
    }

    const property = await Property.create({
      title: req.body.title,
      description: req.body.description,
      price: Number(req.body.price),
      city: req.body.city,
      area: req.body.area,
      pincode: req.body.pincode,
      propertyType: req.body.propertyType,
      bhk: req.body.bhk ? String(req.body.bhk) : undefined,
      bathrooms: req.body.bathrooms ? Number(req.body.bathrooms) : undefined,
      areaSize: req.body.areaSize ? Number(req.body.areaSize) : undefined,
      furnishing: req.body.furnishing,
      status: req.body.status || "sale",
      images: imageUrls,
      seller: req.user._id, // as seller can only create a property
      amenities: parseAmenities(req.body.amenities),
    });

    res.json({
      success: true,
      property,
    });
  } catch (error) {
    console.error("ADD_PROPERTY_ERROR: ", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error while adding property",
    });
  }
};

//to get my properties

export const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      seller: req.user._id,
    });
    res.json({
      success: true,
      properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//update a property
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (property.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    //Update fields
    const fields = [
      "title",
      "description",
      "price",
      "city",
      "area",
      "pincode",
      "propertyType",
      "bhk",
      "bathrooms",
      "areaSize",
      "furnishing",
      "status",
      "amenities",
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        property[field] = req.body[field];
      }
    });

    //Fixed amenities Handlin

    if (req.body.amenities !== undefined) {
      let amenities = req.body.amenities;
      if (typeof amenities === "string") {
        try {
          amenities = JSON.parse(amenities);
        } catch (error) {
          amenities = amenities.split(",").map((a) => a.trim());
        }
      }
      property.amenities = Array.isArray(amenities) ? amenities : [];
    }
    // for image handling
    if (req.body.existingImages) {
      try {
        const existing = JSON.parse(req.body.existingImages);
        property.images = Array.isArray(existing) ? existing : property.images;
      } catch (e) {
        console.error("Failed to parse existingImages:", e);
      }
    } // delete existing image

    // Upload new image if exist the old one
    if (req.files && req.files.length > 0) {
      let newImages = [];
      for (let file of req.files) {
        const result = await uploadToCloudinary(file.buffer, "properties");
        newImages.push(result.secure_url);
      }
      property.images = [...property.images, ...newImages];
    }

    await property.save();

    res.json({
      success: true,
      message: "Property updated",
      property, //Updated data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//to delete a property
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    //check the ownership
    if (property.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not Authorized",
      });
    }

    //dedlete image from cloudinary
    if (property.images && property.images.length > 0) {
      for (let imageUrl of property.images) {
        try {
          const publicId = imageUrl.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`properties/${publicId}`);
        } catch (error) {
          console.error("Cloudinary Error", error.message);
        }
      }
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: "Property deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//update property status
export const updatePropertyStatus = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "property not found..",
      });
    }

    //check the ownership
    if (property.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not Authorized",
      });
    }

    property.status = req.body.status;
    await property.save();
    res.json({
      success: true,
      message: "Property sattus updated successfully",
      property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// to get all the properties
export const getAllProperties = async (req, res) => {
  try {
    const {
      city,
      area,
      pincode,
      propertyType,
      bhk,
      furnishing,
      status,
      minPrice,
      maxPrice,
      amenities,
      sort,
      seller,
    } = req.query;

    let query = {
      status: "sale",
    };

    if (seller) query.seller = seller;
    if (city) query.city = new RegExp(city, "i");
    if (area) query.area = new RegExp(area, "i");
    if (pincode) query.pincode = pincode;

    if (propertyType) {
      query.propertyType = { $in: propertyType.toLowerCase().split(",") };
    }
    if (bhk) {
      if (bhk === "5+") {
        query.bhk = { $gte: "5" };
      } else {
        query.bhk = bhk;
      }
    }
    if (furnishing) {
      const furnishingArray = furnishing.split(",");
      query.furnishing = {
        $in: furnishingArray.map((f) => new RegExp(`^${f.trim()}$`, "i")),
      };
    }
    if (status) query.status = status;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice && !isNaN(minPrice)) query.price.$gte = Number(minPrice);
      if (maxPrice && !isNaN(maxPrice)) query.price.$lte = Number(maxPrice);
      if (Object.keys(query.price).length === 0) delete query.price;
    }

    if (amenities) {
      query.amenities = {
        $in: amenities.split(",").map((a) => a.trim()),
      };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "priceLow") sortOption = { price: 1 };
    if (sort === "priceHigh") sortOption = { price: -1 };
    if (sort === "latest") sortOption = { createdAt: -1 };

    const properties = await Property.find(query)
      .populate("seller", "name phone profilePic")
      .sort(sortOption);

    res.json({
      success: true,
      count: properties.length, //no of properties
      properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching properties",
      error: error.message,
    });
  }
};

//to get property details

export const getPropertyDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id).populate(
      "seller",
      "_id name email phone profilePic",
    );
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    //handle oid + new fiedl mismatch
    property.amenities = property.amenities || [];
    property.viewedBy = property.viewedBy || [];
    property.views = property.views || [];

    //Unique view tracking by id

    let visitorId = req.ip;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        visitorId = decode.id;
      } catch (error) {
        //ignore
      }
    }

    //Prevent seller self-view counting

    const isSeller = property.seller?._id?.toString() === visitorId;

    // Safe view tracking
    if (!isSeller && !property.viewedBy.includes(visitorId)) {
      property.views += 1;
      property.viewedBy.push(visitorId);
      await property.save();
    }

    // Find similar Properties
    const similarProperties = await Property.find({
      _id: { $ne: property._id },
      city: property.city,
      propertyType: property.propertyType,
      status: property.status,
    })
      .limit(4)
      .select("title price images city area propertyType bhk areaSize status");

    res.json({
      success: true,
      property,
      similarProperties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Seller Dashboard

export const getSellerDashboard = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const totalProperties = await Property.countDocuments({ seller: sellerId });
    const activeVisitings = await Property.countDocuments({
      seller: sellerId,
      status: "sale",
    });

    const soldProperties = await Property.countDocuments({
      seller: sellerId,
      status: "sold",
    });

    const totalInquiries = await Inquiry.countDocuments({ seller: sellerId });

    //Calculate total views for all properties

    const viewsData = await Property.aggregate([
      { $match: { seller: sellerId } },
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);

    const totalViews = viewsData.length > 0 ? viewsData[0].totalViews : 0;
    res.json({
      success: true,
      stats: {
        totalProperties,
        activeVisitings: activeVisitings,
        soldProperties,
        totalInquiries,
        totalViews,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//get the property count

export const getPropertyCount = async (req, res) => {
  try {
    const counts = await Property.aggregate([
      { $match: { status: "sale" } },
      { $group: { _id: "$propertyType", count: { $sum: 1 } } },
    ]);

    const formattedCounts = counts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    res.json({
      success: true,
      counts: formattedCounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching counts",
      error: error.message,
    });
  }
};

//Helper function (important)
const parseAmenities = (data) => {
  if (!data) return [];

  if (Array.isArray(data)) return data.filter(Boolean);

  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch (error) {
      return data
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
    }
  }
  return [];
};
