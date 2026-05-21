import Wishlist from "../models/wishlist.models.js";

//to add property to whishlist
export const addWishlist = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;

    if (!propertyId) {
      res.status(400).json({
        success: false,
        message: "Property ID is not found",
      });
    }
    const existing = await Wishlist.findOne({
      user: req.user._id,
      property: propertyId,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Already in wishlist",
      });
    }

    await Wishlist.create({
      user: req.user._id,
      property: propertyId,
    });

    res.status(200).json({
      success: true,
      message: "Added to wishlist",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//to get the property that is in wishlist
export const getWishlist = async (req, res) => {
  try {
    const data = await Wishlist.find({
      user: req.user._id,
    }).populate("property");

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//to remove the particular property form the wishlist

export const removeWishlist = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: "Property id is required..",
      });
    }
    const result = await Wishlist.findOneAndDelete({
      user: req.user._id,
      property: propertyId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Wishlist item is not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
