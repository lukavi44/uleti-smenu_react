import { getRestaurantProfilePath } from "../../helpers/restaurantPaths";
import { getImageUrl } from "../../helpers/getHelperUrl";
import { Employee } from "../../models/User.model";
import { ChangeEvent, FormEvent, useContext, useEffect, useMemo, useState } from "react";
import { EmployeeApplication } from "../../models/Application.model";
import { CancelMyApplication, GetMyApplications } from "../../services/application-service";
import { GetEmployersWithFavouriteStatus, PatchClientFavorite, UpdateMyEmployeeProfile, UpdateMyProfilePhoto, getCurrentUser } from "../../services/user-service";
import { toast } from "react-toastify";
import styles from "./Profile.module.scss";
import ProfilePhotoUpload from "./ProfilePhotoUpload";
import CollapsibleSection from "./CollapsibleSection";
import ApplicationChatPanel from "../../components/Chat/ApplicationChatPanel";
import WorkExperienceSection from "../../components/Profile/WorkExperienceSection";
import PendingReviewsSection from "../../components/Reviews/PendingReviewsSection";
import ReceivedReviewsSection from "../../components/Reviews/ReceivedReviewsSection";
import RatingBadge from "../../components/Reviews/RatingBadge";
import { GetEmployeeReviewPage } from "../../services/review-service";
import { Review, ReviewSummary } from "../../models/Review.model";
import PlatformShiftList from "../../components/Profile/PlatformShiftList";
import { GetMyPlatformShifts } from "../../services/employee-profile-service";
import { EmployeePlatformShift } from "../../models/WorkExperience.model";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import LazyLoadSentinel from "../../components/Common/LazyLoadSentinel";
import Pagination from "../../components/Common/Pagination";
import { FAVOURITE_RESTAURANTS_PAGE_SIZE, LIST_PAGE_SIZE } from "../../constants/pagination";
import { useClientPagination } from "../../hooks/useClientPagination";
import { useLazyLoadList } from "../../hooks/useLazyLoadList";
import { AuthContext } from "../../store/Auth-context";
import { getApplicationStatusLabel } from "../../helpers/applicationStatus";

const getStatusBadgeStyle = (status: string) => {
    switch (status) {
        case "Accepted":
            return { backgroundColor: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "12px" };
        case "Denied":
            return { backgroundColor: "#fee2e2", color: "#991b1b", padding: "2px 8px", borderRadius: "12px" };
        case "Cancelled":
            return { backgroundColor: "#f3f4f6", color: "#374151", padding: "2px 8px", borderRadius: "12px" };
        default:
            return { backgroundColor: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: "12px" };
    }
};

interface EmployeeProfileProps {
    user: Employee;
}

const EmployeeProfile = ({ user }: EmployeeProfileProps) => {
    const { t } = useTranslation();
    const { refreshMe } = useContext(AuthContext);
    const [applications, setApplications] = useState<EmployeeApplication[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [applicationSortValue, setApplicationSortValue] = useState("startingDate_asc");
    const [cancelInProgressId, setCancelInProgressId] = useState<string | null>(null);
    const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>(getImageUrl(user.profilePhoto));
    const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
    const [isPhotoUploadInProgress, setIsPhotoUploadInProgress] = useState<boolean>(false);
    const [isProfileSaving, setIsProfileSaving] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber ?? "",
        city: user.city ?? user.address?.city?.name ?? "",
    });

    useEffect(() => {
        setProfileForm({
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber ?? "",
            city: user.city ?? user.address?.city?.name ?? "",
        });
    }, [user.firstName, user.lastName, user.phoneNumber, user.city, user.address?.city?.name]);

    const resetProfileForm = () => {
        setProfileForm({
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber ?? "",
            city: user.city ?? user.address?.city?.name ?? "",
        });
    };

    const handleStartProfileEdit = () => {
        resetProfileForm();
        setIsEditingProfile(true);
    };

    const handleCancelProfileEdit = () => {
        resetProfileForm();
        setIsEditingProfile(false);
    };

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

    const handleProfilePhotoError = () => {
        setProfilePhotoUrl(getImageUrl(null));
    };
    const [restaurants, setRestaurants] = useState<{ id: string; name: string; profilePhoto?: string; publicSlug?: string; isFavourite: boolean }[]>([]);
    const [favouriteActionInProgressId, setFavouriteActionInProgressId] = useState<string | null>(null);
    const [platformShifts, setPlatformShifts] = useState<EmployeePlatformShift[]>([]);
    const [receivedReviews, setReceivedReviews] = useState<Review[]>([]);
    const [reviewSummary, setReviewSummary] = useState<ReviewSummary>({ averageRating: 0, reviewCount: 0 });

    const visibleApplications = useMemo(() => {
        const filtered = applications.filter((application) =>
            statusFilter === "All" ? true : application.status === statusFilter
        );

        return [...filtered].sort((first, second) => {
            const firstTime = new Date(first.startingDate).getTime();
            const secondTime = new Date(second.startingDate).getTime();

            if (applicationSortValue === "startingDate_asc") {
                return firstTime - secondTime;
            }

            return secondTime - firstTime;
        });
    }, [applications, statusFilter, applicationSortValue]);

    const applicationsResetKey = `${statusFilter}|${applicationSortValue}`;

    const {
        visibleItems: pagedApplications,
        hasMore: hasMoreApplications,
        loadMore: loadMoreApplications,
        totalCount: applicationsTotalCount,
        visibleCount: applicationsVisibleCount,
    } = useLazyLoadList(visibleApplications, LIST_PAGE_SIZE, applicationsResetKey);

    const {
        page: favouritesPage,
        setPage: setFavouritesPage,
        totalPages: favouritesTotalPages,
        totalCount: favouritesTotalCount,
        pageSize: favouritesPageSize,
        pagedItems: pagedRestaurants,
    } = useClientPagination(restaurants, FAVOURITE_RESTAURANTS_PAGE_SIZE);

    useEffect(() => {
        const loadApplications = async () => {
            try {
                const response = await GetMyApplications();
                setApplications(response.data);
            } catch {
                toast.error(t("profile.failedLoadApplications"));
            }
        };

        loadApplications();
    }, []);

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
                            isFavourite: restaurant.isFavourite
                        }))
                );
            } catch {
                toast.error(t("profile.failedLoadFavorites"));
            }
        };

        loadRestaurants();
    }, []);

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
    }, []);

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

    const handleCancel = async (applicationId: string) => {
        setCancelInProgressId(applicationId);
        try {
            await CancelMyApplication(applicationId);
            setApplications((prev) =>
                prev.map((application) =>
                    application.applicationId === applicationId
                        ? { ...application, status: "Cancelled" }
                        : application
                )
            );
            toast.success(t("profile.cancelSuccess"));
        } catch {
            toast.error(t("profile.cancelError"));
        } finally {
            setCancelInProgressId(null);
        }
    };

    const handleProfilePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setSelectedPhotoFile(file);
    };

    const handleProfilePhotoUpload = async () => {
        if (!selectedPhotoFile) {
            toast.info(t("profile.selectPhotoFirst"));
            return;
        }

        setIsPhotoUploadInProgress(true);
        try {
            const response = await UpdateMyProfilePhoto(selectedPhotoFile);
            setProfilePhotoUrl(getImageUrl(response.data.imagePath));
            toast.success(t("profile.photoUpdated"));
            setSelectedPhotoFile(null);
            void refreshMe();
        } catch {
            toast.error(t("profile.photoUpdateError"));
        } finally {
            setIsPhotoUploadInProgress(false);
        }
    };

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

    const formatDate = (value: string) => {
        const parsedDate = new Date(value);
        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }
        return parsedDate.toLocaleString();
    };

    return (
        <div className={styles.profilePage}>
            <section className={styles.panel}>
                <div className={styles.profileHero}>
                    <div className={styles.profilePhotoColumn}>
                        <img
                            src={profilePhotoUrl}
                            alt="Profile"
                            className={styles.profileImageLarge}
                            onError={handleProfilePhotoError}
                        />
                        <ProfilePhotoUpload
                            inputId="employeeProfilePhotoInput"
                            selectedFile={selectedPhotoFile}
                            isUploading={isPhotoUploadInProgress}
                            onFileChange={handleProfilePhotoChange}
                            onUpload={handleProfilePhotoUpload}
                        />
                    </div>
                    <div className={styles.profileInfoColumn}>
                        <div className={styles.profileInfoHeader}>
                            <h2 className={styles.profileInfoTitle}>{t("profile.personalInfo")}</h2>
                            {!isEditingProfile && (
                                <button
                                    type="button"
                                    className={styles.editIconButton}
                                    aria-label={t("profile.editPersonalInfo")}
                                    title={t("profile.edit")}
                                    onClick={handleStartProfileEdit}
                                >
                                    ✎
                                </button>
                            )}
                        </div>
                        <RatingBadge
                            averageRating={reviewSummary.averageRating}
                            reviewCount={reviewSummary.reviewCount}
                            subjectType="employee"
                            subjectId={user.id}
                        />
                        <p className={styles.contactPrivacyNotice}>{t("profile.contactPrivacyNotice")}</p>
                        {isEditingProfile ? (
                            <form className={styles.profileFormGrid} onSubmit={handleProfileSave}>
                                <label className={styles.profileField}>
                                    <span className={styles.infoLabel}>{t("profile.firstName")}</span>
                                    <input
                                        className={styles.input}
                                        value={profileForm.firstName}
                                        onChange={(event) =>
                                            setProfileForm((previous) => ({ ...previous, firstName: event.target.value }))
                                        }
                                    />
                                </label>
                                <label className={styles.profileField}>
                                    <span className={styles.infoLabel}>{t("profile.lastName")}</span>
                                    <input
                                        className={styles.input}
                                        value={profileForm.lastName}
                                        onChange={(event) =>
                                            setProfileForm((previous) => ({ ...previous, lastName: event.target.value }))
                                        }
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
                                        onChange={(event) =>
                                            setProfileForm((previous) => ({ ...previous, phoneNumber: event.target.value }))
                                        }
                                    />
                                </label>
                                <label className={styles.profileField}>
                                    <span className={styles.infoLabel}>{t("profile.city")}</span>
                                    <input
                                        className={styles.input}
                                        value={profileForm.city}
                                        onChange={(event) =>
                                            setProfileForm((previous) => ({ ...previous, city: event.target.value }))
                                        }
                                    />
                                </label>
                                <div className={styles.profileEditActions}>
                                    <button
                                        type="submit"
                                        className={`${styles.button} ${styles.buttonPrimary}`}
                                        disabled={isProfileSaving}
                                    >
                                        {isProfileSaving ? t("common.loading") : t("profile.saveChanges")}
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.button} ${styles.buttonSecondary}`}
                                        onClick={handleCancelProfileEdit}
                                        disabled={isProfileSaving}
                                    >
                                        {t("common.cancel")}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className={styles.infoGrid}>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>{t("profile.firstName")}</span>
                                    <span className={styles.infoValue}>{user.firstName || "-"}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>{t("profile.lastName")}</span>
                                    <span className={styles.infoValue}>{user.lastName || "-"}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>{t("profile.email")}</span>
                                    <span className={styles.infoValue}>{user.email}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>{t("profile.phone")}</span>
                                    <span className={styles.infoValue}>{user.phoneNumber?.trim() || "-"}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>{t("profile.city")}</span>
                                    <span className={styles.infoValue}>
                                        {user.city?.trim() || user.address?.city?.name?.trim() || "-"}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <CollapsibleSection title={t("reviews.pendingTitle")}>
                <PendingReviewsSection />
            </CollapsibleSection>

            <CollapsibleSection title={t("reviews.receivedTitle")}>
                <ReceivedReviewsSection reviews={receivedReviews} reviewSummary={reviewSummary} />
            </CollapsibleSection>

            <CollapsibleSection title={t("employeeProfile.workExperience")}>
                <WorkExperienceSection />
            </CollapsibleSection>

            <CollapsibleSection title={t("employeeProfile.platformHistory")}>
                <PlatformShiftList shifts={platformShifts} />
            </CollapsibleSection>

            <CollapsibleSection title={t("profile.favouriteRestaurants")}>
                {restaurants.length === 0 && <p className={styles.mutedText}>{t("profile.noFavouriteRestaurants")}</p>}
                <div className={styles.branchList}>
                    {pagedRestaurants.map((restaurant) => (
                        <article key={restaurant.id} className={styles.branchCard}>
                            <div className={styles.restaurantRow}>
                                <Link to={getRestaurantProfilePath(restaurant)}>
                                    <img
                                        src={getImageUrl(restaurant.profilePhoto)}
                                        alt={restaurant.name}
                                        className={styles.restaurantLogo}
                                    />
                                </Link>
                                <div>
                                    <Link to={getRestaurantProfilePath(restaurant)} className={styles.restaurantNameLink}>
                                        <strong>{restaurant.name}</strong>
                                    </Link>
                                    <p className={styles.mutedText}>{t("profile.favourite")}</p>
                                </div>
                                <button
                                    type="button"
                                    className={`${styles.button} ${styles.buttonSecondary} ${styles.favouriteRemoveButton}`}
                                    disabled={favouriteActionInProgressId !== null}
                                    onClick={() => handleUnfavourite(restaurant.id)}
                                >
                                    {favouriteActionInProgressId === restaurant.id ? t("profile.removing") : t("profile.remove")}
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
            </CollapsibleSection>

            <CollapsibleSection title={t("profile.myApplications")}>
                <div className={styles.applicantsFilters}>
                    <div className={styles.filterGroup}>
                        <label htmlFor="myApplicationStatusFilter">{t("profile.filterByStatus")}</label>
                        <select
                            className={styles.select}
                            id="myApplicationStatusFilter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">{t("profile.applicationFilter.all")}</option>
                            <option value="Applied">{t("profile.applicationFilter.applied")}</option>
                            <option value="Accepted">{t("profile.applicationFilter.accepted")}</option>
                            <option value="Denied">{t("profile.applicationFilter.denied")}</option>
                            <option value="Cancelled">{t("profile.applicationFilter.cancelled")}</option>
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label htmlFor="myApplicationSortFilter">{t("profile.sortJobPosts")}</label>
                        <select
                            className={styles.select}
                            id="myApplicationSortFilter"
                            value={applicationSortValue}
                            onChange={(event) => setApplicationSortValue(event.target.value)}
                        >
                            <option value="startingDate_asc">{t("profile.sortDateOldest")}</option>
                            <option value="startingDate_desc">{t("profile.sortDateNewest")}</option>
                        </select>
                    </div>
                </div>

                {visibleApplications.length === 0 && <p className={styles.mutedText}>{t("profile.noApplications")}</p>}

                <div className={styles.jobPostsGrid}>
                    {pagedApplications.map((application) => (
                        <article key={application.applicationId} className={styles.jobPostCard}>
                            <h4>{application.jobPostTitle}</h4>
                            <div className={styles.cardMeta}>
                                <div><span>{t("home.position")}:</span><strong>{application.position}</strong></div>
                                <div><span>{t("profile.restaurantName")}:</span><strong>{application.employerName}</strong></div>
                                <div>
                                    <span>{t("profile.location")}:</span>
                                    <strong>
                                        {application.restaurantLocationName
                                            ? `${application.restaurantLocationName}${application.restaurantLocationCity ? ` (${application.restaurantLocationCity})` : ""}`
                                            : "-"}
                                    </strong>
                                </div>
                                <div><span>{t("profile.startingDate")}:</span><strong>{formatDate(application.startingDate)}</strong></div>
                                <div><span>{t("profile.salary")}:</span><strong>{application.salary} RSD</strong></div>
                                <div>
                                    <span>{t("profile.status")}:</span>
                                    <strong>
                                        <span style={getStatusBadgeStyle(application.status)}>
                                            {getApplicationStatusLabel(application.status, t)}
                                        </span>
                                    </strong>
                                </div>
                            </div>
                            {application.status === "Applied" && (
                                <div className={styles.actionsRow}>
                                    <button
                                        className={`${styles.button} ${styles.buttonSecondary}`}
                                        disabled={cancelInProgressId !== null}
                                        onClick={() => handleCancel(application.applicationId)}
                                    >
                                        {cancelInProgressId === application.applicationId ? t("profile.cancelling") : t("profile.cancelApplication")}
                                    </button>
                                </div>
                            )}
                            <ApplicationChatPanel
                                applicationId={application.applicationId}
                                enabled={application.status === "Accepted"}
                            />
                        </article>
                    ))}
                </div>
                <LazyLoadSentinel
                    hasMore={hasMoreApplications}
                    onLoadMore={loadMoreApplications}
                    visibleCount={applicationsVisibleCount}
                    totalCount={applicationsTotalCount}
                />
            </CollapsibleSection>
        </div>
    );
};

export default EmployeeProfile;