import { FormEvent, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  IdentificationIcon,
  MapPinIcon,
  PencilSquareIcon,
  PhoneIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import ProfileAccordion from "../../components/Profile/ProfileAccordion";
import ProfileAvatarPicker from "../../components/Profile/ProfileAvatarPicker";
import EmployerProfileIncompleteBanner from "../../components/Profile/EmployerProfileIncompleteBanner";
import { getImageUrl } from "../../helpers/getHelperUrl";
import { formatDisplayDate } from "../../helpers/formatDisplayDate";
import { getRatingQualityLabel } from "../../helpers/ratingQualityLabel";
import {
  getEmployerProfileCompleteness,
  EmployerMissingProfileField,
} from "../../helpers/employerProfileCompleteness";
import { useProfilePhotoUpload } from "../../hooks/useProfilePhotoUpload";
import { useIsEmployerShell } from "../../hooks/useIsEmployerShell";
import { Employer } from "../../models/User.model";
import { RestaurantLocation } from "../../models/RestaurantLocation.model";
import { ReviewSummary } from "../../models/Review.model";
import { UpdateMyEmployerProfile } from "../../services/user-service";
import { CreateMyRestaurantLocation, DeleteMyRestaurantLocation, GetMyRestaurantLocations, UpdateMyRestaurantLocation } from "../../services/restaurantLocation-service";
import { getApiErrorMessage } from "../../helpers/apiError";
import { GetEmployerReviewPage } from "../../services/review-service";
import { AuthContext } from "../../store/Auth-context";
import ConfirmActionDialog from "../../components/Dialog/ConfirmActionDialog";
import GeographySelects from "../../components/Profile/GeographySelects";
import styles from "./EmployerProfile.module.scss";

interface EmployerProfileProps {
  user: Employer;
}

const buildEmployerProfileForm = (user: Employer) => ({
  name: user.name ?? "",
  phoneNumber: user.phoneNumber ?? "",
  pib: user.pib ?? "",
  mb: user.mb ?? "",
  streetName: user.address?.street?.name ?? "",
  streetNumber: user.address?.street?.number ? String(user.address.street.number) : "",
  postalCode: user.address?.city?.postalCode ? String(user.address.city.postalCode) : "",
  countryCode: user.countryCode ?? "",
  regionCode: user.regionCode ?? "",
  cityCode: user.cityCode ?? "",
});

const formatEmployerAddress = (user: Employer) => {
  const streetName = user.address?.street?.name ?? "";
  const streetNumber = user.address?.street?.number ? String(user.address.street.number) : "";
  const city = user.address?.city?.name ?? "";
  if (!streetName && !city) {
    return "—";
  }
  return `${streetName} ${streetNumber}, ${city}`.trim();
};

const EmployerProfile = ({ user }: EmployerProfileProps) => {
  const { t } = useTranslation();
  const { refreshMe } = useContext(AuthContext);
  const location = useLocation();
  const isEmployerShell = useIsEmployerShell();
  const employerInfoRef = useRef<HTMLElement | null>(null);
  const profileCompleteness = getEmployerProfileCompleteness(user);
  const {
    profilePhotoUrl,
    setProfilePhotoUrl,
    isPhotoUploadInProgress,
    photoInputRef,
    handlePhotoSelect,
  } = useProfilePhotoUpload(user.profilePhoto, user.id);

  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(() => buildEmployerProfileForm(user));
  const [locations, setLocations] = useState<RestaurantLocation[]>([]);
  const [isCreatingLocation, setIsCreatingLocation] = useState(false);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary>({ averageRating: 0, reviewCount: 0 });
  const [reviewerAvatars, setReviewerAvatars] = useState<string[]>([]);
  const [isBranchesOpen, setIsBranchesOpen] = useState(true);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [deleteConfirmBranchId, setDeleteConfirmBranchId] = useState<string | null>(null);
  const [branchEditForm, setBranchEditForm] = useState({
    name: "",
    phoneNumber: "",
    pib: "",
    mb: "",
    streetName: "",
    streetNumber: "",
    postalCode: "",
    countryCode: "RS",
    regionCode: "",
    cityCode: "",
  });
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [isDeletingLocation, setIsDeletingLocation] = useState(false);
  const branchCardRefs = useRef<Record<string, HTMLElement | null>>({});
  const [isReviewsOpen, setIsReviewsOpen] = useState(true);
  const [isVerificationOpen, setIsVerificationOpen] = useState(true);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(true);
  const [isWalletOpen, setIsWalletOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [newBranch, setNewBranch] = useState({
    name: "",
    phoneNumber: "",
    pib: user.pib ?? "",
    mb: user.mb ?? "",
    streetName: "",
    streetNumber: "",
    postalCode: "",
    countryCode: "RS",
    regionCode: "",
    cityCode: "",
  });

  const subscription = user.subscription;
  const walletBalance = subscription?.walletBalance ?? 0;
  const reviewsPath = user.publicSlug
    ? `/restaurants/${user.publicSlug}/reviews`
    : `/employers/${user.id}/reviews`;

  const planLabel = subscription?.planTitle ?? t("profile.employerManage.noPlan");
  const planExpiry =
    subscription?.subscriptionStop && subscription.isActive
      ? t("profile.employerManage.expiresOn", {
          date: formatDisplayDate(subscription.subscriptionStop),
        })
      : null;
  const walletLabel = `${walletBalance.toLocaleString()} RSD`;
  const overflowReviewCount = Math.max(0, reviewSummary.reviewCount - reviewerAvatars.length);

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
    setProfileForm(buildEmployerProfileForm(user));
  }, [user]);

  useEffect(() => {
    const state = location.state as { editProfile?: boolean } | null;
    if (state?.editProfile) {
      setIsEditingProfile(true);
      window.setTimeout(() => {
        employerInfoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }, [location.state]);

  const handleCompleteProfileClick = () => {
    setIsEditingProfile(true);
    window.setTimeout(() => {
      employerInfoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const renderMissingBadge = () => (
    <span className={styles.missingBadge}>
      <span className={styles.missingBar} aria-hidden />
      <ExclamationCircleIcon className={styles.missingIcon} aria-hidden />
      <span>{t("profile.incomplete.missing")}</span>
    </span>
  );

  const renderFieldValue = (field: EmployerMissingProfileField, value: string) => {
    if (profileCompleteness.missing[field]) {
      return renderMissingBadge();
    }
    return value.trim() || "—";
  };

  useEffect(() => {
    setNewBranch((previous) => ({
      ...previous,
      pib: previous.pib || user.pib || "",
      mb: previous.mb || user.mb || "",
    }));
  }, [user.pib, user.mb]);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await GetEmployerReviewPage(user.id);
        setReviewSummary(response.data.summary);
        setReviewerAvatars(
          response.data.reviews
            .map((review) => review.reviewerName?.trim())
            .filter((name): name is string => Boolean(name))
            .slice(0, 4)
        );
      } catch {
        toast.error(t("reviews.loadError"));
      }
    };

    void loadReviews();
  }, [user.id, t]);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const response = await GetMyRestaurantLocations();
        setLocations(response.data);
      } catch {
        toast.error(t("profile.failedLoadBranches"));
      }
    };

    void loadLocations();
  }, [t]);

  useEffect(() => {
    if (window.location.hash !== "#employer-branches") {
      return;
    }

    setIsBranchesOpen(true);
    requestAnimationFrame(() => {
      document.getElementById("employer-branches")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const handleManageBranch = (location: RestaurantLocation) => {
    setIsBranchesOpen(true);
    setShowBranchForm(false);
    setEditingBranchId(location.id);
    setDeleteConfirmBranchId(null);
    setBranchEditForm({
      name: location.name,
      phoneNumber: location.phoneNumber,
      pib: location.pib,
      mb: location.mb,
      streetName: location.streetName,
      streetNumber: location.streetNumber,
      postalCode: location.postalCode,
      countryCode: location.countryCode || "RS",
      regionCode: location.regionCode,
      cityCode: location.cityCode,
    });
    requestAnimationFrame(() => {
      branchCardRefs.current[location.id]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const handleBranchEditFieldChange = (field: keyof typeof branchEditForm, value: string) => {
    setBranchEditForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleCancelBranchEdit = () => {
    setEditingBranchId(null);
    setDeleteConfirmBranchId(null);
  };

  const handleUpdateBranch = async () => {
    if (!editingBranchId) {
      return;
    }

    const requiredValues = Object.values(branchEditForm).every((value) => value.trim() !== "");
    if (!requiredValues) {
      toast.info(t("profile.fillBranchFields"));
      return;
    }

    setIsUpdatingLocation(true);
    try {
      const response = await UpdateMyRestaurantLocation(editingBranchId, branchEditForm);
      setLocations((previous) =>
        previous.map((location) => (location.id === editingBranchId ? response.data : location))
      );
      setEditingBranchId(null);
      toast.success(t("profile.branchUpdated"));
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, t("profile.branchUpdateError")));
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleDeleteBranch = async () => {
    if (!deleteConfirmBranchId) {
      return;
    }

    setIsDeletingLocation(true);
    try {
      await DeleteMyRestaurantLocation(deleteConfirmBranchId);
      setLocations((previous) => previous.filter((location) => location.id !== deleteConfirmBranchId));
      if (editingBranchId === deleteConfirmBranchId) {
        setEditingBranchId(null);
      }
      setDeleteConfirmBranchId(null);
      toast.success(t("profile.branchDeleted"));
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, t("profile.branchDeleteError")));
    } finally {
      setIsDeletingLocation(false);
    }
  };

  const handleProfileSave = async (event: FormEvent) => {
    event.preventDefault();

    if (!profileForm.name.trim()) {
      toast.error(t("registration.companyRequired"));
      return;
    }

    setIsProfileSaving(true);
    try {
      await UpdateMyEmployerProfile({
        name: profileForm.name.trim(),
        phoneNumber: profileForm.phoneNumber.trim(),
        pib: profileForm.pib.trim(),
        mb: profileForm.mb.trim(),
        streetName: profileForm.streetName.trim(),
        streetNumber: profileForm.streetNumber.trim(),
        postalCode: profileForm.postalCode.trim(),
        countryCode: profileForm.countryCode,
        regionCode: profileForm.regionCode,
        cityCode: profileForm.cityCode,
      });
      toast.success(t("profile.profileUpdated"));
      setIsEditingProfile(false);
      void refreshMe();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, t("profile.profileUpdateError")));
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleBranchFieldChange = (field: keyof typeof newBranch, value: string) => {
    setNewBranch((previous) => ({ ...previous, [field]: value }));
  };

  const handleCreateBranch = async () => {
    const requiredValues = Object.values(newBranch).every((value) => value.trim() !== "");
    if (!requiredValues) {
      toast.info(t("profile.fillBranchFields"));
      return;
    }

    setIsCreatingLocation(true);
    try {
      const response = await CreateMyRestaurantLocation(newBranch);
      setLocations((previous) => [...previous, response.data]);
      setNewBranch({
        name: "",
        phoneNumber: "",
        pib: user.pib ?? "",
        mb: user.mb ?? "",
        streetName: "",
        streetNumber: "",
        postalCode: "",
        countryCode: "RS",
        regionCode: "",
        cityCode: "",
      });
      setShowBranchForm(false);
      toast.success(t("profile.branchAdded"));
    } catch {
      toast.error(t("profile.branchAddError"));
    } finally {
      setIsCreatingLocation(false);
    }
  };

  const renderProfileForm = () => (
    <form className={styles.profileFormGrid} onSubmit={handleProfileSave}>
      <label className={styles.profileField}>
        <span className={styles.infoLabel}>{t("profile.restaurantName")}</span>
        <input
          className={styles.input}
          value={profileForm.name}
          onChange={(event) => setProfileForm((previous) => ({ ...previous, name: event.target.value }))}
        />
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
        <span className={styles.infoLabel}>{t("profile.email")}</span>
        <input className={`${styles.input} ${styles.readOnlyInput}`} value={user.email} readOnly />
      </label>
      <label className={styles.profileField}>
        <span className={styles.infoLabel}>{t("registration.pib")}</span>
        <input
          className={styles.input}
          value={profileForm.pib}
          onChange={(event) => setProfileForm((previous) => ({ ...previous, pib: event.target.value }))}
        />
      </label>
      <label className={styles.profileField}>
        <span className={styles.infoLabel}>{t("registration.mb")}</span>
        <input
          className={styles.input}
          value={profileForm.mb}
          onChange={(event) => setProfileForm((previous) => ({ ...previous, mb: event.target.value }))}
        />
      </label>
      <label className={styles.profileField}>
        <span className={styles.infoLabel}>{t("registration.streetName")}</span>
        <input
          className={styles.input}
          value={profileForm.streetName}
          onChange={(event) => setProfileForm((previous) => ({ ...previous, streetName: event.target.value }))}
        />
      </label>
      <label className={styles.profileField}>
        <span className={styles.infoLabel}>{t("registration.streetNumber")}</span>
        <input
          className={styles.input}
          value={profileForm.streetNumber}
          onChange={(event) => setProfileForm((previous) => ({ ...previous, streetNumber: event.target.value }))}
        />
      </label>
      <GeographySelects
        idPrefix="employer-profile"
        className={styles.profileField}
        labelClassName={styles.infoLabel}
        selectClassName={styles.input}
        disabled={isProfileSaving}
        value={{
          countryCode: profileForm.countryCode,
          regionCode: profileForm.regionCode,
          cityCode: profileForm.cityCode,
        }}
        onChange={(selection) =>
          setProfileForm((previous) => ({ ...previous, ...selection }))
        }
      />
      <label className={styles.profileField}>
        <span className={styles.infoLabel}>{t("registration.postalCode")}</span>
        <input
          className={styles.input}
          value={profileForm.postalCode}
          onChange={(event) => setProfileForm((previous) => ({ ...previous, postalCode: event.target.value }))}
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
            setProfileForm(buildEmployerProfileForm(user));
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
        <span className={styles.infoLabel}>{t("profile.restaurantName")}</span>
        <span className={styles.infoValue}>{renderFieldValue("name", user.name ?? "")}</span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>{t("profile.address")}</span>
        <span className={styles.infoValue}>
          {profileCompleteness.missing.address
            ? renderMissingBadge()
            : formatEmployerAddress(user)}
        </span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>{t("profile.phone")}</span>
        <span className={styles.infoValue}>{renderFieldValue("phone", user.phoneNumber ?? "")}</span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>{t("profile.email")}</span>
        <span className={styles.infoValue}>{user.email}</span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>{t("registration.pib")}</span>
        <span className={styles.infoValue}>{renderFieldValue("pib", user.pib ?? "")}</span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>{t("registration.mb")}</span>
        <span className={styles.infoValue}>{renderFieldValue("mb", user.mb ?? "")}</span>
      </div>
    </div>
  );

  const renderBranchesContent = () => (
    <>
      <div className={styles.branchToolbar}>
        <button type="button" className={styles.linkAction} onClick={() => {
          setShowBranchForm((open) => !open);
          setEditingBranchId(null);
          setDeleteConfirmBranchId(null);
        }}>
          + {t("profile.addBranchAction")}
        </button>
      </div>
      <p className={styles.legalNotice}>{t("profile.branchLegalEntityHint")}</p>
      {locations.length === 0 ? <p className={styles.mutedText}>{t("profile.noBranches")}</p> : null}
      <div className={styles.branchGrid}>
        {locations.map((location) => {
          const isEditing = editingBranchId === location.id;

          return (
          <article
            key={location.id}
            ref={(element) => {
              branchCardRefs.current[location.id] = element;
            }}
            className={`${styles.branchCard} ${isEditing ? styles.branchCardEditing : ""}`}
          >
            <div className={styles.branchCardTop}>
              <h3 className={styles.branchName}>{location.name}</h3>
              {!isEditing ? (
                <button
                  type="button"
                  className={styles.branchManageButton}
                  onClick={() => handleManageBranch(location)}
                >
                  {t("profile.employerManage.manageBranch")}
                </button>
              ) : null}
            </div>

            {isEditing ? (
              <div className={styles.branchForm}>
                <input className={styles.input} placeholder={t("profile.restaurantName")} value={branchEditForm.name} onChange={(e) => handleBranchEditFieldChange("name", e.target.value)} />
                <input className={styles.input} placeholder={t("registration.phoneNumber")} value={branchEditForm.phoneNumber} onChange={(e) => handleBranchEditFieldChange("phoneNumber", e.target.value)} />
                <input className={styles.input} placeholder={t("registration.pib")} value={branchEditForm.pib} onChange={(e) => handleBranchEditFieldChange("pib", e.target.value)} />
                <input className={styles.input} placeholder={t("registration.mb")} value={branchEditForm.mb} onChange={(e) => handleBranchEditFieldChange("mb", e.target.value)} />
                <input className={styles.input} placeholder={t("registration.streetName")} value={branchEditForm.streetName} onChange={(e) => handleBranchEditFieldChange("streetName", e.target.value)} />
                <input className={styles.input} placeholder={t("registration.streetNumber")} value={branchEditForm.streetNumber} onChange={(e) => handleBranchEditFieldChange("streetNumber", e.target.value)} />
                <GeographySelects
                  idPrefix={`branch-${location.id}`}
                  className={styles.profileField}
                  labelClassName={styles.infoLabel}
                  selectClassName={styles.input}
                  disabled={isUpdatingLocation}
                  value={{
                    countryCode: branchEditForm.countryCode,
                    regionCode: branchEditForm.regionCode,
                    cityCode: branchEditForm.cityCode,
                  }}
                  onChange={(selection) =>
                    setBranchEditForm((previous) => ({ ...previous, ...selection }))
                  }
                />
                <input className={styles.input} placeholder={t("registration.postalCode")} value={branchEditForm.postalCode} onChange={(e) => handleBranchEditFieldChange("postalCode", e.target.value)} />
                <div className={styles.branchFormActions}>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.buttonPrimary}`}
                    disabled={isUpdatingLocation}
                    onClick={() => void handleUpdateBranch()}
                  >
                    {isUpdatingLocation ? t("common.loading") : t("profile.saveBranch")}
                  </button>
                  <button
                    type="button"
                    className={styles.button}
                    disabled={isUpdatingLocation || isDeletingLocation}
                    onClick={handleCancelBranchEdit}
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.buttonDanger}`}
                    disabled={isUpdatingLocation || isDeletingLocation}
                    onClick={() => setDeleteConfirmBranchId(location.id)}
                  >
                    {t("profile.deleteBranch")}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className={styles.branchLine}>
                  {location.streetName} {location.streetNumber}, {location.city}
                </p>
                <p className={styles.branchLine}>{location.phoneNumber}</p>
                <p className={styles.branchLine}>
                  {t("registration.pib")}: {location.pib} · {t("registration.mb")}: {location.mb}
                </p>
              </>
            )}
          </article>
        )})}
      </div>
      {showBranchForm ? (
        <div className={styles.branchForm}>
          <input className={styles.input} placeholder={t("profile.restaurantName")} value={newBranch.name} onChange={(e) => handleBranchFieldChange("name", e.target.value)} />
          <input className={styles.input} placeholder={t("registration.phoneNumber")} value={newBranch.phoneNumber} onChange={(e) => handleBranchFieldChange("phoneNumber", e.target.value)} />
          <input className={styles.input} placeholder={t("registration.pib")} value={newBranch.pib} onChange={(e) => handleBranchFieldChange("pib", e.target.value)} />
          <input className={styles.input} placeholder={t("registration.mb")} value={newBranch.mb} onChange={(e) => handleBranchFieldChange("mb", e.target.value)} />
          <input className={styles.input} placeholder={t("registration.streetName")} value={newBranch.streetName} onChange={(e) => handleBranchFieldChange("streetName", e.target.value)} />
          <input className={styles.input} placeholder={t("registration.streetNumber")} value={newBranch.streetNumber} onChange={(e) => handleBranchFieldChange("streetNumber", e.target.value)} />
          <GeographySelects
            idPrefix="new-branch"
            className={styles.profileField}
            labelClassName={styles.infoLabel}
            selectClassName={styles.input}
            disabled={isCreatingLocation}
            value={{
              countryCode: newBranch.countryCode,
              regionCode: newBranch.regionCode,
              cityCode: newBranch.cityCode,
            }}
            onChange={(selection) =>
              setNewBranch((previous) => ({ ...previous, ...selection }))
            }
          />
          <input className={styles.input} placeholder={t("registration.postalCode")} value={newBranch.postalCode} onChange={(e) => handleBranchFieldChange("postalCode", e.target.value)} />
          <button
            type="button"
            className={`${styles.button} ${styles.buttonPrimary}`}
            disabled={isCreatingLocation}
            onClick={() => void handleCreateBranch()}
          >
            {isCreatingLocation ? t("profile.addingBranch") : t("profile.addBranchAction")}
          </button>
        </div>
      ) : null}
    </>
  );

  const renderReviewsMetrics = () => (
    <div className={styles.reviewsLayout}>
      <div className={styles.reviewsMetrics}>
        <div className={styles.metric}>
          <strong>{reviewSummary.reviewCount > 0 ? reviewSummary.averageRating.toFixed(1) : "—"}</strong>
          <span>{t("profile.employerManage.totalRating")}</span>
        </div>
        <div className={styles.metric}>
          <strong>{reviewSummary.reviewCount}</strong>
          <span>{t("profile.employerManage.totalReviews")}</span>
        </div>
        {reviewerAvatars.length > 0 ? (
          <div className={styles.avatarStack} aria-hidden>
            {reviewerAvatars.map((name, index) => (
              <span key={`${name}-${index}`} className={styles.stackAvatar}>
                {name.charAt(0).toUpperCase()}
              </span>
            ))}
            {overflowReviewCount > 0 ? <span className={styles.stackMore}>+{overflowReviewCount}</span> : null}
          </div>
        ) : null}
      </div>
      {reviewSummary.reviewCount > 0 ? (
        <Link to={reviewsPath} className={styles.outlineButton}>
          {t("profile.employerManage.viewAllReviews")}
        </Link>
      ) : (
        <p className={styles.mutedText}>{t("reviews.noReviews")}</p>
      )}
    </div>
  );

  const renderSectionAccordions = () => (
    <div className={styles.sections}>
      <ProfileAccordion
        title={t("profile.yourBranches")}
        icon={<BuildingStorefrontIcon />}
        itemCount={locations.length}
        isOpen={isBranchesOpen}
        onOpenChange={setIsBranchesOpen}
        id="employer-branches"
      >
        {renderBranchesContent()}
      </ProfileAccordion>

      <ProfileAccordion
        title={t("profile.employerManage.reviewsAboutMe")}
        icon={<StarIcon />}
        itemCount={reviewSummary.reviewCount}
        isOpen={isReviewsOpen}
        onOpenChange={setIsReviewsOpen}
      >
        {renderReviewsMetrics()}
      </ProfileAccordion>

      <ProfileAccordion
        title={t("profile.employerManage.verification")}
        icon={<ShieldCheckIcon />}
        isOpen={isVerificationOpen}
        onOpenChange={setIsVerificationOpen}
      >
        <div className={styles.profileContentInline}>
          <span className={`${styles.verifiedPill} ${user.isVerifiedEmployer ? "" : styles.notVerifiedPill}`}>
            {user.isVerifiedEmployer
              ? t("admin.verification.verifiedBadge")
              : t("admin.verification.notVerified")}
          </span>
          <span className={styles.mutedText}>
            {user.isVerifiedEmployer
              ? t("profile.employerManage.verificationVerifiedHint")
              : t("profile.employerManage.verificationNotVerifiedHint")}
          </span>
          {user.isVerifiedEmployer ? <CheckCircleIcon className={styles.verifiedCheck} aria-hidden /> : null}
        </div>
      </ProfileAccordion>

      <ProfileAccordion
        title={t("profile.employerManage.subscription")}
        icon={<SparklesIcon />}
        isOpen={isSubscriptionOpen}
        onOpenChange={setIsSubscriptionOpen}
      >
        <div className={styles.detailPanelActions}>
          <div>
            <p className={styles.mutedText}>{planLabel}</p>
            {planExpiry ? <p className={styles.mutedText}>{planExpiry}</p> : null}
          </div>
          <Link to="/billing/upgrade" className={styles.outlineButton}>
            {t("profile.employerManage.manageSubscription")}
          </Link>
        </div>
      </ProfileAccordion>

      <ProfileAccordion
        title={t("profile.employerManage.wallet")}
        icon={<WalletIcon />}
        isOpen={isWalletOpen}
        onOpenChange={setIsWalletOpen}
      >
        <div className={styles.detailPanelActions}>
          <div>
            <p className={styles.balanceBig}>{walletLabel}</p>
            <p className={styles.mutedText}>{t("profile.employerManage.availableBalance")}</p>
          </div>
          <Link to="/billing/upgrade" className={styles.outlineButton}>
            {t("profile.employerManage.topUpWallet")}
          </Link>
        </div>
      </ProfileAccordion>

      <ProfileAccordion
        title={t("profile.employerManage.accountSettings")}
        icon={<Cog6ToothIcon />}
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      >
        <p className={styles.mutedText}>{t("profile.employerManage.accountSettingsHint")}</p>
      </ProfileAccordion>
    </div>
  );

  const avatarFallbackLabel = user.name?.trim() || "?";

  return (
    <div className={`${styles.page} ${isEmployerShell ? styles.pageShell : ""}`}>
      <div className={styles.mobileShell}>
        <div className={styles.mobileTopBar}>
          <h2 className={styles.mobilePageTitle}>{t("employerShell.profileTitle")}</h2>
        </div>

        {!profileCompleteness.isComplete ? (
          <div className={styles.incompleteBannerWrap}>
            <EmployerProfileIncompleteBanner onCtaClick={handleCompleteProfileClick} />
          </div>
        ) : null}

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
          <h3 className={styles.mobileCompanyName}>
            {profileCompleteness.missing.name ? renderMissingBadge() : user.name}
          </h3>
          {renderRatingLink(styles.mobileRating)}
        </div>

        <div className={styles.groupCard}>
          <div className={styles.groupRowStatic}>
            <span className={styles.rowIconWrap}>
              <MapPinIcon className={styles.rowIcon} aria-hidden />
            </span>
            <span className={styles.rowBody}>
              <span className={styles.rowTitle}>
                {profileCompleteness.missing.address
                  ? renderMissingBadge()
                  : formatEmployerAddress(user)}
              </span>
              <span className={styles.rowSubtitle}>{t("profile.address")}</span>
            </span>
            <ChevronRightIcon className={styles.rowChevron} aria-hidden />
          </div>
          <div className={styles.groupRowStatic}>
            <span className={styles.rowIconWrap}>
              <PhoneIcon className={styles.rowIcon} aria-hidden />
            </span>
            <span className={styles.rowBody}>
              <span className={styles.rowTitle}>
                {renderFieldValue("phone", user.phoneNumber ?? "")}
              </span>
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
              <IdentificationIcon className={styles.rowIcon} aria-hidden />
            </span>
            <span className={styles.rowBody}>
              <span className={styles.rowTitle}>{renderFieldValue("pib", user.pib ?? "")}</span>
              <span className={styles.rowSubtitle}>{t("registration.pib")}</span>
            </span>
            <ChevronRightIcon className={styles.rowChevron} aria-hidden />
          </div>
          <div className={styles.groupRowStatic}>
            <span className={styles.rowIconWrap}>
              <IdentificationIcon className={styles.rowIcon} aria-hidden />
            </span>
            <span className={styles.rowBody}>
              <span className={styles.rowTitle}>{renderFieldValue("mb", user.mb ?? "")}</span>
              <span className={styles.rowSubtitle}>{t("registration.mb")}</span>
            </span>
            <ChevronRightIcon className={styles.rowChevron} aria-hidden />
          </div>
        </div>

        {isEditingProfile ? (
          <section className={styles.card}>
            {renderProfileForm()}
          </section>
        ) : null}

        {renderSectionAccordions()}
      </div>

      <div className={styles.desktopShell}>
        {!profileCompleteness.isComplete ? (
          <div className={styles.incompleteBannerWrap}>
            <EmployerProfileIncompleteBanner onCtaClick={handleCompleteProfileClick} />
          </div>
        ) : null}

        <section className={styles.card} ref={employerInfoRef}>
          <div className={styles.profileCardHeader}>
            <h2 className={styles.sectionTitle}>{t("profile.employerInfo")}</h2>
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
                  <h3 className={styles.companyName}>
                    {profileCompleteness.missing.name ? renderMissingBadge() : user.name}
                  </h3>
                  {renderRatingLink(styles.ratingLine)}
                </div>
              </div>
              {isEditingProfile ? renderProfileForm() : renderInfoTable()}
            </div>
          </div>
        </section>

        {renderSectionAccordions()}
      </div>

      {deleteConfirmBranchId ? (
        <ConfirmActionDialog
          title={t("profile.deleteBranch")}
          message={t("profile.branchDeleteConfirm")}
          confirmLabel={t("profile.confirmDeleteBranch")}
          isLoading={isDeletingLocation}
          onConfirm={() => void handleDeleteBranch()}
          onClose={() => {
            if (!isDeletingLocation) {
              setDeleteConfirmBranchId(null);
            }
          }}
        />
      ) : null}
    </div>
  );
};

export default EmployerProfile;
