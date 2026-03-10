import { getImageUrl } from "../../helpers/getHelperUrl";
import { Employee } from "../../models/User.model";
import { ChangeEvent, useEffect, useState } from "react";
import { EmployeeApplication } from "../../models/Application.model";
import { CancelMyApplication, GetMyApplications } from "../../services/application-service";
import { GetEmployersWithFavouriteStatus, UpdateMyProfilePhoto } from "../../services/user-service";
import { toast } from "react-toastify";
import styles from "./Profile.module.scss";

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
    const [applications, setApplications] = useState<EmployeeApplication[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [restaurantFilter, setRestaurantFilter] = useState<"all" | "favourites">("favourites");
    const [cancelInProgressId, setCancelInProgressId] = useState<string | null>(null);
    const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>(getImageUrl(user.profilePhoto));
    const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
    const [isPhotoUploadInProgress, setIsPhotoUploadInProgress] = useState<boolean>(false);
    const [restaurants, setRestaurants] = useState<{ id: string; name: string; profilePhoto?: string; isFavourite: boolean }[]>([]);

    useEffect(() => {
        const loadApplications = async () => {
            try {
                const response = await GetMyApplications();
                setApplications(response.data);
            } catch {
                toast.error("Failed to load your applications.");
            }
        };

        loadApplications();
    }, []);

    useEffect(() => {
        const loadRestaurants = async () => {
            try {
                const response = await GetEmployersWithFavouriteStatus();
                setRestaurants(response.data.map((restaurant) => ({
                    id: restaurant.id,
                    name: restaurant.name,
                    profilePhoto: restaurant.profilePhoto,
                    isFavourite: restaurant.isFavourite
                })));
            } catch {
                toast.error("Failed to load favourite restaurants.");
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
            toast.success("Application cancelled.");
        } catch {
            toast.error("Unable to cancel this application.");
        } finally {
            setCancelInProgressId(null);
        }
    };

    const visibleApplications = applications.filter((application) =>
        statusFilter === "All" ? true : application.status === statusFilter
    );

    const visibleRestaurants = restaurants.filter((restaurant) =>
        restaurantFilter === "all" ? true : restaurant.isFavourite
    );

    const handleProfilePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setSelectedPhotoFile(file);
    };

    const handleProfilePhotoUpload = async () => {
        if (!selectedPhotoFile) {
            toast.info("Select an image first.");
            return;
        }

        setIsPhotoUploadInProgress(true);
        try {
            const response = await UpdateMyProfilePhoto(selectedPhotoFile);
            setProfilePhotoUrl(getImageUrl(response.data.imagePath));
            toast.success("Profile photo updated.");
            setSelectedPhotoFile(null);
        } catch {
            toast.error("Unable to update profile photo.");
        } finally {
            setIsPhotoUploadInProgress(false);
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
                    <div className={styles.profileActions}>
                        <input className={styles.fileInput} type="file" accept="image/*" onChange={handleProfilePhotoChange} />
                        <button className={`${styles.button} ${styles.buttonPrimary}`} disabled={isPhotoUploadInProgress} onClick={handleProfilePhotoUpload}>
                            {isPhotoUploadInProgress ? "Updating photo..." : "Update photo"}
                        </button>
                    </div>
                </div>
            </section>

            <section className={styles.panel}>
                <h2 className={styles.sectionTitle}>Employee Info</h2>
                <div className={styles.infoGrid}>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Full name</span>
                        <span className={styles.infoValue}>{user.firstName} {user.lastName}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Email</span>
                        <span className={styles.infoValue}>{user.email}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Phone</span>
                        <span className={styles.infoValue}>{user.phoneNumber ?? "-"}</span>
                    </div>
                </div>
            </section>

            <section className={styles.panel}>
                <h2 className={styles.sectionTitle}>Restaurants</h2>
                <div className={styles.applicantsFilters}>
                    <div className={styles.filterGroup}>
                        <label htmlFor="restaurantFilter">Show restaurants</label>
                        <select
                            className={styles.select}
                            id="restaurantFilter"
                            value={restaurantFilter}
                            onChange={(e) => setRestaurantFilter(e.target.value as "all" | "favourites")}
                        >
                            <option value="favourites">Favourite restaurants</option>
                            <option value="all">All restaurants</option>
                        </select>
                    </div>
                </div>
                {visibleRestaurants.length === 0 && <p className={styles.mutedText}>No restaurants for this filter.</p>}
                <div className={styles.branchList}>
                    {visibleRestaurants.map((restaurant) => (
                        <article key={restaurant.id} className={styles.branchCard}>
                            <div className={styles.restaurantRow}>
                                <img
                                    src={getImageUrl(restaurant.profilePhoto)}
                                    alt={restaurant.name}
                                    className={styles.restaurantLogo}
                                />
                                <div>
                                    <strong>{restaurant.name}</strong>
                                    <p className={styles.mutedText}>
                                        {restaurant.isFavourite ? "Favourite" : "Not favourite"}
                                    </p>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className={styles.panel}>
                <h2 className={styles.sectionTitle}>Applied Job Posts</h2>
                <div className={styles.applicantsFilters}>
                    <div className={styles.filterGroup}>
                        <label htmlFor="myApplicationStatusFilter">Filter by status</label>
                        <select
                            className={styles.select}
                            id="myApplicationStatusFilter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All</option>
                            <option value="Applied">Applied</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Denied">Denied</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {visibleApplications.length === 0 && <p className={styles.mutedText}>No applications for this filter.</p>}

                <div className={styles.jobPostsGrid}>
                    {visibleApplications.map((application) => (
                        <article key={application.applicationId} className={styles.jobPostCard}>
                            <h4>{application.jobPostTitle}</h4>
                            <div className={styles.cardMeta}>
                                <div><span>Position:</span><strong>{application.position}</strong></div>
                                <div><span>Restaurant:</span><strong>{application.employerName}</strong></div>
                                <div>
                                    <span>Location:</span>
                                    <strong>
                                        {application.restaurantLocationName
                                            ? `${application.restaurantLocationName}${application.restaurantLocationCity ? ` (${application.restaurantLocationCity})` : ""}`
                                            : "-"}
                                    </strong>
                                </div>
                                <div><span>Starting date:</span><strong>{formatDate(application.startingDate)}</strong></div>
                                <div><span>Salary:</span><strong>{application.salary} RSD</strong></div>
                                <div>
                                    <span>Status:</span>
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
                                        {cancelInProgressId === application.applicationId ? "Cancelling..." : "Cancel application"}
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