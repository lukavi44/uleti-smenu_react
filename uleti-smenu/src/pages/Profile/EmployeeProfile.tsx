import { getImageUrl } from "../../helpers/getHelperUrl";
import { Employee } from "../../models/User.model";
import { ChangeEvent, useEffect, useState } from "react";
import { EmployeeApplication } from "../../models/Application.model";
import { CancelMyApplication, GetMyApplications } from "../../services/application-service";
import { UpdateMyProfilePhoto } from "../../services/user-service";
import { toast } from "react-toastify";

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
    const [cancelInProgressId, setCancelInProgressId] = useState<string | null>(null);
    const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>(getImageUrl(user.profilePhoto));
    const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
    const [isPhotoUploadInProgress, setIsPhotoUploadInProgress] = useState<boolean>(false);

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

    return <>
        <img src={profilePhotoUrl} alt="Profile" height={200} width={200} />
        <div>
            <input type="file" accept="image/*" onChange={handleProfilePhotoChange} />
            <button disabled={isPhotoUploadInProgress} onClick={handleProfilePhotoUpload}>
                {isPhotoUploadInProgress ? "Updating photo..." : "Update photo"}
            </button>
        </div>
        <h1>{user.firstName} {user.lastName}</h1>
        <p>{user.email}</p>
        <hr />
        <h2>My applications</h2>
        <label htmlFor="myApplicationStatusFilter">Filter by status:</label>
        <select
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
        {visibleApplications.length === 0 && <p>No applications for this filter.</p>}
        {visibleApplications.map((application) => (
            <div key={application.applicationId}>
                <p>{application.jobPostTitle}</p>
                <p>{application.employerName}</p>
                <p>
                    Status: <span style={getStatusBadgeStyle(application.status)}>{application.status}</span>
                </p>
                {application.status === "Applied" && (
                    <button
                        disabled={cancelInProgressId !== null}
                        onClick={() => handleCancel(application.applicationId)}
                    >
                        {cancelInProgressId === application.applicationId ? "Cancelling..." : "Cancel application"}
                    </button>
                )}
            </div>
        ))}
        <ul>
            <li>
                
            </li>
        </ul>
        </>;
};

export default EmployeeProfile;