import { MouseEvent } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getImageUrl } from "../../helpers/getHelperUrl";
import { getRestaurantProfilePath } from "../../helpers/restaurantPaths";
import { PatchClientFavorite } from "../../services/user-service";
import styles from "./RestaurantLogoCarousel.module.scss";

export interface RestaurantLogoItem {
  id: string;
  name: string;
  profilePhoto?: string;
  publicSlug?: string;
  isFavourite: boolean;
}

interface RestaurantLogoCarouselProps {
  restaurants: RestaurantLogoItem[];
  onFavouriteChange?: (restaurantId: string, isFavourite: boolean) => void;
}

const RestaurantLogoCarousel = ({ restaurants, onFavouriteChange }: RestaurantLogoCarouselProps) => {
  const { t } = useTranslation();

  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: false,
    mode: "free",
    slides: {
      perView: "auto",
      spacing: 16,
    },
    rubberband: true,
  });

  const handleFavouriteToggle = async (
    restaurant: RestaurantLogoItem,
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      await PatchClientFavorite(restaurant.id);
      onFavouriteChange?.(restaurant.id, !restaurant.isFavourite);
    } catch (error) {
      console.error(error);
    }
  };

  if (restaurants.length === 0) {
    return null;
  }

  return (
    <div ref={sliderRef} className={`keen-slider ${styles.carousel}`}>
      {restaurants.map((restaurant) => (
        <div key={restaurant.id} className={`keen-slider__slide ${styles.slide}`}>
          <Link
            to={getRestaurantProfilePath(restaurant)}
            className={styles.logoLink}
            aria-label={restaurant.name}
            title={restaurant.name}
          >
            <img
              src={getImageUrl(restaurant.profilePhoto)}
              alt={restaurant.name}
              className={styles.logo}
            />
            <button
              type="button"
              className={`${styles.favouriteButton} ${restaurant.isFavourite ? styles.isFavourite : ""}`}
              aria-label={
                restaurant.isFavourite
                  ? t("employers.removeFromFavorites")
                  : t("employers.addToFavorites")
              }
              onClick={(event) => void handleFavouriteToggle(restaurant, event)}
            >
              {restaurant.isFavourite ? "★" : "☆"}
            </button>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default RestaurantLogoCarousel;
