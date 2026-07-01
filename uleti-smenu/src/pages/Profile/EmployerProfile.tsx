import { ChangeEvent, FormEvent, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  CameraIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  EnvelopeIcon,
  IdentificationIcon,
  MapPinIcon,
  PencilSquareIcon,
  PhoneIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  WalletIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { getImageUrl } from "../../helpers/getHelperUrl";
import { Employer } from "../../models/User.model";
import { RestaurantLocation } from "../../models/RestaurantLocation.model";
import { ReviewSummary } from "../../models/Review.model";
import { UpdateMyEmployerProfile, UpdateMyProfilePhoto, getCurrentUser } from "../../services/user-service";
import { CreateMyRestaurantLocation, GetMyRestaurantLocations } from "../../services/restaurantLocation-service";
import { GetEmployerReviewPage } from "../../services/review-service";
import { AuthContext } from "../../store/Auth-context";
import { useIsEmployerShell } from "../../hooks/useIsEmployerShell";
import styles from "./EmployerProfile.module.scss";

interface EmployerProfileProps {
  user: Employer;
}

type MobilePanel = "branches" | "reviews" | "verification" | "subscription" | "wallet" | "settings" | null;

const buildEmployerProfileForm = (user: Employer) => ({
  name: user.name ?? "",
  phoneNumber: user.phoneNumber ?? "",
  streetName: user.address?.street?.name ?? "",
  streetNumber: user.address?.street?.number ? String(user.address.street.number) : "",
  city: user.address?.city?.name ?? "",
  postalCode: user.address?.city?.postalCode ? String(user.address.city.postalCode) : "",
  country: user.address?.city?.country ?? "",
  region: user.address?.city?.region ?? "",
});

const formatEmployerAddress = (user: Employer) => {
  const form = buildEmployerProfileForm(user);
  if (!form.streetName && !form.city) {
    return "—";
  }
  return `${form.streetName} ${form.streetNumber}, ${form.city}`.trim();
};

const SectionHeader = ({
  icon,
  title,
  action,
}: {
  icon: ReactNode;
  title: string;
  action?: ReactNode;
}) => (
  <div className={styles.sectionHeader}>
    <div className={styles.sectionHeaderLeft}>
      <span className={styles.sectionIcon}>{icon}</span>
      <h2 className={styles.sectionTitle}>{title}</h2>
    </div>
    {action}
  </div>
);

const ProfileSectionRow = ({
  icon,
  title,
  content,
  action,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  content: ReactNode;
  action?: ReactNode;
  onClick?: () => void;
}) => (
  <div
    className={`${styles.profileSectionRow} ${onClick ? styles.profileSectionRowInteractive : ""}`}
    onClick={onClick}
    onKeyDown={
      onClick
        ? (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onClick();
            }
          }
        : undefined
    }
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
  >
    <div className={styles.profileSectionHeader}>
      <span className={styles.sectionIcon}>{icon}</span>
      <h2 className={styles.profileSectionTitle}>{title}</h2>
    </div>
    <div className={styles.profileSectionDivider} aria-hidden />
    <div className={styles.profileSectionContent}>{content}</div>
    <div className={styles.profileSectionAction} onClick={(event) => event.stopPropagation()}>
      {action}
    </div>
    <ChevronRightIcon className={styles.profileSectionChevron} aria-hidden />
  </div>
);

const EmployerProfile = ({ user }: EmployerProfileProps) => {
  const { t } = useTranslation();
  const { refreshMe } = useContext(AuthContext);
  const isEmployerShell = useIsEmployerShell();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const mobilePhotoInputRef = useRef<HTMLInputElement>(null);

  const [profilePhotoUrl, setProfilePhotoUrl] = useState(getImageUrl(user.profilePhoto));
  const [isPhotoUploadInProgress, setIsPhotoUploadInProgress] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(() => buildEmployerProfileForm(user));
  const [locations, setLocations] = useState<RestaurantLocation[]>([]);
  const [isCreatingLocation, setIsCreatingLocation] = useState(false);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary>({ averageRating: 0, reviewCount: 0 });
  const [reviewerAvatars, setReviewerAvatars] = useState<string[]>([]);
  const [detailPanel, setDetailPanel] = useState<MobilePanel>(null);
  const [newBranch, setNewBranch] = useState({
    name: "",
    phoneNumber: "",
    pib: user.pib ?? "",
    mb: user.mb ?? "",
    streetName: "",
    streetNumber: "",
    city: "",
    postalCode: "",
    country: "",
    region: "",
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
          date: new Date(subscription.subscriptionStop).toLocaleDateString(),
        })
      : null;
  const walletLabel = `${walletBalance.toLocaleString()} RSD`;
  const branchNamesSummary = useMemo(() => {
    if (locations.length === 0) {
      return t("profile.noBranches");
    }
    return locations.map((location) => location.name).join(" • ");
  }, [locations, t]);
  const verificationInlineSummary = user.isVerifiedEmployer
    ? t("profile.employerManage.verificationVerifiedHint")
    : t("profile.employerManage.verificationNotVerifiedHint");
  const subscriptionInlineSummary = planExpiry ? `${planLabel} · ${planExpiry}` : planLabel;
  const walletInlineSummary = `${walletLabel} · ${t("profile.employerManage.availableBalance")}`;
  const overflowReviewCount = Math.max(0, reviewSummary.reviewCount - reviewerAvatars.length);

  const ratingQualityLabel = useMemo(() => {
    if (reviewSummary.reviewCount <= 0) {
      return null;
    }
    if (reviewSummary.averageRating >= 4.5) {
      return t("profile.employerManage.ratingExcellent");
    }
    if (reviewSummary.averageRating >= 4) {
      return t("profile.employerManage.ratingVeryGood");
    }
    if (reviewSummary.averageRating >= 3) {
      return t("profile.employerManage.ratingGood");
    }
    return null;
  }, [reviewSummary.averageRating, reviewSummary.reviewCount, t]);

  const ratingDisplay =
    reviewSummary.reviewCount > 0 ? (
      <p className={styles.ratingLine}>
        <strong>★ {reviewSummary.averageRating.toFixed(1)}</strong> ({reviewSummary.reviewCount})
        {ratingQualityLabel ? <span className={styles.ratingWord}> {ratingQualityLabel}</span> : null}
      </p>
    ) : null;

  useEffect(() => {
    setProfileForm(buildEmployerProfileForm(user));
  }, [
    user.name,
    user.phoneNumber,
    user.address?.street?.name,
    user.address?.street?.number,
    user.address?.city?.name,
    user.address?.city?.postalCode,
    user.address?.city?.country,
    user.address?.city?.region,
  ]);

  useEffect(() => {
    setProfilePhotoUrl(getImageUrl(user.profilePhoto));
  }, [user.profilePhoto]);

  useEffect(() => {
    const syncProfilePhoto = async () => {
      try {
        const response = await getCurrentUser();
        const photo = "profilePhoto" in response.data ? response.data.profilePhoto : undefined;
        setProfilePhotoUrl(getImageUrl(photo));
      } catch {
        setProfilePhotoUrl(getImageUrl(user.profilePhoto));
      }
    };

    void syncProfilePhoto();
  }, [user.id, user.profilePhoto]);

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

  const uploadPhoto = async (file: File | null) => {
    if (!file) {
      return;
    }

    setIsPhotoUploadInProgress(true);
    try {
      const response = await UpdateMyProfilePhoto(file);
      setProfilePhotoUrl(getImageUrl(response.data.imagePath));
      toast.success(t("profile.photoUpdated"));
      void refreshMe();
    } catch {
      toast.error(t("profile.photoUpdateError"));
    } finally {
      setIsPhotoUploadInProgress(false);
    }
  };

  const handlePhotoSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    await uploadPhoto(file);
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
        streetName: profileForm.streetName.trim(),
        streetNumber: profileForm.streetNumber.trim(),
        city: profileForm.city.trim(),
        postalCode: profileForm.postalCode.trim(),
        country: profileForm.country.trim(),
        region: profileForm.region.trim(),
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
        city: "",
        postalCode: "",
        country: "",
        region: "",
      });
      setShowBranchForm(false);
      toast.success(t("profile.branchAdded"));
    } catch {
      toast.error(t("profile.branchAddError"));
    } finally {
      setIsCreatingLocation(false);
    }
  };

  const renderAvatar = (className: string, fallbackClassName: string) =>
    profilePhotoUrl ? (
      <img
        src={profilePhotoUrl}
        alt=""
        className={className}
        onError={() => setProfilePhotoUrl(getImageUrl(null))}
      />
    ) : (
      <span className={`${className} ${fallbackClassName}`}>{user.name.charAt(0).toUpperCase()}</span>
    );

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
        <input className={`${styles.input} ${styles.readOnlyInput}`} value={user.pib} readOnly />
      </label>
      <label className={styles.profileField}>
        <span className={styles.infoLabel}>{t("registration.mb")}</span>
        <input className={`${styles.input} ${styles.readOnlyInput}`} value={user.mb} readOnly />
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
      <label className={styles.profileField}>
        <span className={styles.infoLabel}>{t("registration.city")}</span>
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
        <span className={styles.infoValue}>{user.name}</span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>{t("profile.address")}</span>
        <span className={styles.infoValue}>{formatEmployerAddress(user)}</span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>{t("profile.phone")}</span>
        <span className={styles.infoValue}>{user.phoneNumber ?? "—"}</span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>{t("profile.email")}</span>
        <span className={styles.infoValue}>{user.email}</span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>{t("registration.pib")}</span>
        <span className={styles.infoValue}>{user.pib}</span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>{t("registration.mb")}</span>
        <span className={styles.infoValue}>{user.mb}</span>
      </div>
    </div>
  );

  const renderBranchesContent = () => (
    <>
      <p className={styles.legalNotice}>{t("profile.branchLegalEntityHint")}</p>
      {locations.length === 0 ? <p className={styles.mutedText}>{t("profile.noBranches")}</p> : null}
      <div className={styles.branchGrid}>
        {locations.map((location) => (
          <article key={location.id} className={styles.branchCard}>
            <div className={styles.branchCardTop}>
              <h3 className={styles.branchName}>{location.name}</h3>
              <button type="button" className={styles.branchMenuButton} aria-label={t("admin.nav.more")}>
                <EllipsisVerticalIcon width={18} height={18} />
              </button>
            </div>
            <p className={styles.branchLine}>
              {location.streetName} {location.streetNumber}, {location.city}
            </p>
            <p className={styles.branchLine}>{location.phoneNumber}</p>
            <p className={styles.branchLine}>
              {t("registration.pib")}: {location.pib} · {t("registration.mb")}: {location.mb}
            </p>
          </article>
        ))}
      </div>
      {showBranchForm ? (
        <div className={styles.branchForm}>
          <input className={styles.input} placeholder={t("profile.restaurantName")} value={newBranch.name} onChange={(e) => handleBranchFieldChange("name", e.target.value)} />
          <input className={styles.input} placeholder={t("registration.phoneNumber")} value={newBranch.phoneNumber} onChange={(e) => handleBranchFieldChange("phoneNumber", e.target.value)} />
          <input className={styles.input} placeholder={t("registration.pib")} value={newBranch.pib} onChange={(e) => handleBranchFieldChange("pib", e.target.value)} />
          <input className={styles.input} placeholder={t("registration.mb")} value={newBranch.mb} onChange={(e) => handleBranchFieldChange("mb", e.target.value)} />
          <input className={styles.input} placeholder={t("registration.streetName")} value={newBranch.streetName} onChange={(e) => handleBranchFieldChange("streetName", e.target.value)} />
          <input className={styles.input} placeholder={t("registration.streetNumber")} value={newBranch.streetNumber} onChange={(e) => handleBranchFieldChange("streetNumber", e.target.value)} />
          <input className={styles.input} placeholder={t("registration.city")} value={newBranch.city} onChange={(e) => handleBranchFieldChange("city", e.target.value)} />
          <input className={styles.input} placeholder={t("registration.postalCode")} value={newBranch.postalCode} onChange={(e) => handleBranchFieldChange("postalCode", e.target.value)} />
          <input className={styles.input} placeholder={t("registration.country")} value={newBranch.country} onChange={(e) => handleBranchFieldChange("country", e.target.value)} />
          <input className={styles.input} placeholder={t("registration.region")} value={newBranch.region} onChange={(e) => handleBranchFieldChange("region", e.target.value)} />
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
    <>
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
          {overflowReviewCount > 0 ? (
            <span className={styles.stackMore}>+{overflowReviewCount}</span>
          ) : null}
        </div>
      ) : null}
    </>
  );

  const renderManageSectionCards = () => (
    <>
      <section className={`${styles.card} ${styles.cardCompact}`}>
        <ProfileSectionRow
          icon={<BuildingStorefrontIcon className={styles.sectionIconSvg} />}
          title={t("profile.yourBranches")}
          content={<p className={styles.profileContentText}>{branchNamesSummary}</p>}
          action={
            <button type="button" className={styles.outlineButton} onClick={() => setDetailPanel("branches")}>
              {t("profile.employerManage.manageBranches")}
            </button>
          }
          onClick={() => setDetailPanel("branches")}
        />
      </section>

      <section className={`${styles.card} ${styles.cardCompact}`}>
        <ProfileSectionRow
          icon={<StarIcon className={styles.sectionIconSvg} />}
          title={t("profile.employerManage.reviewsAboutMe")}
          content={
            <div className={styles.reviewsSectionContent}>
              <div className={styles.metric}>
                <strong>{reviewSummary.reviewCount > 0 ? reviewSummary.averageRating.toFixed(1) : "—"}</strong>
                <span>{t("profile.employerManage.totalRating")}</span>
              </div>
              <div className={styles.reviewsMetricDivider} aria-hidden />
              <div className={styles.reviewsCountGroup}>
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
                    {overflowReviewCount > 0 ? (
                      <span className={styles.stackMore}>+{overflowReviewCount}</span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          }
          action={
            <Link to={reviewsPath} className={styles.outlineButton}>
              {t("profile.employerManage.viewAllReviews")}
            </Link>
          }
          onClick={() => setDetailPanel("reviews")}
        />
      </section>

      <section className={`${styles.card} ${styles.cardCompact}`}>
        <ProfileSectionRow
          icon={<ShieldCheckIcon className={styles.sectionIconSvg} />}
          title={t("profile.employerManage.verification")}
          content={
            <div className={styles.profileContentInline}>
              <span
                className={`${styles.verifiedPill} ${user.isVerifiedEmployer ? "" : styles.notVerifiedPill}`}
              >
                {user.isVerifiedEmployer
                  ? t("admin.verification.verifiedBadge")
                  : t("admin.verification.notVerified")}
              </span>
              <span className={styles.profileContentTextMuted}>{verificationInlineSummary}</span>
              {user.isVerifiedEmployer ? (
                <CheckCircleIcon className={styles.verifiedCheck} aria-hidden />
              ) : null}
            </div>
          }
          onClick={() => setDetailPanel("verification")}
        />
      </section>

      <section className={`${styles.card} ${styles.cardCompact}`}>
        <ProfileSectionRow
          icon={<SparklesIcon className={styles.sectionIconSvg} />}
          title={t("profile.employerManage.subscription")}
          content={<p className={styles.profileContentText}>{subscriptionInlineSummary}</p>}
          action={
            <Link to="/billing/upgrade" className={styles.outlineButton}>
              {t("profile.employerManage.manageSubscription")}
            </Link>
          }
          onClick={() => setDetailPanel("subscription")}
        />
      </section>

      <section className={`${styles.card} ${styles.cardCompact}`}>
        <ProfileSectionRow
          icon={<WalletIcon className={styles.sectionIconSvg} />}
          title={t("profile.employerManage.wallet")}
          content={<p className={styles.profileContentText}>{walletInlineSummary}</p>}
          action={
            <Link to="/billing/upgrade" className={styles.outlineButton}>
              {t("profile.employerManage.topUpWallet")}
            </Link>
          }
          onClick={() => setDetailPanel("wallet")}
        />
      </section>

      <section className={`${styles.card} ${styles.cardCompact}`}>
        <ProfileSectionRow
          icon={<Cog6ToothIcon className={styles.sectionIconSvg} />}
          title={t("profile.employerManage.accountSettings")}
          content={
            <p className={styles.profileContentTextMuted}>{t("profile.employerManage.accountSettingsHint")}</p>
          }
          onClick={() => setDetailPanel("settings")}
        />
      </section>
    </>
  );

  const detailPanelTitle: Record<Exclude<MobilePanel, null>, string> = {
    branches: t("profile.yourBranches"),
    reviews: t("profile.employerManage.reviewsAboutMe"),
    verification: t("profile.employerManage.verification"),
    subscription: t("profile.employerManage.subscription"),
    wallet: t("profile.employerManage.wallet"),
    settings: t("profile.employerManage.accountSettings"),
  };

  const renderDetailPanelIcon = (panel: Exclude<MobilePanel, null>) => {
    switch (panel) {
      case "branches":
        return <BuildingStorefrontIcon className={styles.sectionIconSvg} />;
      case "reviews":
        return <StarIcon className={styles.sectionIconSvg} />;
      case "verification":
        return <ShieldCheckIcon className={styles.sectionIconSvg} />;
      case "subscription":
        return <SparklesIcon className={styles.sectionIconSvg} />;
      case "wallet":
        return <WalletIcon className={styles.sectionIconSvg} />;
      default:
        return <Cog6ToothIcon className={styles.sectionIconSvg} />;
    }
  };

  const renderDetailPanelBody = (panel: Exclude<MobilePanel, null>) => {
    switch (panel) {
      case "branches":
        return renderBranchesContent();
      case "reviews":
        return (
          <div className={styles.reviewsLayout}>
            <div className={styles.reviewsMetrics}>{renderReviewsMetrics()}</div>
            <Link to={reviewsPath} className={styles.reviewsLink}>
              {t("profile.employerManage.viewAllReviews")} →
            </Link>
          </div>
        );
      case "verification":
        return (
          <div className={styles.profileContentInline}>
            <span
              className={`${styles.verifiedPill} ${user.isVerifiedEmployer ? "" : styles.notVerifiedPill}`}
            >
              {user.isVerifiedEmployer
                ? t("admin.verification.verifiedBadge")
                : t("admin.verification.notVerified")}
            </span>
            <p className={styles.profileContentTextMuted}>
              {user.isVerifiedEmployer
                ? t("profile.employerManage.verificationVerifiedHint")
                : t("profile.employerManage.verificationNotVerifiedHint")}
            </p>
          </div>
        );
      case "subscription":
        return (
          <div className={styles.detailPanelActions}>
            <div>
              <p className={styles.profileContentText}>{planLabel}</p>
              {planExpiry ? <p className={styles.profileContentTextMuted}>{planExpiry}</p> : null}
            </div>
            <Link to="/billing/upgrade" className={styles.outlineButton}>
              {t("profile.employerManage.manageSubscription")}
            </Link>
          </div>
        );
      case "wallet":
        return (
          <div className={styles.detailPanelActions}>
            <div>
              <p className={styles.profileContentText}>{walletLabel}</p>
              <p className={styles.profileContentTextMuted}>{t("profile.employerManage.availableBalance")}</p>
            </div>
            <Link to="/billing/upgrade" className={styles.outlineButton}>
              {t("profile.employerManage.topUpWallet")}
            </Link>
          </div>
        );
      case "settings":
        return <p className={styles.profileContentTextMuted}>{t("profile.employerManage.accountSettingsHint")}</p>;
      default:
        return null;
    }
  };

  const renderDetailPanel = () => {
    if (!detailPanel) {
      return null;
    }

    return (
      <div className={styles.detailPanel}>
        <button type="button" className={styles.detailPanelBack} onClick={() => setDetailPanel(null)}>
          <ArrowLeftIcon width={16} height={16} aria-hidden />
          {t("employeeProfile.back")}
        </button>
        <section className={styles.card}>
          <SectionHeader
            icon={renderDetailPanelIcon(detailPanel)}
            title={detailPanelTitle[detailPanel]}
            action={
              detailPanel === "branches" ? (
                <button type="button" className={styles.linkAction} onClick={() => setShowBranchForm((open) => !open)}>
                  + {t("profile.addBranchAction")}
                </button>
              ) : undefined
            }
          />
          {renderDetailPanelBody(detailPanel)}
        </section>
      </div>
    );
  };

  return (
    <div className={`${styles.page} ${isEmployerShell ? styles.pageShell : ""}`}>
      <div className={styles.mobileShell}>
        {detailPanel ? (
          renderDetailPanel()
        ) : (
          <>
            <div className={styles.mobileTopBar}>
              <h2 className={styles.mobilePageTitle}>{t("employerShell.profileTitle")}</h2>
              <button
                type="button"
                className={styles.iconGhostButton}
                aria-label={t("profile.employerManage.accountSettings")}
                onClick={() => setDetailPanel("settings")}
              >
                <Cog6ToothIcon width={18} height={18} />
              </button>
            </div>

            <div className={styles.mobileProfileBlock}>
              <div className={styles.mobileAvatarWrap}>
                {renderAvatar(styles.mobileAvatar, styles.mobileAvatarFallback)}
                <button
                  type="button"
                  className={styles.mobileCameraBadge}
                  aria-label={t("profile.selectPhoto")}
                  disabled={isPhotoUploadInProgress}
                  onClick={() => mobilePhotoInputRef.current?.click()}
                >
                  <CameraIcon width={14} height={14} />
                </button>
                <input
                  ref={mobilePhotoInputRef}
                  className={styles.hiddenFileInput}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                />
              </div>
              <h3 className={styles.mobileCompanyName}>{user.name}</h3>
              {reviewSummary.reviewCount > 0 ? (
                <p className={styles.mobileRating}>
                  <strong>★ {reviewSummary.averageRating.toFixed(1)}</strong> ({reviewSummary.reviewCount})
                  {ratingQualityLabel ? ` ${ratingQualityLabel}` : ""}
                </p>
              ) : null}
            </div>

            <div className={styles.groupCard}>
              <div className={styles.groupRowStatic}>
                <span className={styles.rowIconWrap}>
                  <MapPinIcon className={styles.rowIcon} aria-hidden />
                </span>
                <span className={styles.rowBody}>
                  <span className={styles.rowTitle}>{formatEmployerAddress(user)}</span>
                  <span className={styles.rowSubtitle}>{t("profile.address")}</span>
                </span>
                <ChevronRightIcon className={styles.rowChevron} aria-hidden />
              </div>
              <div className={styles.groupRowStatic}>
                <span className={styles.rowIconWrap}>
                  <PhoneIcon className={styles.rowIcon} aria-hidden />
                </span>
                <span className={styles.rowBody}>
                  <span className={styles.rowTitle}>{user.phoneNumber ?? "—"}</span>
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
                  <span className={styles.rowTitle}>{user.pib}</span>
                  <span className={styles.rowSubtitle}>{t("registration.pib")}</span>
                </span>
                <ChevronRightIcon className={styles.rowChevron} aria-hidden />
              </div>
              <div className={styles.groupRowStatic}>
                <span className={styles.rowIconWrap}>
                  <IdentificationIcon className={styles.rowIcon} aria-hidden />
                </span>
                <span className={styles.rowBody}>
                  <span className={styles.rowTitle}>{user.mb}</span>
                  <span className={styles.rowSubtitle}>{t("registration.mb")}</span>
                </span>
                <ChevronRightIcon className={styles.rowChevron} aria-hidden />
              </div>
            </div>

            {renderManageSectionCards()}
          </>
        )}
      </div>

      <div className={styles.desktopShell}>
        <section className={styles.card}>
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
              {renderAvatar(styles.profileImage, styles.avatarFallback)}
              <input
                ref={photoInputRef}
                className={styles.hiddenFileInput}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
              />
              <button
                type="button"
                className={styles.photoPickerButton}
                disabled={isPhotoUploadInProgress}
                onClick={() => photoInputRef.current?.click()}
              >
                {isPhotoUploadInProgress ? t("profile.uploading") : t("profile.selectPhoto")}
              </button>
              <p className={styles.photoHint}>{t("profile.employerManage.photoHint")}</p>
            </div>
            <div>
              <div className={styles.companyHeader}>
                <div>
                  <h3 className={styles.companyName}>{user.name}</h3>
                  {ratingDisplay}
                </div>
              </div>
              {isEditingProfile ? renderProfileForm() : renderInfoTable()}
            </div>
          </div>
        </section>

        {detailPanel ? renderDetailPanel() : renderManageSectionCards()}
      </div>
    </div>
  );
};

export default EmployerProfile;
