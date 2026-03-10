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
            toast.success("Franchise branch added.");
        } catch {
            toast.error("Failed to add franchise branch.");
        } finally {
            setIsCreatingLocation(false);
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
            <p>PIB: {user.pib}</p>
            <p>MB: {user.mb}</p>
            <hr />
            <h2>Add restaurant branch</h2>
            <div>
                <input
                    type="text"
                    placeholder="Restaurant name"
                    value={newBranch.name}
                    onChange={(e) => handleBranchFieldChange("name", e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Phone number"
                    value={newBranch.phoneNumber}
                    onChange={(e) => handleBranchFieldChange("phoneNumber", e.target.value)}
                />
                <input type="text" value={user.pib} disabled />
                <input type="text" value={user.mb} disabled />
                <input
                    type="text"
                    placeholder="Street name"
                    value={newBranch.streetName}
                    onChange={(e) => handleBranchFieldChange("streetName", e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Street number"
                    value={newBranch.streetNumber}
                    onChange={(e) => handleBranchFieldChange("streetNumber", e.target.value)}
                />
                <input
                    type="text"
                    placeholder="City"
                    value={newBranch.city}
                    onChange={(e) => handleBranchFieldChange("city", e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Postal code"
                    value={newBranch.postalCode}
                    onChange={(e) => handleBranchFieldChange("postalCode", e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Country"
                    value={newBranch.country}
                    onChange={(e) => handleBranchFieldChange("country", e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Region"
                    value={newBranch.region}
                    onChange={(e) => handleBranchFieldChange("region", e.target.value)}
                />
                <button disabled={isCreatingLocation} onClick={handleCreateBranch}>
                    {isCreatingLocation ? "Adding branch..." : "Add franchise branch"}
                </button>
            </div>
            <h3>Your branches</h3>
            {locations.length === 0 && <p>No branches yet.</p>}
            {locations.map((location) => (
                <div key={location.id}>
                    <strong>{location.name}</strong> - {location.city}, {location.streetName} {location.streetNumber} ({location.phoneNumber})
                </div>
            ))}
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