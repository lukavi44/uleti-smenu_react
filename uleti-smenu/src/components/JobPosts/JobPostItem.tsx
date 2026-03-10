import Card from "../UI/Card/Card"
import { JobPost } from "../../models/JobPost.model";
import { getImageUrl } from "../../helpers/getHelperUrl";
import { useContext, useState } from "react";
import { AuthContext } from "../../store/Auth-context";
import { ApplyToJobPost } from "../../services/application-service";
import { toast } from "react-toastify";

interface JobPostItemProps {
    jobPost: JobPost;
  }

  const JobPostItem = ({ jobPost }: JobPostItemProps) => {
    const { role, isLoggedIn } = useContext(AuthContext);
    const [isApplying, setIsApplying] = useState(false);

    const handleApply = async () => {
      setIsApplying(true);
      try {
        await ApplyToJobPost(jobPost.id);
        toast.success("Successfully applied for this shift.");
      } catch (error) {
        toast.error("Unable to apply for this shift.");
      } finally {
        setIsApplying(false);
      }
    };

    return (
      <div>
        <Card
          title={jobPost.title}
          img={getImageUrl(jobPost.employer?.profilePhoto)}
          description={`${jobPost.description}${jobPost.restaurantLocationName ? ` | Location: ${jobPost.restaurantLocationName}${jobPost.restaurantLocationCity ? ` (${jobPost.restaurantLocationCity})` : ""}` : ""}`}
          orientation="horizontal"
        />
        {isLoggedIn && role === "Employee" && (
          <button onClick={handleApply} disabled={isApplying}>
            {isApplying ? "Applying..." : "Apply"}
          </button>
        )}
      </div>
    );
  };

export default JobPostItem;