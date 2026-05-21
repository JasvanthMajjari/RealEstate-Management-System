import {
  HiAdjustments,
  HiFilter,
  HiSearch,
  HiViewGrid,
  HiViewList,
  HiX,
} from "react-icons/hi";
import { propertiesStyles as s } from "../../assets/dummyStyles";
import Navbar from "../../components/common/Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useEffect, useState } from "react";
import API_URL from "../../config.js";
import { useRef, useCallback } from "react";

import PropertyCard from "../../components/common/PropertyCard";
import api from "../../utils/axios.js";

const Properties = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [wishListedIds, setWishListedIds] = useState([]);
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");

  const propertyTypes = [
    { label: "Flat/Apartment", value: "flat" },
    { label: "Independent House/Villa", value: "villa" },
    { label: "Penthouse", value: "penthouse" },
    { label: "Commercial", value: "commercial" },
  ];
  const bhkOptions = ["1", "2", "3", "4", "5+"];
  const furnishingOptions = [
    { label: "Furnished", value: "furnished" },
    { label: "Semi-Furnished", value: "semi-furnished" },
    { label: "Unfurnished", value: "unfurnished" },
  ];

  //Load from uRL

  const getInitialFilters = () => {
    const query = new URLSearchParams(location.search);

    return {
      city: query.get("city") || "",
      propertyType: query.get("type") ? [query.get("type")] : [],
      bhk: query.get("bhk") || "",
      maxPrice: 100000000,
      amenities: [],
      furnishing: [],
      sort: "latest",
    };
  };

  const [filters, setFilters] = useState(getInitialFilters);

  // to fecth all the properties
  const fetchProperties = useCallback(async (currentFilters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (currentFilters.city) params.append("city", currentFilters.city);
      if (currentFilters.propertyType.length)
        params.append("propertyType", currentFilters.propertyType.join(","));
      if (currentFilters.bhk) params.append("bhk", currentFilters.bhk);
      if (currentFilters.maxPrice)
        params.append("maxPrice", currentFilters.maxPrice);
      if (currentFilters.furnishing.length)
        params.append("furnishing", currentFilters.furnishing.join(","));
      if (currentFilters.sort) params.append("sort", currentFilters.sort);

      const res = await api.get(`${API_URL}/api/property?${params.toString()}`);

      setProperties(res.data.properties || []);
      setError(null);
    } catch (error) {
      console.error(error);
      setError("Failed to load Properties");
    } finally {
      setLoading(false);
    }
  }, []);

  //Initial fetch

  useEffect(() => {
    const loadProperties = async () => {
      await fetchProperties(filters);
    };

    loadProperties();
  }, [fetchProperties, filters]);

  //Clean Up Timer

  const fetchTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (fetchTimer.current) {
        clearTimeout(fetchTimer.current);
      }
    };
  }, []);

  // Debounce

  const debouncedFetch = useCallback(
    (updatedFilters) => {
      if (fetchTimer.current) clearTimeout(fetchTimer.current);
      fetchTimer.current = setTimeout(() => {
        fetchProperties(updatedFilters);
      }, 500);
    },
    [fetchProperties],
  ); //for filter fetching timer

  //to toggle wishlist

  const handleToggleWishlist = async (propertyId) => {
    if (!user || !token) {
      navigate("/login");
      return;
    }
    try {
      const isWishlisted = wishListedIds.includes(propertyId);
      if (isWishlisted) {
        await api.delete(`${API_URL}/api/wishlist/${propertyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishListedIds((prev) => prev.filter((id) => id !== propertyId));
      } else {
        await api.post(
          `${API_URL}/api/wishlist/${propertyId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setWishListedIds((prev) => [...prev, propertyId]);
      }
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
    }
  };

  // Filter Handlers
  const handleCheckboxChange = (category, value) => {
    const current = [...(filters[category] || [])];
    const index = current.indexOf(value);
    if (index === -1) {
      current.push(value);
    } else {
      current.splice(index, 1);
    }
    const updatedFilters = { ...filters, [category]: current };
    setFilters(updatedFilters);
    fetchProperties(updatedFilters);
  }; // to update filter once toggle the checkbox

  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value);
    const updatedFilters = { ...filters, maxPrice: value };
    setFilters(updatedFilters);
    debouncedFetch(updatedFilters);
  }; //for price filter

  const handleBhkSelect = (value) => {
    const updatedFilters = {
      ...filters,
      bhk: filters.bhk === value ? "" : value,
    };
    setFilters(updatedFilters);
    fetchProperties(updatedFilters);
  }; // for bhk filter according to their number

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    const updatedFilters = { ...filters, sort: newSort };
    setFilters(updatedFilters);
    fetchProperties(updatedFilters);
  };

  const applyFilters = () => {
    if (fetchTimer.current) clearTimeout(fetchTimer.current);
    fetchProperties(filters);
  }; // to apply filter by button

  const resetFilters = () => {
    if (fetchTimer.current) clearTimeout(fetchTimer.current);
    const reset = {
      city: "",
      propertyType: [],
      bhk: "",
      maxPrice: 100000000,
      amenities: [],
      furnishing: [],
      sort: "latest",
    };
    setFilters(reset);
    navigate("/properties");
    fetchProperties(reset);
  };

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className={s.pageContainer}>
      <Navbar />
      <div className={s.container}>
        <div className={s.mobileFilterButtonWrapper}>
          <button
            onClick={() => setShowMobileFilters(true)}
            className={s.mobileFilterButton}
          >
            <HiFilter /> Show Filters & Search
          </button>
        </div>
        <div className={s.layout}>
          <aside
            className={`${s.sidebar} ${showMobileFilters ? s.sidebarVisible : s.sidebarHidden}`}
          >
            <div className={s.sidebarHeader}>
              <div className={s.sidebarTitleWrapper}>
                <HiFilter className={s.sidebarTitleIcon} />
                <h2 className={s.sidebarTitle}>Filters</h2>
              </div>
              <div className={s.sidebarHeaderActions}>
                <button onClick={resetFilters} className={s.resetButton}>
                  Reset
                </button>
                <button
                  className={s.closeMobileFilters}
                  onClick={() => setShowMobileFilters(false)}
                >
                  <HiX />
                </button>
              </div>
            </div>
            <div className={s.filtersScrollArea}>
              <div className={s.filterSection}>
                <label className={s.filterLabel}>Location</label>
                <div className={s.searchInputWrapper}>
                  <HiSearch className={s.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search by City.."
                    value={filters.city}
                    onChange={(e) => {
                      const updatedFilters = {
                        ...filters,
                        city: e.target.value,
                      };
                      setFilters(updatedFilters);
                      debouncedFetch(updatedFilters);
                    }}
                    className={s.searchInput}
                  />
                </div>
              </div>
              {/* Price Range */}
              <div className={s.filterSection}>
                <div className={s.priceHeader}>
                  <label className={s.filterLabel}>Price Range</label>
                  <span className={s.priceValue}>
                    {filters.maxPrice >= 10000000
                      ? `₹${(filters.maxPrice / 10000000).toFixed(2)} Cr`
                      : `₹${(filters.maxPrice / 100000).toFixed(1)} L`}
                  </span>
                </div>
                <input
                  type="range"
                  min="100000"
                  max="100000000"
                  step="500000"
                  value={filters.maxPrice}
                  onChange={handlePriceChange}
                  className={s.priceSlider}
                />
                <div className={s.priceLabels}>
                  <span>₹1L</span>
                  <span>₹10Cr</span>
                </div>
              </div>

              {/* Property Type */}
              <div className={s.filterSection}>
                <label className={s.filterLabel}>Property Type</label>
                <div className={s.checkboxGroup}>
                  {propertyTypes.map((type) => (
                    <label key={type.value} className={s.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={filters.propertyType.includes(type.value)}
                        onChange={() =>
                          handleCheckboxChange("propertyType", type.value)
                        }
                        className={s.checkbox}
                      />
                      {type.label}
                    </label>
                  ))}
                </div>
              </div>
              {/* BHK*/}
              <div className={s.filterSection}>
                <label className={s.filterLabel}>BHK (Bedrooms)</label>
                <div className={s.bhkGroup}>
                  {bhkOptions.map((Option) => (
                    <button
                      key={Option}
                      onClick={() => handleBhkSelect(Option)}
                      className={`${s.bhkButton} ${filters.bhk == Option ? s.bhkButtonActive : s.bhkButtonInactive}`}
                    >
                      {Option}
                    </button>
                  ))}
                </div>
              </div>
              <div className={s.filterSection}>
                <label className={s.filterLabel}>Furnishing</label>
                <div className={s.checkboxGroup}>
                  {furnishingOptions.map((Option) => (
                    <label key={Option.value} className={s.checkboxLabel}>
                      <input
                        type="text"
                        checked={filters.furnishing?.includes(Option.value)}
                        onChange={() =>
                          handleCheckboxChange("furnishing", Option.value)
                        }
                        className={s.checkbox}
                      />
                      {Option.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* main Content */}
          <main className={s.mainContent}>
            <div className={s.contentHeader}>
              <div>
                <span className={s.resultCount}>
                  Showing{" "}
                  <strong className={s.resultCountStrong}>
                    {loading ? "..." : properties.length}
                  </strong>{" "}
                  Properties
                </span>
              </div>
              <div className={s.headerControls}>
                <div className={s.viewModeToggle}>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`${s.viewModeButton} ${viewMode === "grid" ? s.viewModeActive : s.viewModeInactive}`}
                  >
                    <HiViewGrid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`${s.viewModeButton} ${viewMode === "list" ? s.viewModeActive : s.viewModeInactive}`}
                  >
                    <HiViewList size={20} />
                  </button>
                </div>
                <div className={s.sortControl}>
                  <span className={s.sortControl}>Sort : </span>
                  <select
                    value={filters.sort}
                    onChange={handleSortChange}
                    className={s.sortSelect}
                  >
                    <option value="latest">Latest</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* property grid */}
            {loading ? (
              <div className={s.skeletonGrid}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className={s.skeletonCard}></div>
                ))}
              </div>
            ) : error ? (
              <div className={s.errorContainer}>
                <HiX size={48} className={s.errorIcon} />
                <h3 className={s.errorTitle}>{error}</h3>
                <button onClick={applyFilters} className={s.errorButton}>
                  Try Again
                </button>
              </div>
            ) : properties.length === 0 ? (
              <div className={s.emptyContainer}>
                <div className={s.emptyIconWrapper}>
                  <HiAdjustments size={32} className={s.emptyIcon} />
                </div>
                <h2 className={s.emptyTitle}>No properties found</h2>
                <p className={s.emptyText}>Broaded Your search Criteria</p>
                <button onClick={resetFilters} className={s.emptyButton}>
                  Clear All
                </button>
              </div>
            ) : (
              <div
                className={`${s.propertyList} ${
                  viewMode === "grid" ? s.propertyListGrid : s.propertyListList
                }`}
              >
                {properties
                  .filter((p) => p)
                  .map((p) => (
                    <PropertyCard
                      key={p._id}
                      property={p}
                      isWishListed={wishListedIds.includes(String(p._id))}
                      onToggleWishList={handleToggleWishlist}
                    />
                  ))}
              </div>
            )}
          </main>
        </div>
      </div>
      {showMobileFilters && (
        <div
          onClick={() => setShowMobileFilters(false)}
          className={s.mobileOverlay}
        ></div>
      )}
    </div>
  );
};

export default Properties;
