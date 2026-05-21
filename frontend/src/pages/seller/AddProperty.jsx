import { useNavigate } from "react-router-dom";
import { addPropertyStyles as s } from "../../assets/dummyStyles";
import { useAuth } from "../../context/useAuth";
import { useState } from "react";
import API_URL from "../../config.js";
import { HiUpload } from "react-icons/hi";
import api from "../../utils/axios.js";

const AddProperty = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    area: "",
    pincode: "",
    propertyType: "flat",
    bhk: "",
    bathrooms: "",
    areaSize: "",
    furnishing: "unfurnished",
    status: "sale",
    amenities: [],
    securityDeposit: "",
    maintenance: "",
  });

  const commonAmenities = [
    "Parking",
    "Pool",
    "Gym",
    "Security",
    "Wifi",
    "Power Backup",
    "Club House",
    "Garden",
  ];

  // Input change
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Amenities
  const handleAmenityChange = (amenity) => {
    setFormData((prev) => {
      const current = prev.amenities || [];

      return current.includes(amenity)
        ? { ...prev, amenities: current.filter((a) => a !== amenity) }
        : { ...prev, amenities: [...current, amenity] };
    });
  };

  // Images
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > 10) {
      setError("You can upload maximum 10 images");
      return;
    }

    setImages((prev) => [...prev, ...files]);

    const previews = files.map((file) => URL.createObjectURL(file));

    setImagePreviews((prev) => [...prev, ...previews]);
  };

  // Remove image
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));

    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "amenities") {
          data.append("amenities", JSON.stringify(formData.amenities));
        } else {
          data.append(key, formData[key]);
        }
      });

      images.forEach((img) => {
        data.append("images", img);
      });

      await api.post(`${API_URL}/api/property`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.outerContainer}>
      <div className={s.innerContainer}>
        {/* Header */}
        <div className={s.header}>
          <h1 className={s.heading}>List Your Property</h1>

          <p className={s.subheading}>
            Fill in the details below to reach thousands of buyers.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={s.form}>
          {error && <div className={s.error}>{error}</div>}

          {/* Main Vertical Layout */}
          <div className="flex flex-col gap-10">
            {/* Content & Description */}
            <div className={s.section}>
              <div
                className={`${s.sectionHeader} ${s.sectionHeaderLargeMargin}`}
              >
                <div className={s.sectionBar}></div>

                <h3 className={s.sectionTitle}>Content & Description</h3>
              </div>

              <div className={s.contentGroupLarge}>
                <div>
                  <label className={s.label}>Property Title</label>

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Luxury 3BHK Apartment"
                    className={s.input}
                    required
                  />
                </div>

                <div>
                  <label className={s.label}>Detailed Description</label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your property..."
                    className={`${s.input} ${s.textarea}`}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className={s.section}>
              <div
                className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}
              >
                <div className={s.sectionBar}></div>

                <h3 className={s.sectionTitle}>Property Details</h3>
              </div>

              <div className={s.contentGroupMedium}>
                <div>
                  <label className={s.labelSmallMargin}>Property Type</label>

                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className={`${s.input} ${s.select}`}
                  >
                    <option value="flat">Flat / Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="penthouse">Penthouse</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                <div className={s.gridThreeCol}>
                  <div>
                    <label className={s.labelSmallMargin}>BHK</label>

                    <input
                      type="number"
                      name="bhk"
                      value={formData.bhk}
                      onChange={handleInputChange}
                      className={s.input}
                    />
                  </div>

                  <div>
                    <label className={s.labelSmallMargin}>Bathrooms</label>

                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      className={s.input}
                    />
                  </div>

                  <div>
                    <label className={s.labelSmallMargin}>Area (sq.ft)</label>

                    <input
                      type="number"
                      name="areaSize"
                      value={formData.areaSize}
                      onChange={handleInputChange}
                      className={s.input}
                    />
                  </div>
                </div>

                <div className={s.gridTwoCol}>
                  <div>
                    <label className={s.labelSmallMargin}>Furnishing</label>

                    <select
                      name="furnishing"
                      value={formData.furnishing}
                      onChange={handleInputChange}
                      className={`${s.input} ${s.select}`}
                    >
                      <option value="unfurnished">Unfurnished</option>

                      <option value="semi-furnished">Semi Furnished</option>

                      <option value="furnished">Fully Furnished</option>
                    </select>
                  </div>

                  <div>
                    <label className={s.labelSmallMargin}>Listing Status</label>

                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={`${s.input} ${s.select}`}
                    >
                      <option value="sale">For Sale</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Location */}
            <div className={s.section}>
              <div
                className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}
              >
                <div className={s.sectionBar}></div>

                <h3 className={s.sectionTitle}>Pricing & Location</h3>
              </div>

              <div className={s.contentGroupSmall}>
                <div>
                  <label className={s.labelSmallMargin}>Price (₹)</label>

                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={s.input}
                    required
                  />
                </div>

                <div className={s.gridTwoCol}>
                  <div>
                    <label className={s.labelSmallMargin}>City</label>

                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={s.input}
                      required
                    />
                  </div>

                  <div>
                    <label className={s.labelSmallMargin}>Pincode</label>

                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className={s.input}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={s.labelSmallMargin}>Specific Area</label>

                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    className={s.input}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className={s.section}>
              <div
                className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}
              >
                <div className={s.sectionBar}></div>

                <h3 className={s.sectionTitle}>Amenities</h3>
              </div>

              <div className={s.amenitiesGrid}>
                {commonAmenities.map((amenity) => (
                  <label
                    key={amenity}
                    className={`${s.amenityLabelBase} ${
                      formData.amenities.includes(amenity)
                        ? s.amenityLabelActive
                        : s.amenityLabelInactive
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityChange(amenity)}
                      className={s.amenityCheckbox}
                    />

                    <span
                      className={`${s.amenityTextBase} ${
                        formData.amenities.includes(amenity)
                          ? s.amenityTextActive
                          : s.amenityTextInactive
                      }`}
                    >
                      {amenity}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className={s.section}>
              <div
                className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}
              >
                <div className={s.sectionBar}></div>

                <h3 className={s.sectionTitle}>Property Images</h3>
              </div>

              <div className={s.uploadArea}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />

                <div className={s.uploadIconWrapper}>
                  <HiUpload size={40} color="#64748b" />
                </div>

                <h4 className={s.uploadTitle}>
                  Click to upload or drag and drop
                </h4>

                <p className={s.uploadSubtext}>Upload up to 10 images</p>
              </div>

              {/* Preview Images */}
              {imagePreviews.length > 0 && (
                <div className={s.previewsGrid}>
                  {imagePreviews.map((img, index) => (
                    <div key={index} className={s.previewItem}>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className={s.removeButton}
                      >
                        ×
                      </button>

                      <img
                        src={img}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className={s.footerButtons}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className={s.cancelButton}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className={s.submitButton}
              >
                {loading ? "Adding..." : "Add Property"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;
