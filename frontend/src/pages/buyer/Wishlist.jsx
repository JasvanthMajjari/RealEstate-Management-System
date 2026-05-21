import { useEffect, useState } from "react";
import { wishlistStyles as s } from "../../assets/dummyStyles";
import Navbar from "../../components/common/Navbar";
import { useAuth } from "../../context/useAuth";
import API_URL from "../../config.js";
import { HiHeart, HiTrash } from "react-icons/hi";
import { Link } from "react-router-dom";
import PropertyCard from "../../components/common/PropertyCard";
import api from "../../utils/axios.js";
const Wishlist = () => {
  const { token } = useAuth();
  const [wishListItems, setWishListItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishList = async () => {
      try {
        const res = await api.get(`${API_URL}/api/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishListItems(res.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to load wishlist");
        console.error(error);
      }
    };
    fetchWishList();
  }, [token]);

  //to remove or add property from wishlist
  const toggleWishlist = async (propertyId, isWishListed) => {
    try {
      if (isWishListed) {
        // REMOVE
        await api.delete(`${API_URL}/api/wishlist/${propertyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setWishListItems((prev) =>
          prev.filter((item) => item.property?._id !== propertyId),
        );
      } else {
        // ADD
        const res = await api.post(
          `${API_URL}/api/wishlist/${propertyId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setWishListItems((prev) => [...prev, res.data]);
      }
    } catch (error) {
      console.error(error);
      alert("wishlist toggle failed");
    }
  };

  if (loading)
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className={s.pageContainer}>
        <Navbar />
        <main className={s.mainContainer}>
          <div className={s.headingWrapper}>
            <h1 className={s.heading}>Your Wishlist</h1>
            <p className={s.subheading}>Properties you've saved fot later.</p>
          </div>

          {wishListItems.length === 0 ? (
            <div className={s.emptyCard}>
              <div className={s.emptyIconWrapper}>
                <HiHeart size={40} />
              </div>
              <h2 className={s.emptyTitle}>Your Wishlist is empty</h2>
              <p className={s.emptyText}>
                Start exploring properties and save your favourites!
              </p>
              <Link to="/" className={s.browseButton}>
                Browse Properties
              </Link>
            </div>
          ) : (
            <div className={s.gridContainer}>
              {wishListItems
                .filter((item) => item.property)
                .map((item) => (
                  <PropertyCard
                    key={item._id}
                    property={item.property}
                    isWishListed={true}
                    onToggleWishList={toggleWishlist}
                    renderActions={() => (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(item.property._id, true);
                        }}
                        className={s.removeButton}
                      >
                        <HiTrash size={18} /> Remove
                      </button>
                    )}
                  />
                ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Wishlist;
