import { getImageUrl } from "../../helpers/getHelperUrl";
import { Employee } from "../../models/User.model";
import { ChangeEvent, useEffect, useState } from "react";
import { EmployeeApplication } from "../../models/Application.model";
import { CancelMyApplication, GetMyApplications } from "../../services/application-service";
import { GetEmployersWithFavouriteStatus, PatchClientFavorite, UpdateMyProfilePhoto } from "../../services/user-service";
import { toast } from "react-toastify";
import styles from "./Profile.module.scss";
import ProfilePhotoUpload from "./ProfilePhotoUpload";
import { useTranslation } from "react-i18next";

interface EmployeeProfileProps {
    user: Employee;
}

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

const EmployeeProfile = ({ user }: EmployeeProfileProps) => {
    const { t } = useTranslation();
    const [applications, setApplications] = useState<EmployeeApplication[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [cancelInProgressId, setCancelInProgressId] = useState<string | null>(null);
    const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>(getImageUrl(user.profilePhoto));
    const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
    const [isPhotoUploadInProgress, setIsPhotoUploadInProgress] = useState<boolean>(false);
    const [restaurants, setRestaurants] = useState<{ id: string; name: string; profilePhoto?: string; isFavourite: boolean }[]>([]);
    const [favouriteActionInProgressId, setFavouriteActionInProgressId] = useState<string | null>(null);

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
                            isFavourite: restaurant.isFavourite
                        }))
                );
            } catch {
                toast.error(t("profile.failedLoadFavorites"));
            }
        };

        loadRestaurants();
    }, []);

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

    const visibleApplications = applications.filter((application) =>
        statusFilter === "All" ? true : application.status === statusFilter
    );

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
        } catch {
            toast.error(t("profile.photoUpdateError"));
        } finally {
            setIsPhotoUploadInProgress(false);
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
                <div className={styles.profileHeader}>
                    <img src={profilePhotoUrl} alt="Profile" className={styles.profileImage} />
                    <ProfilePhotoUpload
                        inputId="employeeProfilePhotoInput"
                        selectedFile={selectedPhotoFile}
                        isUploading={isPhotoUploadInProgress}
                        onFileChange={handleProfilePhotoChange}
                        onUpload={handleProfilePhotoUpload}
                    />
                </div>
            </section>

            <section className={styles.panel}>
                <h2 className={styles.sectionTitle}>{t("profile.employeeInfo")}</h2>
                <div className={styles.infoGrid}>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>{t("profile.fullName")}</span>
                        <span className={styles.infoValue}>{user.firstName} {user.lastName}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>{t("profile.email")}</span>
                        <span className={styles.infoValue}>{user.email}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>{t("profile.phone")}</span>
                        <span className={styles.infoValue}>{user.phoneNumber ?? "-"}</span>
                    </div>
                </div>
            </section>

            <section className={styles.panel}>
                <h2 className={styles.sectionTitle}>{t("profile.favouriteRestaurants")}</h2>
                {restaurants.length === 0 && <p className={styles.mutedText}>{t("profile.noFavouriteRestaurants")}</p>}
                <div className={styles.branchList}>
                    {restaurants.map((restaurant) => (
                        <article key={restaurant.id} className={styles.branchCard}>
                            <div className={styles.restaurantRow}>
                                <img
                                    src={getImageUrl(restaurant.profilePhoto)}
                                    alt={restaurant.name}
                                    className={styles.restaurantLogo}
                                />
                                <div>
                                    <strong>{restaurant.name}</strong>
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
            </section>

            <section className={styles.panel}>
                <h2 className={styles.sectionTitle}>{t("profile.myApplications")}</h2>
                <div className={styles.applicantsFilters}>
                    <div className={styles.filterGroup}>
                        <label htmlFor="myApplicationStatusFilter">{t("profile.filterByStatus")}</label>
                        <select
                            className={styles.select}
                            id="myApplicationStatusFilter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">{t("profile.all")}</option>
                            <option value="Applied">{t("jobPosts.appliedShort")}</option>
                            <option value="Accepted">{t("profile.accept")}</option>
                            <option value="Denied">{t("profile.deny")}</option>
                            <option value="Cancelled">{t("common.cancel")}</option>
                        </select>
                    </div>
                </div>

                {visibleApplications.length === 0 && <p className={styles.mutedText}>{t("profile.noApplications")}</p>}

                <div className={styles.jobPostsGrid}>
                    {visibleApplications.map((application) => (
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
                                        <span style={getStatusBadgeStyle(application.status)}>{application.status}</span>
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
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default EmployeeProfile;