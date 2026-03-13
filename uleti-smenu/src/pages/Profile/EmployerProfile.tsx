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
            toast.error("Failed to load your job posts.");
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
                toast.error("Failed to load your restaurant branches.");
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
                toast.error("Failed to load applicants.");
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
            toast.success(`Application ${status.toLowerCase()}.`);
        } catch {
            toast.error("Unable to update application status.");
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

    const handleBranchFieldChange = (field: keyof typeof newBranch, value: string) => {
        setNewBranch((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCreateBranch = async () => {
        const requiredValues = Object.values(newBranch).every((value) => value.trim() !== "");
        if (!requiredValues) {
            toast.info("Please fill all branch fields.");
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
            toast.success("Franchise branch added.");
        } catch {
            toast.error("Failed to add franchise branch.");
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
                <h2 className={styles.sectionTitle}>Employer Info</h2>
                <div className={styles.infoGrid}>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Restaurant name</span>
                        <span className={styles.infoValue}>{user.name}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Address</span>
                        <span className={styles.infoValue}>
                            {locations[0]
                                ? `${locations[0].streetName} ${locations[0].streetNumber}, ${locations[0].city}`
                                : "-"}
                        </span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Phone</span>
                        <span className={styles.infoValue}>{user.phoneNumber ?? "-"}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Email</span>
                        <span className={styles.infoValue}>{user.email}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>PIB</span>
                        <span className={styles.infoValue}>{user.pib}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>MB</span>
                        <span className={styles.infoValue}>{user.mb}</span>
                    </div>
                </div>
            </section>

            <section className={styles.panel}>
                <div className={styles.collapsibleHeader}>
                    <h2 className={styles.sectionTitle}>Add Restaurant Branch</h2>
                    <button
                        className={`${styles.button} ${styles.buttonSecondary}`}
                        onClick={() => setIsBranchFormOpen((previousState) => !previousState)}
                    >
                        {isBranchFormOpen ? "Hide form" : "Open form"}
                    </button>
                </div>
                {isBranchFormOpen && (
                    <>
                        <div className={styles.branchForm}>
                            <input
                                className={styles.input}
                                type="text"
                                placeholder="Restaurant name"
                                value={newBranch.name}
                                onChange={(e) => handleBranchFieldChange("name", e.target.value)}
                            />
                            <input
                                className={styles.input}
                                type="text"
                                placeholder="Phone number"
                                value={newBranch.phoneNumber}
                                onChange={(e) => handleBranchFieldChange("phoneNumber", e.target.value)}
                            />
                            <input className={`${styles.input} ${styles.readOnlyInput}`} type="text" value={user.pib} disabled />
                            <input className={`${styles.input} ${styles.readOnlyInput}`} type="text" value={user.mb} disabled />
                            <input
                                className={styles.input}
                                type="text"
                                placeholder="Street name"
                                value={newBranch.streetName}
                                onChange={(e) => handleBranchFieldChange("streetName", e.target.value)}
                            />
                            <input
                                className={styles.input}
                                type="text"
                                placeholder="Street number"
                                value={newBranch.streetNumber}
                                onChange={(e) => handleBranchFieldChange("streetNumber", e.target.value)}
                            />
                            <input
                                className={styles.input}
                                type="text"
                                placeholder="City"
                                value={newBranch.city}
                                onChange={(e) => handleBranchFieldChange("city", e.target.value)}
                            />
                            <input
                                className={styles.input}
                                type="text"
                                placeholder="Postal code"
                                value={newBranch.postalCode}
                                onChange={(e) => handleBranchFieldChange("postalCode", e.target.value)}
                            />
                            <input
                                className={styles.input}
                                type="text"
                                placeholder="Country"
                                value={newBranch.country}
                                onChange={(e) => handleBranchFieldChange("country", e.target.value)}
                            />
                            <input
                                className={styles.input}
                                type="text"
                                placeholder="Region"
                                value={newBranch.region}
                                onChange={(e) => handleBranchFieldChange("region", e.target.value)}
                            />
                        </div>
                        <div className={styles.actionsRow}>
                            <button className={`${styles.button} ${styles.buttonPrimary}`} disabled={isCreatingLocation} onClick={handleCreateBranch}>
                                {isCreatingLocation ? "Adding branch..." : "Add franchise branch"}
                            </button>
                        </div>
                    </>
                )}
            </section>

            <section className={styles.panel}>
                <h3 className={styles.subTitle}>Your Branches</h3>
                {locations.length === 0 && <p className={styles.mutedText}>No branches yet.</p>}
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
                <h2 className={styles.sectionTitle}>My Job Posts</h2>
                {jobPosts.length === 0 && <p className={styles.mutedText}>You do not have job posts yet.</p>}
                <div className={styles.jobPostsGrid}>
                    {jobPosts.map((post) => (
                        <article key={post.id} className={styles.jobPostCard}>
                            <h4>{post.title}</h4>
                            <div className={styles.cardMeta}>
                                <div><span>Worker type:</span><strong>{post.position}</strong></div>
                                <div><span>Location:</span><strong>{post.restaurantLocationName ?? "-"}</strong></div>
                                <div><span>Starting date:</span><strong>{formatDate(post.startingDate)}</strong></div>
                                <div><span>Payment:</span><strong>{post.salary} RSD</strong></div>
                                <div><span>Status:</span><strong>{post.status}</strong></div>
                            </div>
                            <div className={styles.actionsRow}>
                                <button
                                    className={`${styles.button} ${styles.buttonSecondary}`}
                                    onClick={() => setEditingJobPostId(post.id)}
                                >
                                    Edit
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
                <h2 className={styles.sectionTitle}>Applicants</h2>
                {jobPosts.length > 0 && (
                    <div className={styles.applicantsFilters}>
                        <div className={styles.filterGroup}>
                            <label htmlFor="jobPostSelect">Choose job post</label>
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
                            <label htmlFor="statusFilter">Filter by status</label>
                            <select
                                className={styles.select}
                                id="statusFilter"
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
                )}
                {jobPosts.length > 0 && <p className={styles.selectedPost}>Selected: {selectedJobPost?.title ?? "-"}</p>}
                {visibleApplicants.length === 0 && <p className={styles.mutedText}>No applicants for this filter.</p>}
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
                                        {actionInProgress === `${applicant.applicationId}:Accepted` ? "Accepting..." : "Accept"}
                                    </button>
                                    <button
                                        className={`${styles.button} ${styles.buttonSecondary}`}
                                        disabled={actionInProgress !== null}
                                        onClick={() => handleStatusUpdate(applicant.applicationId, "Denied")}
                                    >
                                        {actionInProgress === `${applicant.applicationId}:Denied` ? "Denying..." : "Deny"}
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