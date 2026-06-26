import Card from "../UI/Card/Card";
import cardStyles from "../UI/Card/Card.module.scss";
import { JobPost } from "../../models/JobPost.model";
import { useContext, useState, type ReactNode } from "react";
import { AuthContext } from "../../store/Auth-context";
import { ApplyToJobPost } from "../../services/application-service";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

interface JobPostItemProps {
    jobPost: JobPost;
    disableCardHover?: boolean;
    isSelected?: boolean;
    imageOverlay?: ReactNode;
  }

  const JobPostItem = ({
    jobPost,
    disableCardHover = false,
    isSelected = false,
    imageOverlay,
  }: JobPostItemProps) => {
    const { t } = useTranslation();
    const { role, isLoggedIn } = useContext(AuthContext);
    const [isApplying, setIsApplying] = useState(false);

    const handleApply = async () => {
      setIsApplying(true);
      try {
        await ApplyToJobPost(jobPost.id);
        toast.success(t("jobPosts.applySuccess"));
      } catch (error) {
        toast.error(t("jobPosts.applyError"));
      } finally {
        setIsApplying(false);
      }
    };

    return (
      <div>
        <Card
          title={jobPost.title}
          img={jobPost.employer?.profilePhoto}
          description={`${jobPost.description}${jobPost.restaurantLocationName ? ` | ${t("jobPosts.location")}: ${jobPost.restaurantLocationName}${jobPost.restaurantLocationCity ? ` (${jobPost.restaurantLocationCity})` : ""}` : ""}`}
          orientation="horizontal"
          className={`${disableCardHover ? cardStyles.noHover : ""} ${isSelected ? cardStyles.selected : ""}`}
          imageOverlay={imageOverlay}
        />
        {isLoggedIn && role === "Employee" && (
          <button onClick={handleApply} disabled={isApplying}>
            {isApplying ? t("jobPosts.applying") : t("jobPosts.apply")}
          </button>
        )}
      </div>
    );
  };

export default JobPostItem;
