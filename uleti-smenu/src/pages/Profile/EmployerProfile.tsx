import { getImageUrl } from "../../helpers/getHelperUrl";
import { getJobPostDisplayStatusLabel } from "../../helpers/jobPostStatus";
import { Employer } from "../../models/User.model";
import { ChangeEvent, useContext, useEffect, useMemo, useState } from "react";
import { JobPost } from "../../models/JobPost.model";
import { Applicant } from "../../models/Application.model";
import { GetMyJobPostPositions, GetMyJobPosts, GetMyJobPostsPaged } from "../../services/jobPost-service";
import { GetApplicantsForJobPost, UpdateApplicationStatus } from "../../services/application-service";
import { UpdateMyProfilePhoto, getCurrentUser } from "../../services/user-service";
import { CreateMyRestaurantLocation, GetMyRestaurantLocations } from "../../services/restaurantLocation-service";
import { toast } from "react-toastify";
import { RestaurantLocation } from "../../models/RestaurantLocation.model";
import styles from "./Profile.module.scss";
import JobPostForm from "../../components/JobPosts/JobPostForm";
import ProfilePhotoUpload from "./ProfilePhotoUpload";
import CollapsibleSection from "./CollapsibleSection";
import ApplicationChatPanel from "../../components/Chat/ApplicationChatPanel";
import PendingReviewsSection from "../../components/Reviews/PendingReviewsSection";
import ReceivedReviewsSection from "../../components/Reviews/ReceivedReviewsSection";
import RatingBadge from "../../components/Reviews/RatingBadge";
import { GetEmployerReviewPage } from "../../services/review-service";
import { Review, ReviewSummary } from "../../models/Review.model";
import SubscriptionBanner from "../../components/Billing/SubscriptionBanner";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../store/Auth-context";
import Pagination from "../../components/Common/Pagination";
import { LIST_PAGE_SIZE } from "../../constants/pagination";
import { useClientPagination } from "../../hooks/useClientPagination";

interface EmployerProfileProps {
    user: Employer;
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

const EmployerProfile = ({ user }: EmployerProfileProps) => {
    const { t } = useTranslation();
    const { refreshMe } = useContext(AuthContext);
    const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
    const [allJobPosts, setAllJobPosts] = useState<JobPost[]>([]);
    const [positionOptions, setPositionOptions] = useState<string[]>([]);
    const [jobPostsPage, setJobPostsPage] = useState(1);
    const [jobPostsTotalCount, setJobPostsTotalCount] = useState(0);
    const [jobPostPositionFilter, setJobPostPositionFilter] = useState("");
    const [jobPostStatusFilter, setJobPostStatusFilter] = useState("active");
    const [jobPostSortValue, setJobPostSortValue] = useState("createdAt_desc");
    const [selectedJobPostId, setSelectedJobPostId] = useState<string>("");
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [applicantSearchQuery, setApplicantSearchQuery] = useState("");
    const [applicantSortValue, setApplicantSortValue] = useState("appliedAt_desc");
    const [actionInProgress, setActionInProgress] = useState<string | null>(null);
    const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>(getImageUrl(user.profilePhoto));
    const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
    const [isPhotoUploadInProgress, setIsPhotoUploadInProgress] = useState<boolean>(false);
    const [receivedReviews, setReceivedReviews] = useState<Review[]>([]);
    const [reviewSummary, setReviewSummary] = useState<ReviewSummary>({ averageRating: 0, reviewCount: 0 });

    useEffect(() => {
        const loadReceivedReviews = async () => {
            try {
                const response = await GetEmployerReviewPage(user.id);
                setReceivedReviews(response.data.reviews);
                setReviewSummary(response.data.summary);
            } catch {
                toast.error(t("reviews.loadError"));
            }
        };

        void loadReceivedReviews();
    }, [user.id, t]);

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
    const [locations, setLocations] = useState<RestaurantLocation[]>([]);
    const [editingJobPostId, setEditingJobPostId] = useState<string | null>(null);
    const [isCreatingLocation, setIsCreatingLocation] = useState(false);
    const [newBranch, setNewBranch] = useState({
        name: "",
        phoneNumber: "",
        streetName: "",
        streetNumber: "",
        city: "",
        postalCode: "",
        country: "",
        region: ""
    });

    const selectedJobPost = useMemo(
        () => allJobPosts.find((post) => post.id === selectedJobPostId),
        [allJobPosts, selectedJobPostId]
    );
    const editingJobPost = useMemo(
        () => allJobPosts.find((post) => post.id === editingJobPostId),
        [allJobPosts, editingJobPostId]
    );

    const totalJobPostPages = useMemo(
        () => Math.max(1, Math.ceil(jobPostsTotalCount / LIST_PAGE_SIZE)),
        [jobPostsTotalCount]
    );

    const parseJobPostSort = (value: string) => {
        switch (value) {
            case "createdAt_asc":
                return { sortBy: "createdAt" as const, sortDirection: "asc" as const };
            case "startingDate_desc":
                return { sortBy: "startingDate" as const, sortDirection: "desc" as const };
            case "startingDate_asc":
                return { sortBy: "startingDate" as const, sortDirection: "asc" as const };
            case "position_asc":
                return { sortBy: "position" as const, sortDirection: "asc" as const };
            case "position_desc":
                return { sortBy: "position" as const, sortDirection: "desc" as const };
            default:
                return { sortBy: "createdAt" as const, sortDirection: "desc" as const };
        }
    };

    const resolveJobPostListFilters = (statusFilter: string) => {
        if (statusFilter === "archived") {
            return { lifecycle: "archived" as const };
        }

        if (statusFilter === "all") {
            return { lifecycle: "all" as const };
        }

        if (statusFilter === "Cancelled") {
            return { status: "Cancelled" as const, lifecycle: "all" as const };
        }

        return { lifecycle: "active" as const };
    };

    const loadAllJobPosts = async () => {
        try {
            const response = await GetMyJobPosts();
            setAllJobPosts(response.data);
            if (response.data.length > 0) {
                setSelectedJobPostId((previousValue) => previousValue || response.data[0].id);
            }
        } catch {
            toast.error(t("profile.failedLoadJobPosts"));
        }
    };

    const loadPagedJobPosts = async () => {
        const { sortBy, sortDirection } = parseJobPostSort(jobPostSortValue);
        const listFilters = resolveJobPostListFilters(jobPostStatusFilter);

        try {
            const response = await GetMyJobPostsPaged({
                page: jobPostsPage,
                pageSize: LIST_PAGE_SIZE,
                position: jobPostPositionFilter || undefined,
                status: listFilters.status,
                lifecycle: listFilters.lifecycle,
                sortBy,
                sortDirection,
            });

            setJobPosts(response.data.items);
            setJobPostsTotalCount(response.data.totalCount);
        } catch {
            toast.error(t("profile.failedLoadJobPosts"));
        }
    };

    const reloadJobPosts = async () => {
        await Promise.all([loadAllJobPosts(), loadPagedJobPosts()]);
    };

    useEffect(() => {
        loadAllJobPosts();
        const loadPositions = async () => {
            try {
                const response = await GetMyJobPostPositions();
                setPositionOptions(response.data);
            } catch {
                setPositionOptions([]);
            }
        };
        loadPositions();
    }, []);

    useEffect(() => {
        loadPagedJobPosts();
    }, [jobPostsPage, jobPostPositionFilter, jobPostStatusFilter, jobPostSortValue]);

    useEffect(() => {
        const loadLocations = async () => {
            try {
                const response = await GetMyRestaurantLocations();
                setLocations(response.data);
            } catch {
                toast.error(t("profile.failedLoadBranches"));
            }
        };

        loadLocations();
    }, []);

    useEffect(() => {
        setApplicantSearchQuery("");
        setApplicantSortValue("appliedAt_desc");
        setStatusFilter("All");
    }, [selectedJobPostId]);

    useEffect(() => {
        if (!selectedJobPostId) {
            setApplicants([]);
            return;
        }

        const loadApplicants = async () => {
            try {
                const response = await GetApplicantsForJobPost(selectedJobPostId);
                setApplicants(response.data);
            } catch {
                toast.error(t("profile.failedLoadApplicants"));
            }
        };

        loadApplicants();
    }, [selectedJobPostId]);

    const visibleApplicants = useMemo(() => {
        const normalizedSearch = applicantSearchQuery.trim().toLowerCase();

        const filtered = applicants.filter((applicant) => {
            if (statusFilter !== "All" && applicant.status !== statusFilter) {
                return false;
            }

            if (!normalizedSearch) {
                return true;
            }

            const fullName = `${applicant.firstName} ${applicant.lastName}`.toLowerCase();
            return (
                fullName.includes(normalizedSearch) ||
                applicant.firstName.toLowerCase().includes(normalizedSearch) ||
                applicant.lastName.toLowerCase().includes(normalizedSearch)
            );
        });

        return [...filtered].sort((firstApplicant, secondApplicant) => {
            switch (applicantSortValue) {
                case "name_asc": {
                    const firstName = `${firstApplicant.firstName} ${firstApplicant.lastName}`.toLowerCase();
                    const secondName = `${secondApplicant.firstName} ${secondApplicant.lastName}`.toLowerCase();
                    return firstName.localeCompare(secondName);
                }
                case "name_desc": {
                    const firstName = `${firstApplicant.firstName} ${firstApplicant.lastName}`.toLowerCase();
                    const secondName = `${secondApplicant.firstName} ${secondApplicant.lastName}`.toLowerCase();
                    return secondName.localeCompare(firstName);
                }
                case "appliedAt_asc":
                    return new Date(firstApplicant.appliedAt).getTime() - new Date(secondApplicant.appliedAt).getTime();
                default:
                    return new Date(secondApplicant.appliedAt).getTime() - new Date(firstApplicant.appliedAt).getTime();
            }
        });
    }, [applicants, statusFilter, applicantSearchQuery, applicantSortValue]);

    const applicantsResetKey = `${selectedJobPostId}|${statusFilter}|${applicantSearchQuery}|${applicantSortValue}`;
    const {
        page: applicantsPage,
        setPage: setApplicantsPage,
        totalPages: applicantsTotalPages,
        totalCount: applicantsTotalCount,
        pageSize: applicantsPageSize,
        pagedItems: pagedApplicants,
    } = useClientPagination(visibleApplicants, LIST_PAGE_SIZE, applicantsResetKey);

    const {
        page: branchesPage,
        setPage: setBranchesPage,
        totalPages: branchesTotalPages,
        totalCount: branchesTotalCount,
        pageSize: branchesPageSize,
        pagedItems: pagedLocations,
    } = useClientPagination(locations, LIST_PAGE_SIZE);

    const handleStatusUpdate = async (applicationId: string, status: "Accepted" | "Denied") => {
        setActionInProgress(`${applicationId}:${status}`);
        try {
            await UpdateApplicationStatus(applicationId, status);
            setApplicants((prev) =>
                prev.map((applicant) =>
                    applicant.applicationId === applicationId ? { ...applicant, status } : applicant
                )
            );
            toast.success(t("profile.applicationUpdated"));
        } catch {
            toast.error(t("profile.applicationUpdateError"));
        } finally {
            setActionInProgress(null);
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

    const handleBranchFieldChange = (field: keyof typeof newBranch, value: string) => {
        setNewBranch((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCreateBranch = async () => {
        const requiredValues = Object.values(newBranch).every((value) => value.trim() !== "");
        if (!requiredValues) {
            toast.info(t("profile.fillBranchFields"));
            return;
        }

        setIsCreatingLocation(true);
        try {
            const response = await CreateMyRestaurantLocation({
                ...newBranch,
                pib: user.pib,
                mb: user.mb
            });

            setLocations((prev) => [...prev, response.data]);
            setNewBranch({
                name: "",
                phoneNumber: "",
                streetName: "",
                streetNumber: "",
                city: "",
                postalCode: "",
                country: "",
                region: ""
            });
            toast.success(t("profile.branchAdded"));
        } catch {
            toast.error(t("profile.branchAddError"));
        } finally {
            setIsCreatingLocation(false);
        }
    };

    const formatDate = (value: Date) => {
        const parsedDate = new Date(value);
        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }
        return parsedDate.toLocaleString();
    };

    return (
        <div className={styles.profilePage}>
            <SubscriptionBanner subscription={user.subscription} />

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
                            inputId="employerProfilePhotoInput"
                            selectedFile={selectedPhotoFile}
                            isUploading={isPhotoUploadInProgress}
                            onFileChange={handleProfilePhotoChange}
                            onUpload={handleProfilePhotoUpload}
                        />
                    </div>
                    <div className={styles.profileInfoColumn}>
                        <h2 className={styles.profileInfoTitle}>{t("profile.employerInfo")}</h2>
                        <RatingBadge
                            averageRating={reviewSummary.averageRating}
                            reviewCount={reviewSummary.reviewCount}
                            subjectType="employer"
                            subjectSlug={user.publicSlug}
                            subjectId={user.id}
                        />
                        <div className={styles.infoGrid}>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>{t("profile.restaurantName")}</span>
                                <span className={styles.infoValue}>{user.name}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>{t("profile.address")}</span>
                                <span className={styles.infoValue}>
                                    {locations[0]
                                        ? `${locations[0].streetName} ${locations[0].streetNumber}, ${locations[0].city}`
                                        : "-"}
                                </span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>{t("profile.phone")}</span>
                                <span className={styles.infoValue}>{user.phoneNumber ?? "-"}</span>
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
                            {user.subscription && user.subscription.status !== "None" && (
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>{t("billing.planLabel")}</span>
                                    <span className={styles.infoValue}>
                                        {user.subscription.planTitle}
                                        {user.subscription.isActive
                                            ? ` · ${t("billing.until", { date: new Date(user.subscription.subscriptionStop ?? "").toLocaleDateString() })}`
                                            : ` · ${t("billing.expiredShort")}`}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <CollapsibleSection title={t("profile.addBranch")}>
                <div className={styles.branchForm}>
                    <input
                        className={styles.input}
                        type="text"
                        placeholder={t("profile.restaurantName")}
                        value={newBranch.name}
                        onChange={(e) => handleBranchFieldChange("name", e.target.value)}
                    />
                    <input
                        className={styles.input}
                        type="text"
                        placeholder={t("registration.phoneNumber")}
                        value={newBranch.phoneNumber}
                        onChange={(e) => handleBranchFieldChange("phoneNumber", e.target.value)}
                    />
                    <input className={`${styles.input} ${styles.readOnlyInput}`} type="text" value={user.pib} disabled />
                    <input className={`${styles.input} ${styles.readOnlyInput}`} type="text" value={user.mb} disabled />
                    <input
                        className={styles.input}
                        type="text"
                        placeholder={t("registration.streetName")}
                        value={newBranch.streetName}
                        onChange={(e) => handleBranchFieldChange("streetName", e.target.value)}
                    />
                    <input
                        className={styles.input}
                        type="text"
                        placeholder={t("registration.streetNumber")}
                        value={newBranch.streetNumber}
                        onChange={(e) => handleBranchFieldChange("streetNumber", e.target.value)}
                    />
                    <input
                        className={styles.input}
                        type="text"
                        placeholder={t("registration.city")}
                        value={newBranch.city}
                        onChange={(e) => handleBranchFieldChange("city", e.target.value)}
                    />
                    <input
                        className={styles.input}
                        type="text"
                        placeholder={t("registration.postalCode")}
                        value={newBranch.postalCode}
                        onChange={(e) => handleBranchFieldChange("postalCode", e.target.value)}
                    />
                    <input
                        className={styles.input}
                        type="text"
                        placeholder={t("registration.country")}
                        value={newBranch.country}
                        onChange={(e) => handleBranchFieldChange("country", e.target.value)}
                    />
                    <input
                        className={styles.input}
                        type="text"
                        placeholder={t("registration.region")}
                        value={newBranch.region}
                        onChange={(e) => handleBranchFieldChange("region", e.target.value)}
                    />
                </div>
                <div className={styles.actionsRow}>
                    <button className={`${styles.button} ${styles.buttonPrimary}`} disabled={isCreatingLocation} onClick={handleCreateBranch}>
                        {isCreatingLocation ? t("profile.addingBranch") : t("profile.addBranchAction")}
                    </button>
                </div>
            </CollapsibleSection>

            <CollapsibleSection title={t("profile.yourBranches")} titleTag="h3">
                {locations.length === 0 && <p className={styles.mutedText}>{t("profile.noBranches")}</p>}
                <div className={styles.branchList}>
                    {pagedLocations.map((location) => (
                        <div key={location.id} className={styles.branchCard}>
                            <strong>{location.name}</strong>
                            <p>{location.city}, {location.streetName} {location.streetNumber}</p>
                            <p>{location.phoneNumber}</p>
                        </div>
                    ))}
                </div>
                <Pagination
                    page={branchesPage}
                    totalPages={branchesTotalPages}
                    totalCount={branchesTotalCount}
                    pageSize={branchesPageSize}
                    onPrevious={() => setBranchesPage((previous) => Math.max(1, previous - 1))}
                    onNext={() => setBranchesPage((previous) => Math.min(branchesTotalPages, previous + 1))}
                />
            </CollapsibleSection>

            <CollapsibleSection title={t("profile.myJobPosts")}>
                <div className={styles.jobPostsToolbar}>
                    <div className={styles.filterGroup}>
                        <label htmlFor="jobPostPositionFilter">{t("profile.filterByPosition")}</label>
                        <select
                            id="jobPostPositionFilter"
                            className={styles.select}
                            value={jobPostPositionFilter}
                            onChange={(event) => {
                                setJobPostsPage(1);
                                setJobPostPositionFilter(event.target.value);
                            }}
                        >
                            <option value="">{t("profile.all")}</option>
                            {positionOptions.map((position) => (
                                <option key={position} value={position}>
                                    {position}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label htmlFor="jobPostStatusFilter">{t("profile.filterByJobStatus")}</label>
                        <select
                            id="jobPostStatusFilter"
                            className={styles.select}
                            value={jobPostStatusFilter}
                            onChange={(event) => {
                                setJobPostsPage(1);
                                setJobPostStatusFilter(event.target.value);
                            }}
                        >
                            <option value="active">{t("jobPosts.activePosts")}</option>
                            <option value="archived">{t("jobPosts.archivedPosts")}</option>
                            <option value="all">{t("jobPosts.allPosts")}</option>
                            <option value="Cancelled">{t("jobPostForm.statusCancelled")}</option>
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label htmlFor="jobPostSortFilter">{t("profile.sortJobPosts")}</label>
                        <select
                            id="jobPostSortFilter"
                            className={styles.select}
                            value={jobPostSortValue}
                            onChange={(event) => {
                                setJobPostsPage(1);
                                setJobPostSortValue(event.target.value);
                            }}
                        >
                            <option value="createdAt_desc">{t("profile.sortCreatedNewest")}</option>
                            <option value="createdAt_asc">{t("profile.sortCreatedOldest")}</option>
                            <option value="startingDate_asc">{t("profile.sortDateOldest")}</option>
                            <option value="startingDate_desc">{t("profile.sortDateNewest")}</option>
                            <option value="position_asc">{t("profile.sortPositionAsc")}</option>
                            <option value="position_desc">{t("profile.sortPositionDesc")}</option>
                        </select>
                    </div>
                </div>

                {jobPosts.length === 0 && (
                    <p className={styles.mutedText}>
                        {jobPostsTotalCount === 0 && jobPostPositionFilter === "" && jobPostStatusFilter === "active"
                            ? t("profile.noJobPosts")
                            : t("profile.noJobPostsFiltered")}
                    </p>
                )}
                <div className={styles.jobPostsGrid}>
                    {jobPosts.map((post) => (
                        <article key={post.id} className={styles.jobPostCard}>
                            <h4>
                                {post.title}
                                <span
                                    className={`${styles.lifecycleBadge} ${post.isArchived ? styles.lifecycleArchived : styles.lifecycleActive}`}
                                >
                                    {post.isArchived ? t("jobPosts.lifecycleArchived") : t("jobPosts.lifecycleActive")}
                                </span>
                            </h4>
                            <div className={styles.cardMeta}>
                                <div><span>{t("profile.workerType")}:</span><strong>{post.position}</strong></div>
                                <div><span>{t("profile.location")}:</span><strong>{post.restaurantLocationName ?? "-"}</strong></div>
                                <div><span>{t("profile.startingDate")}:</span><strong>{formatDate(post.startingDate)}</strong></div>
                                <div><span>{t("profile.payment")}:</span><strong>{post.salary} RSD</strong></div>
                                <div>
                                    <span>{t("profile.status")}:</span>
                                    <strong>
                                        {getJobPostDisplayStatusLabel(post, t)}
                                    </strong>
                                </div>
                            </div>
                            <div className={styles.actionsRow}>
                                <button
                                    className={`${styles.button} ${styles.buttonSecondary}`}
                                    onClick={() => setEditingJobPostId(post.id)}
                                >
                                    {t("profile.edit")}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
                {jobPostsTotalCount > LIST_PAGE_SIZE && (
                    <Pagination
                        page={jobPostsPage}
                        totalPages={totalJobPostPages}
                        totalCount={jobPostsTotalCount}
                        pageSize={LIST_PAGE_SIZE}
                        onPrevious={() => setJobPostsPage((previous) => Math.max(1, previous - 1))}
                        onNext={() => setJobPostsPage((previous) => Math.min(totalJobPostPages, previous + 1))}
                    />
                )}
                {editingJobPost && (
                    <div className={styles.inlineForm}>
                        <JobPostForm
                            key={editingJobPost.id}
                            initialData={editingJobPost}
                            onClose={() => setEditingJobPostId(null)}
                            onSubmit={async () => {
                                const positionsResponse = await GetMyJobPostPositions().catch(() => null);
                                if (positionsResponse) {
                                    setPositionOptions(positionsResponse.data);
                                }
                                await reloadJobPosts();
                                setEditingJobPostId(null);
                            }}
                        />
                    </div>
                )}
            </CollapsibleSection>

            <CollapsibleSection title={t("reviews.pendingTitle")}>
                <PendingReviewsSection />
            </CollapsibleSection>

            <CollapsibleSection title={t("reviews.receivedTitle")}>
                <ReceivedReviewsSection reviews={receivedReviews} reviewSummary={reviewSummary} />
            </CollapsibleSection>

            <CollapsibleSection title={t("profile.applicants")}>
                {allJobPosts.length > 0 && (
                    <div className={styles.applicantsFilters}>
                        <div className={styles.filterGroup}>
                            <label htmlFor="jobPostSelect">{t("profile.chooseJobPost")}</label>
                            <select
                                className={styles.select}
                                id="jobPostSelect"
                                value={selectedJobPostId}
                                onChange={(e) => setSelectedJobPostId(e.target.value)}
                            >
                                {allJobPosts.map((post) => (
                                    <option key={post.id} value={post.id}>
                                        {post.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.filterGroup}>
                            <label htmlFor="statusFilter">{t("profile.filterByStatus")}</label>
                            <select
                                className={styles.select}
                                id="statusFilter"
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
                        <div className={styles.filterGroup}>
                            <label htmlFor="applicantSearch">{t("profile.searchApplicants")}</label>
                            <input
                                className={styles.input}
                                id="applicantSearch"
                                type="search"
                                value={applicantSearchQuery}
                                placeholder={t("profile.searchApplicantsPlaceholder")}
                                onChange={(event) => setApplicantSearchQuery(event.target.value)}
                            />
                        </div>
                        <div className={styles.filterGroup}>
                            <label htmlFor="applicantSort">{t("profile.sortApplicants")}</label>
                            <select
                                className={styles.select}
                                id="applicantSort"
                                value={applicantSortValue}
                                onChange={(event) => setApplicantSortValue(event.target.value)}
                            >
                                <option value="appliedAt_desc">{t("profile.sortAppliedNewest")}</option>
                                <option value="appliedAt_asc">{t("profile.sortAppliedOldest")}</option>
                                <option value="name_asc">{t("profile.sortNameAsc")}</option>
                                <option value="name_desc">{t("profile.sortNameDesc")}</option>
                            </select>
                        </div>
                    </div>
                )}
                {allJobPosts.length > 0 && <p className={styles.selectedPost}>{t("profile.selectedPost")}: {selectedJobPost?.title ?? "-"}</p>}
                {visibleApplicants.length === 0 && <p className={styles.mutedText}>{t("profile.noApplicantsForFilter")}</p>}
                <div className={styles.applicantsList}>
                    {pagedApplicants.map((applicant) => (
                        <div key={applicant.applicationId} className={styles.applicantCard}>
                            <p className={styles.applicantName}>
                                <Link className={styles.applicantProfileLink} to={`/employees/${applicant.userId}`}>
                                    {applicant.firstName} {applicant.lastName}
                                </Link>{" "}
                                <RatingBadge
                                    averageRating={applicant.averageRating}
                                    reviewCount={applicant.reviewCount}
                                    compact
                                    subjectType="employee"
                                    subjectId={applicant.userId}
                                />{" "}
                                <span style={getStatusBadgeStyle(applicant.status)}>{applicant.status}</span>
                            </p>
                            {applicant.status === "Applied" && (
                                <div className={styles.actionsRow}>
                                    <button
                                        className={`${styles.button} ${styles.buttonPrimary}`}
                                        disabled={actionInProgress !== null}
                                        onClick={() => handleStatusUpdate(applicant.applicationId, "Accepted")}
                                    >
                                        {actionInProgress === `${applicant.applicationId}:Accepted` ? t("profile.accepting") : t("profile.accept")}
                                    </button>
                                    <button
                                        className={`${styles.button} ${styles.buttonSecondary}`}
                                        disabled={actionInProgress !== null}
                                        onClick={() => handleStatusUpdate(applicant.applicationId, "Denied")}
                                    >
                                        {actionInProgress === `${applicant.applicationId}:Denied` ? t("profile.denying") : t("profile.deny")}
                                    </button>
                                </div>
                            )}
                            <ApplicationChatPanel
                                applicationId={applicant.applicationId}
                                enabled={applicant.status === "Accepted"}
                            />
                        </div>
                    ))}
                </div>
                <Pagination
                    page={applicantsPage}
                    totalPages={applicantsTotalPages}
                    totalCount={applicantsTotalCount}
                    pageSize={applicantsPageSize}
                    onPrevious={() => setApplicantsPage((previous) => Math.max(1, previous - 1))}
                    onNext={() => setApplicantsPage((previous) => Math.min(applicantsTotalPages, previous + 1))}
                />
            </CollapsibleSection>
        </div>
    )
};

export default EmployerProfile;