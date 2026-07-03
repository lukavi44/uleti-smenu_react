import { FormEvent, useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ChevronRightIcon,
  EnvelopeIcon,
  MapPinIcon,
  PencilSquareIcon,
  PhoneIcon,
  StarIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import ProfileAccordion from "../../components/Profile/ProfileAccordion";
import ProfileAvatarPicker from "../../components/Profile/ProfileAvatarPicker";
import Pagination from "../../components/Common/Pagination";
import PlatformShiftList from "../../components/Profile/PlatformShiftList";
import WorkExperienceSection from "../../components/Profile/WorkExperienceSection";
import PendingReviewsSection from "../../components/Reviews/PendingReviewsSection";
import ReceivedReviewsSection from "../../components/Reviews/ReceivedReviewsSection";
import { FAVOURITE_RESTAURANTS_PAGE_SIZE } from "../../constants/pagination";
import { getRestaurantProfilePath } from "../../helpers/restaurantPaths";
import { getImageUrl } from "../../helpers/getHelperUrl";
import { getRatingQualityLabel } from "../../helpers/ratingQualityLabel";
import { useClientPagination } from "../../hooks/useClientPagination";
import { useIsCandidateShell } from "../../hooks/useIsCandidateShell";
import { useProfilePhotoUpload } from "../../hooks/useProfilePhotoUpload";
import { Review, ReviewSummary } from "../../models/Review.model";
import { EmployeePlatformShift } from "../../models/WorkExperience.model";
import { Employee } from "../../models/User.model";
import { GetMyPlatformShifts, GetMyWorkExperiences } from "../../services/employee-profile-service";
import { GetEmployeeReviewPage, GetMyPendingReviews } from "../../services/review-service";
import { GetEmployersWithFavouriteStatus, PatchClientFavorite, UpdateMyEmployeeProfile } from "../../services/user-service";
import { AuthContext } from "../../store/Auth-context";
import styles from "./EmployeeProfile.module.scss";

interface EmployeeProfileProps {
  user: Employee;
}

const buildEmployeeProfileForm = (user: Employee) => ({
  firstName: user.firstName,
  lastName: user.lastName,
  phoneNumber: user.phoneNumber ?? "",
  city: user.city ?? user.address?.city?.name ?? "",
});

const EmployeeProfile = ({ user }: EmployeeProfileProps) => {
  const { t } = useTranslation();
  const { refreshMe } = useContext(AuthContext);
  const isCandidateShell = useIsCandidateShell();
  const {
    profilePhotoUrl,
    setProfilePhotoUrl,
    isPhotoUploadInProgress,
    photoInputRef,
    handlePhotoSelect,
  } = useProfilePhotoUpload(user.profilePhoto, user.id);

  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(() => buildEmployeeProfileForm(user));
  const [restaurants, setRestaurants] = useState<
    { id: string; name: string; profilePhoto?: string; publicSlug?: string; isFavourite: boolean }[]
  >([]);
  const [favouriteActionInProgressId, setFavouriteActionInProgressId] = useState<string | null>(null);
  const [platformShifts, setPlatformShifts] = useState<EmployeePlatformShift[]>([]);
  const [receivedReviews, setReceivedReviews] = useState<Review[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary>({ averageRating: 0, reviewCount: 0 });
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const [workExperienceCount, setWorkExperienceCount] = useState(0);
  const [isPendingOpen, setIsPendingOpen] = useState(false);
  const [isReceivedOpen, setIsReceivedOpen] = useState(false);
  const [isExperienceOpen, setIsExperienceOpen] = useState(false);
  const [isShiftsOpen, setIsShiftsOpen] = useState(false);
  const [isFavouritesOpen, setIsFavouritesOpen] = useState(false);

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const reviewsPath = `/employees/${user.id}/reviews`;

  const {
    page: favouritesPage,
    setPage: setFavouritesPage,
    totalPages: favouritesTotalPages,
    totalCount: favouritesTotalCount,
    pageSize: favouritesPageSize,
    pagedItems: pagedRestaurants,
  } = useClientPagination(restaurants, FAVOURITE_RESTAURANTS_PAGE_SIZE);

  const ratingQualityLabel = useMemo(
    () => getRatingQualityLabel(reviewSummary.averageRating, reviewSummary.reviewCount, t),
    [reviewSummary.averageRating, reviewSummary.reviewCount, t]
  );

  const renderRatingLink = (className: string) => {
    if (reviewSummary.reviewCount <= 0) {
      return null;
    }

    return (
      <Link to={reviewsPath} className={`${styles.ratingLink} ${className}`}>
        <strong>★ {reviewSummary.averageRating.toFixed(1)}</strong> ({reviewSummary.reviewCount})
        {ratingQualityLabel ? <span className={styles.ratingWord}> {ratingQualityLabel}</span> : null}
      </Link>
    );
  };

  useEffect(() => {
    setProfileForm(buildEmployeeProfileForm(user));
  }, [user.firstName, user.lastName, user.phoneNumber, user.city, user.address?.city?.name]);

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const response = await GetEmployersWithFavouriteStatus();
        setRestaurants(
          response.data
            .filter((restaurant) => restaurant.isFavourite)
            .map((restaurant) => ({
              id: restaurant.id,
              name: restaurant.name,
              profilePhoto: restaurant.profilePhoto,
              publicSlug: restaurant.publicSlug,
              isFavourite: restaurant.isFavourite,
            }))
        );
      } catch {
        toast.error(t("profile.failedLoadFavorites"));
      }
    };

    void loadRestaurants();
  }, [t]);

  useEffect(() => {
    const loadPlatformShifts = async () => {
      try {
        const response = await GetMyPlatformShifts();
        setPlatformShifts(response.data);
      } catch {
        toast.error(t("employeeProfile.failedLoadPlatformShifts"));
      }
    };

    void loadPlatformShifts();
  }, [t]);

  useEffect(() => {
    const loadReceivedReviews = async () => {
      try {
        const response = await GetEmployeeReviewPage(user.id);
        setReceivedReviews(response.data.reviews);
        setReviewSummary(response.data.summary);
      } catch {
        toast.error(t("reviews.loadError"));
      }
    };

    void loadReceivedReviews();
  }, [user.id, t]);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [pendingResponse, experienceResponse] = await Promise.all([
          GetMyPendingReviews(),
          GetMyWorkExperiences(),
        ]);
        setPendingReviewCount(pendingResponse.data.length);
        setWorkExperienceCount(experienceResponse.data.length);
      } catch {
        setPendingReviewCount(0);
        setWorkExperienceCount(0);
      }
    };

    void loadCounts();
  }, []);

  useEffect(() => {
    setIsPendingOpen(pendingReviewCount > 0);
    setIsReceivedOpen(reviewSummary.reviewCount > 0);
  }, [pendingReviewCount, reviewSummary.reviewCount]);

  const handleProfileSave = async (event: FormEvent) => {
    event.preventDefault();

    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      toast.error(t("registration.firstNameRequired"));
      return;
    }

    setIsProfileSaving(true);
    try {
      await UpdateMyEmployeeProfile({
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        phoneNumber: profileForm.phoneNumber.trim(),
        city: profileForm.city.trim() || undefined,
      });
      toast.success(t("profile.profileUpdated"));
      setIsEditingProfile(false);
      void refreshMe();
    } catch {
      toast.error(t("profile.profileUpdateError"));
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleUnfavourite = async (restaurantId: string) => {
    if (favouriteActionInProgressId !== null) {
      return;
    }

    setFavouriteActionInProgressId(restaurantId);
    try {
      await PatchClientFavorite(restaurantId);
      setRestaurants((previous) => previous.filter((restaurant) => restaurant.id !== restaurantId));
      if (pagedRestaurants.length === 1 && favouritesPage > 1) {
        setFavouritesPage(favouritesPage - 1);
      }
      toast.success(t("profile.removeSuccess"));
    } catch {
      toast.error(t("profile.removeError"));
    } finally {
      setFavouriteActionInProgressId(null);
    }
  };

  const renderProfileForm = () => (
    <form className={styles.profileFormGrid} onSubmit={handleProfileSave}>
      <label className={styles.profileField}>
        <span className={styles.infoLabel}>{t("profile.firstName")}</span>
        <input
          className={styles.input}
          value={profileForm.firstName}
          onChange={(event) => setProfileForm((previous) => ({ ...previous, firstName: event.target.value }))}
        />
      </label>
      <label className={styles.profileField}>
        <span className={styles.infoLabel}>{t("profile.lastName")}</span>
        <input
          className={styles.input}
          value={profileForm.lastName}
          onChange={(event) => setProfileForm((previous) => ({ ...previous, lastName: event.target.value }))}
        />
      </label>
      <label className={styles.profileField}>
        <span className={styles.infoLabel}>{t("profile.email")}</span>
        <input className={`${styles.input} ${styles.readOnlyInput}`} value={user.email} readOnly />
      </label>
      <label className={styles.profileField}>
        <span className={styles.infoLabel}>{t("profile.phone")}</span>
        <input
          className={styles.input}
          value={profileForm.phoneNumber}
          onChange={(event) => setProfileForm((previous) => ({ ...previous, phoneNumber: event.target.value }))}
        />
      </label>
      <label className={styles.profileField}>
        <span className={styles.infoLabel}>{t("profile.city")}</span>
        <input
          className={styles.input}
          value={profileForm.city}
          onChange={(event) => setProfileForm((previous) => ({ ...previous, city: event.target.value }))}
        />
      </label>
      <div className={styles.profileEditActions}>
        <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`} disabled={isProfileSaving}>
          {isProfileSaving ? t("common.loading") : t("profile.saveChanges")}
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonSecondary}`}
          onClick={() => {
            setProfileForm(buildEmployeeProfileForm(user));
            setIsEditingProfile(false);
          }}
          disabled={isProfileSaving}
        >
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );

  const renderInfoTable = () => (
    <div className={styles.infoTable}>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>{t("profile.firstName")}</span>
        <span className={styles.infoValue}>{user.firstName || "—"}</span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>{t("profile.lastName")}</span>
        <span className={styles.infoValue}>{user.lastName || "—"}</span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>{t("profile.email")}</span>
        <span className={styles.infoValue}>{user.email}</span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>{t("profile.phone")}</span>
        <span className={styles.infoValue}>{user.phoneNumber?.trim() || "—"}</span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>{t("profile.city")}</span>
        <span className={styles.infoValue}>{user.city?.trim() || user.address?.city?.name?.trim() || "—"}</span>
      </div>
    </div>
  );

  const renderSectionAccordions = () => (
    <div className={styles.sections}>
      <ProfileAccordion
        title={t("reviews.pendingTitle")}
        icon={<ChatBubbleLeftRightIcon />}
        itemCount={pendingReviewCount}
        isOpen={isPendingOpen}
        onOpenChange={setIsPendingOpen}
      >
        <PendingReviewsSection />
      </ProfileAccordion>

      <ProfileAccordion
        title={t("reviews.receivedTitle")}
        icon={<StarIcon />}
        itemCount={reviewSummary.reviewCount}
        isOpen={isReceivedOpen}
        onOpenChange={setIsReceivedOpen}
      >
        <ReceivedReviewsSection reviews={receivedReviews} reviewSummary={reviewSummary} />
      </ProfileAccordion>

      <ProfileAccordion
        title={t("employeeProfile.workExperience")}
        icon={<BriefcaseIcon />}
        itemCount={workExperienceCount}
        isOpen={isExperienceOpen}
        onOpenChange={setIsExperienceOpen}
      >
        <WorkExperienceSection />
      </ProfileAccordion>

      <ProfileAccordion
        title={t("employeeProfile.platformHistory")}
        icon={<CalendarDaysIcon />}
        itemCount={platformShifts.length}
        isOpen={isShiftsOpen}
        onOpenChange={setIsShiftsOpen}
      >
        <PlatformShiftList shifts={platformShifts} />
      </ProfileAccordion>

      <ProfileAccordion
        title={t("profile.favouriteRestaurants")}
        icon={<BuildingStorefrontIcon />}
        itemCount={restaurants.length}
        isOpen={isFavouritesOpen}
        onOpenChange={setIsFavouritesOpen}
      >
        {restaurants.length === 0 ? (
          <p className={styles.mutedText}>{t("profile.noFavouriteRestaurants")}</p>
        ) : (
          <>
            <div className={styles.favouriteList}>
              {pagedRestaurants.map((restaurant) => (
                <article key={restaurant.id} className={styles.favouriteCard}>
                  <div className={styles.favouriteRow}>
                    <Link to={getRestaurantProfilePath(restaurant)}>
                      <img
                        src={getImageUrl(restaurant.profilePhoto)}
                        alt={restaurant.name}
                        className={styles.favouriteLogo}
                      />
                    </Link>
                    <div>
                      <Link to={getRestaurantProfilePath(restaurant)} className={styles.favouriteNameLink}>
                        {restaurant.name}
                      </Link>
                      <p className={styles.mutedText}>{t("profile.favourite")}</p>
                    </div>
                    <button
                      type="button"
                      className={`${styles.button} ${styles.buttonSecondary} ${styles.favouriteRemoveButton}`}
                      disabled={favouriteActionInProgressId !== null}
                      onClick={() => void handleUnfavourite(restaurant.id)}
                    >
                      {favouriteActionInProgressId === restaurant.id
                        ? t("profile.removing")
                        : t("profile.remove")}
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <Pagination
              page={favouritesPage}
              totalPages={favouritesTotalPages}
              totalCount={favouritesTotalCount}
              pageSize={favouritesPageSize}
              onPrevious={() => setFavouritesPage((previous) => Math.max(1, previous - 1))}
              onNext={() => setFavouritesPage((previous) => Math.min(favouritesTotalPages, previous + 1))}
            />
          </>
        )}
      </ProfileAccordion>
    </div>
  );

  const avatarFallbackLabel = fullName || "?";

  return (
    <div className={`${styles.page} ${isCandidateShell ? styles.pageShell : ""}`}>
      <div className={styles.mobileShell}>
        <div className={styles.mobileTopBar}>
          <h2 className={styles.mobilePageTitle}>{t("candidate.profileTitle")}</h2>
        </div>

        <div className={styles.mobileProfileBlock}>
          <div className={styles.mobileAvatarWrap}>
            <ProfileAvatarPicker
              photoUrl={profilePhotoUrl}
              fallbackLabel={avatarFallbackLabel}
              isUploading={isPhotoUploadInProgress}
              inputRef={photoInputRef}
              onSelect={handlePhotoSelect}
              onPhotoError={() => setProfilePhotoUrl(getImageUrl(null))}
              variant="mobile"
              imageClassName={styles.mobileAvatar}
              fallbackClassName={styles.mobileAvatarFallback}
            />
          </div>
          <h3 className={styles.mobileCompanyName}>{fullName}</h3>
          {renderRatingLink(styles.mobileRating)}
        </div>

        <div className={styles.groupCard}>
          <div className={styles.groupRowStatic}>
            <span className={styles.rowIconWrap}>
              <UserIcon className={styles.rowIcon} aria-hidden />
            </span>
            <span className={styles.rowBody}>
              <span className={styles.rowTitle}>{fullName}</span>
              <span className={styles.rowSubtitle}>{t("profile.personalInfo")}</span>
            </span>
            <button
              type="button"
              className={styles.iconGhostButton}
              aria-label={t("profile.edit")}
              onClick={() => setIsEditingProfile((open) => !open)}
            >
              <PencilSquareIcon width={16} height={16} />
            </button>
          </div>
          <div className={styles.groupRowStatic}>
            <span className={styles.rowIconWrap}>
              <PhoneIcon className={styles.rowIcon} aria-hidden />
            </span>
            <span className={styles.rowBody}>
              <span className={styles.rowTitle}>{user.phoneNumber?.trim() || "—"}</span>
              <span className={styles.rowSubtitle}>{t("profile.phone")}</span>
            </span>
            <ChevronRightIcon className={styles.rowChevron} aria-hidden />
          </div>
          <div className={styles.groupRowStatic}>
            <span className={styles.rowIconWrap}>
              <EnvelopeIcon className={styles.rowIcon} aria-hidden />
            </span>
            <span className={styles.rowBody}>
              <span className={styles.rowTitle}>{user.email}</span>
              <span className={styles.rowSubtitle}>{t("profile.email")}</span>
            </span>
            <ChevronRightIcon className={styles.rowChevron} aria-hidden />
          </div>
          <div className={styles.groupRowStatic}>
            <span className={styles.rowIconWrap}>
              <MapPinIcon className={styles.rowIcon} aria-hidden />
            </span>
            <span className={styles.rowBody}>
              <span className={styles.rowTitle}>
                {user.city?.trim() || user.address?.city?.name?.trim() || "—"}
              </span>
              <span className={styles.rowSubtitle}>{t("profile.city")}</span>
            </span>
            <ChevronRightIcon className={styles.rowChevron} aria-hidden />
          </div>
        </div>

        {isEditingProfile ? (
          <section className={styles.card}>
            <p className={styles.privacyNotice}>{t("profile.contactPrivacyNotice")}</p>
            {renderProfileForm()}
          </section>
        ) : null}

        {renderSectionAccordions()}
      </div>

      <div className={styles.desktopShell}>
        <section className={styles.card}>
          <div className={styles.profileCardHeader}>
            <h2 className={styles.sectionTitle}>{t("profile.personalInfo")}</h2>
            {!isEditingProfile ? (
              <button type="button" className={styles.editButton} onClick={() => setIsEditingProfile(true)}>
                <PencilSquareIcon width={15} height={15} aria-hidden />
                {t("profile.edit")}
              </button>
            ) : null}
          </div>
          <div className={styles.profileGrid}>
            <div className={styles.photoColumn}>
              <ProfileAvatarPicker
                photoUrl={profilePhotoUrl}
                fallbackLabel={avatarFallbackLabel}
                isUploading={isPhotoUploadInProgress}
                inputRef={photoInputRef}
                onSelect={handlePhotoSelect}
                onPhotoError={() => setProfilePhotoUrl(getImageUrl(null))}
                variant="desktop"
                imageClassName={styles.profileImage}
                fallbackClassName={styles.avatarFallback}
              />
            </div>
            <div>
              <div className={styles.companyHeader}>
                <div>
                  <h3 className={styles.companyName}>{fullName}</h3>
                  {renderRatingLink(styles.ratingLine)}
                </div>
              </div>
              <p className={styles.privacyNotice}>{t("profile.contactPrivacyNotice")}</p>
              {isEditingProfile ? renderProfileForm() : renderInfoTable()}
            </div>
          </div>
        </section>

        {renderSectionAccordions()}
      </div>
    </div>
  );
};

export default EmployeeProfile;
