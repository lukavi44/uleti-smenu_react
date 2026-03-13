import { getImageUrl } from "../../helpers/getHelperUrl";
import { Employer } from "../../models/User.model";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { JobPost } from "../../models/JobPost.model";
import { Applicant } from "../../models/Application.model";
import { GetMyJobPosts } from "../../services/jobPost-service";
import { GetApplicantsForJobPost, UpdateApplicationStatus } from "../../services/application-service";
import { UpdateMyProfilePhoto } from "../../services/user-service";
import { CreateMyRestaurantLocation, GetMyRestaurantLocations } from "../../services/restaurantLocation-service";
import { toast } from "react-toastify";
import { RestaurantLocation } from "../../models/RestaurantLocation.model";
import styles from "./Profile.module.scss";
import JobPostForm from "../../components/JobPosts/JobPostForm";
import ProfilePhotoUpload from "./ProfilePhotoUpload";
import { useTranslation } from "react-i18next";

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
    const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
    const [selectedJobPostId, setSelectedJobPostId] = useState<string>("");
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [actionInProgress, setActionInProgress] = useState<string | null>(null);
    const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>(getImageUrl(user.profilePhoto));
    const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
    const [isPhotoUploadInProgress, setIsPhotoUploadInProgress] = useState<boolean>(false);
    const [locations, setLocations] = useState<RestaurantLocation[]>([]);
    const [editingJobPostId, setEditingJobPostId] = useState<string | null>(null);
    const [isCreatingLocation, setIsCreatingLocation] = useState(false);
    const [isBranchFormOpen, setIsBranchFormOpen] = useState(false);
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
        () => jobPosts.find((post) => post.id === selectedJobPostId),
        [jobPosts, selectedJobPostId]
    );
    const editingJobPost = useMemo(
        () => jobPosts.find((post) => post.id === editingJobPostId),
        [jobPosts, editingJobPostId]
    );

    const loadJobPosts = async () => {
        try {
            const response = await GetMyJobPosts();
            setJobPosts(response.data);
            if (response.data.length > 0) {
                setSelectedJobPostId((previousValue) => previousValue || response.data[0].id);
            }
        } catch {
            toast.error(t("profile.failedLoadJobPosts"));
        }
    };

    useEffect(() => {
        loadJobPosts();
    }, []);

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

    const visibleApplicants = applicants.filter((applicant) =>
        statusFilter === "All" ? true : applicant.status === statusFilter
    );

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
            setIsBranchFormOpen(false);
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
            <section className={styles.panel}>
                <div className={styles.profileHeader}>
                    <img src={profilePhotoUrl} alt="Profile" className={styles.profileImage} />
                    <ProfilePhotoUpload
                        inputId="employerProfilePhotoInput"
                        selectedFile={selectedPhotoFile}
                        isUploading={isPhotoUploadInProgress}
                        onFileChange={handleProfilePhotoChange}
                        onUpload={handleProfilePhotoUpload}
                    />
                </div>
            </section>

            <section className={styles.panel}>
                <h2 className={styles.sectionTitle}>{t("profile.employerInfo")}</h2>
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
                </div>
            </section>

            <section className={styles.panel}>
                <div className={styles.collapsibleHeader}>
                    <h2 className={styles.sectionTitle}>{t("profile.addBranch")}</h2>
                    <button
                        className={`${styles.button} ${styles.buttonSecondary}`}
                        onClick={() => setIsBranchFormOpen((previousState) => !previousState)}
                    >
                        {isBranchFormOpen ? t("profile.hideForm") : t("profile.openForm")}
                    </button>
                </div>
                {isBranchFormOpen && (
                    <>
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
                    </>
                )}
            </section>

            <section className={styles.panel}>
                <h3 className={styles.subTitle}>{t("profile.yourBranches")}</h3>
                {locations.length === 0 && <p className={styles.mutedText}>{t("profile.noBranches")}</p>}
                <div className={styles.branchList}>
                    {locations.map((location) => (
                        <div key={location.id} className={styles.branchCard}>
                            <strong>{location.name}</strong>
                            <p>{location.city}, {location.streetName} {location.streetNumber}</p>
                            <p>{location.phoneNumber}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className={styles.panel}>
                <h2 className={styles.sectionTitle}>{t("profile.myJobPosts")}</h2>
                {jobPosts.length === 0 && <p className={styles.mutedText}>{t("profile.noJobPosts")}</p>}
                <div className={styles.jobPostsGrid}>
                    {jobPosts.map((post) => (
                        <article key={post.id} className={styles.jobPostCard}>
                            <h4>{post.title}</h4>
                            <div className={styles.cardMeta}>
                                <div><span>{t("profile.workerType")}:</span><strong>{post.position}</strong></div>
                                <div><span>{t("profile.location")}:</span><strong>{post.restaurantLocationName ?? "-"}</strong></div>
                                <div><span>{t("profile.startingDate")}:</span><strong>{formatDate(post.startingDate)}</strong></div>
                                <div><span>{t("profile.payment")}:</span><strong>{post.salary} RSD</strong></div>
                                <div><span>{t("profile.status")}:</span><strong>{post.status}</strong></div>
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
                {editingJobPost && (
                    <div className={styles.inlineForm}>
                        <JobPostForm
                            initialData={editingJobPost}
                            onClose={() => setEditingJobPostId(null)}
                            onSubmit={async () => {
                                await loadJobPosts();
                                setEditingJobPostId(null);
                            }}
                        />
                    </div>
                )}
            </section>

            <section className={styles.panel}>
                <h2 className={styles.sectionTitle}>{t("profile.applicants")}</h2>
                {jobPosts.length > 0 && (
                    <div className={styles.applicantsFilters}>
                        <div className={styles.filterGroup}>
                            <label htmlFor="jobPostSelect">{t("profile.chooseJobPost")}</label>
                            <select
                                className={styles.select}
                                id="jobPostSelect"
                                value={selectedJobPostId}
                                onChange={(e) => setSelectedJobPostId(e.target.value)}
                            >
                                {jobPosts.map((post) => (
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
                    </div>
                )}
                {jobPosts.length > 0 && <p className={styles.selectedPost}>{t("profile.selectedPost")}: {selectedJobPost?.title ?? "-"}</p>}
                {visibleApplicants.length === 0 && <p className={styles.mutedText}>{t("profile.noApplicantsForFilter")}</p>}
                <div className={styles.applicantsList}>
                    {visibleApplicants.map((applicant) => (
                        <div key={applicant.applicationId} className={styles.applicantCard}>
                            <p className={styles.applicantName}>
                                {applicant.firstName} {applicant.lastName}{" "}
                                <span style={getStatusBadgeStyle(applicant.status)}>{applicant.status}</span>
                            </p>
                            <p className={styles.mutedText}>{applicant.email}</p>
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
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
};

export default EmployerProfile;