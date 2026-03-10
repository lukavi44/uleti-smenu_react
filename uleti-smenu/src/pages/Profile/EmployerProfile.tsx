import { getImageUrl } from "../../helpers/getHelperUrl";
import { Employer } from "../../models/User.model";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { JobPost } from "../../models/JobPost.model";
import { Applicant } from "../../models/Application.model";
import { GetMyJobPosts } from "../../services/jobPost-service";
import { GetApplicantsForJobPost, UpdateApplicationStatus } from "../../services/application-service";
import { UpdateMyProfilePhoto } from "../../services/user-service";
import { toast } from "react-toastify";

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

    const selectedJobPost = useMemo(
        () => jobPosts.find((post) => post.id === selectedJobPostId),
        [jobPosts, selectedJobPostId]
    );

    useEffect(() => {
        const loadJobPosts = async () => {
            try {
                const response = await GetMyJobPosts();
                setJobPosts(response.data);
                if (response.data.length > 0) {
                    setSelectedJobPostId(response.data[0].id);
                }
            } catch {
                toast.error("Failed to load your job posts.");
            }
        };

        loadJobPosts();
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

    return (
        <div>
            <img src={profilePhotoUrl} alt="Profile" height={200} width={200} />
            <div>
                <input type="file" accept="image/*" onChange={handleProfilePhotoChange} />
                <button disabled={isPhotoUploadInProgress} onClick={handleProfilePhotoUpload}>
                    {isPhotoUploadInProgress ? "Updating photo..." : "Update photo"}
                </button>
            </div>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
            <hr />
            <h2>Applicants</h2>
            {jobPosts.length === 0 && <p>You do not have job posts yet.</p>}
            {jobPosts.length > 0 && (
                <>
                    <label htmlFor="jobPostSelect">Choose job post:</label>
                    <select
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
                    <p>Selected: {selectedJobPost?.title ?? "-"}</p>
                    <label htmlFor="statusFilter">Filter by status:</label>
                    <select
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

                    {visibleApplicants.length === 0 && <p>No applicants for this filter.</p>}
                    {visibleApplicants.map((applicant) => (
                        <div key={applicant.applicationId}>
                            <p>
                                {applicant.firstName} {applicant.lastName}{" "}
                                <span style={getStatusBadgeStyle(applicant.status)}>{applicant.status}</span>
                            </p>
                            <p>{applicant.email}</p>
                            {applicant.status === "Applied" && (
                                <>
                                    <button
                                        disabled={actionInProgress !== null}
                                        onClick={() => handleStatusUpdate(applicant.applicationId, "Accepted")}
                                    >
                                        {actionInProgress === `${applicant.applicationId}:Accepted` ? "Accepting..." : "Accept"}
                                    </button>
                                    <button
                                        disabled={actionInProgress !== null}
                                        onClick={() => handleStatusUpdate(applicant.applicationId, "Denied")}
                                    >
                                        {actionInProgress === `${applicant.applicationId}:Denied` ? "Denying..." : "Deny"}
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </>
            )}
        </div>
    )
};

export default EmployerProfile;