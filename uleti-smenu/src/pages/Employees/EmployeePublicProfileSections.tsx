import { useCallback, useState } from "react";
import {
  BriefcaseIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import ProfileAccordion from "../../components/Profile/ProfileAccordion";
import SectionSkeleton from "../../components/Common/SectionSkeleton";
import LoadMoreButton from "../../components/Common/LoadMoreButton";
import RichReviewList from "../../components/Reviews/RichReviewList";
import { CANDIDATE_SECTION_PAGE_SIZE } from "../../constants/pagination";
import { formatDisplayDate } from "../../helpers/formatDisplayDate";
import { mapReviewToRichItem } from "../../helpers/mapReviewPageToRich";
import { useServerLazyLoad } from "../../hooks/useServerLazyLoad";
import { Review, ReviewSummary } from "../../models/Review.model";
import {
  EmployeePlatformShift,
  EmployeePublicProfile,
  WorkExperience,
} from "../../models/WorkExperience.model";
import {
  GetEmployeePublicPlatformShifts,
  GetEmployeePublicReviews,
  GetEmployeePublicWorkExperiences,
} from "../../services/employee-profile-service";
import styles from "./EmployeePublicProfileSections.module.scss";

interface EmployeePublicProfileSectionsProps {
  employeeId: string;
  profile: EmployeePublicProfile;
}

const formatShiftDate = (value: string) => {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }
  return parsedDate.toLocaleDateString();
};

const ReviewsAccordion = ({
  employeeId,
  reviewSummary,
  itemCount,
}: {
  employeeId: string;
  reviewSummary: ReviewSummary;
  itemCount: number;
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);

  const fetchReviews = useCallback(
    async (page: number) => {
      const response = await GetEmployeePublicReviews(employeeId, page, CANDIDATE_SECTION_PAGE_SIZE);
      return {
        items: response.data.items,
        totalCount: response.data.totalCount,
      };
    },
    [employeeId]
  );

  const {
    items: reviews,
    hasMore,
    loadMore,
    isLoading,
    isLoadingMore,
  } = useServerLazyLoad<Review>(fetchReviews, `${employeeId}-reviews`, isOpen);

  return (
    <ProfileAccordion
      title={t("reviews.receivedAboutEmployee")}
      icon={<ChatBubbleLeftRightIcon />}
      itemCount={itemCount}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className={styles.scrollArea}>
        {reviewSummary.reviewCount > 0 && (
          <p className={styles.reviewSummary}>
            ★ {reviewSummary.averageRating.toFixed(1)} · {reviewSummary.reviewCount}{" "}
            {t("reviews.reviewCountLabel")}
          </p>
        )}

        {isLoading && reviews.length === 0 ? (
          <SectionSkeleton />
        ) : reviews.length === 0 ? (
          <p className={styles.mutedText}>{t("reviews.noReviews")}</p>
        ) : (
          <>
            <RichReviewList
              reviews={reviews.map(mapReviewToRichItem)}
              verifiedBadgeMode="whenVerified"
            />
            <LoadMoreButton hasMore={hasMore} isLoading={isLoadingMore} onLoadMore={loadMore} />
          </>
        )}
      </div>
    </ProfileAccordion>
  );
};

const WorkExperienceAccordion = ({
  employeeId,
  itemCount,
}: {
  employeeId: string;
  itemCount: number;
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const fetchExperiences = useCallback(
    async (page: number) => {
      const response = await GetEmployeePublicWorkExperiences(
        employeeId,
        page,
        CANDIDATE_SECTION_PAGE_SIZE
      );
      return {
        items: response.data.items,
        totalCount: response.data.totalCount,
      };
    },
    [employeeId]
  );

  const {
    items: experiences,
    hasMore,
    loadMore,
    isLoading,
    isLoadingMore,
  } = useServerLazyLoad<WorkExperience>(fetchExperiences, `${employeeId}-experience`, isOpen);

  return (
    <ProfileAccordion
      title={t("employeeProfile.workExperience")}
      icon={<BriefcaseIcon />}
      itemCount={itemCount}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className={styles.scrollArea}>
        {isLoading && experiences.length === 0 ? (
          <SectionSkeleton />
        ) : experiences.length === 0 ? (
          <p className={styles.mutedText}>{t("employeeProfile.noExperience")}</p>
        ) : (
          <>
            <div className={styles.experienceList}>
              {experiences.map((experience) => (
                <article key={experience.id} className={styles.experienceCard}>
                  <h3>{experience.position}</h3>
                  <p className={styles.company}>{experience.companyName}</p>
                  <p className={styles.dates}>
                    {formatDisplayDate(experience.startDate)} –{" "}
                    {experience.endDate
                      ? formatDisplayDate(experience.endDate)
                      : t("employeeProfile.present")}
                  </p>
                  {experience.description && <p>{experience.description}</p>}
                </article>
              ))}
            </div>
            <LoadMoreButton hasMore={hasMore} isLoading={isLoadingMore} onLoadMore={loadMore} />
          </>
        )}
      </div>
    </ProfileAccordion>
  );
};

type PlatformShiftWithId = EmployeePlatformShift & { id: string };

const PlatformShiftsAccordion = ({
  employeeId,
  itemCount,
}: {
  employeeId: string;
  itemCount: number;
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const fetchShifts = useCallback(
    async (page: number) => {
      const response = await GetEmployeePublicPlatformShifts(
        employeeId,
        page,
        CANDIDATE_SECTION_PAGE_SIZE
      );
      return {
        items: response.data.items.map((shift) => ({
          ...shift,
          id: shift.applicationId,
        })),
        totalCount: response.data.totalCount,
      };
    },
    [employeeId]
  );

  const {
    items: shifts,
    hasMore,
    loadMore,
    isLoading,
    isLoadingMore,
  } = useServerLazyLoad<PlatformShiftWithId>(fetchShifts, `${employeeId}-shifts`, isOpen);

  return (
    <ProfileAccordion
      title={t("employeeProfile.platformHistory")}
      icon={<CalendarDaysIcon />}
      itemCount={itemCount}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className={styles.scrollArea}>
        {isLoading && shifts.length === 0 ? (
          <SectionSkeleton />
        ) : shifts.length === 0 ? (
          <p className={styles.mutedText}>{t("employeeProfile.noPlatformShifts")}</p>
        ) : (
          <>
            <div className={styles.shiftList}>
              {shifts.map((shift) => (
                <article key={shift.applicationId} className={styles.shiftCard}>
                  <h4>{shift.jobPostTitle}</h4>
                  <p className={styles.meta}>
                    <span>{t("employeeProfile.employer")}:</span> {shift.employerName}
                  </p>
                  <p className={styles.meta}>
                    <span>{t("employeeProfile.position")}:</span> {shift.position}
                  </p>
                  <p className={styles.meta}>
                    <span>{t("employeeProfile.location")}:</span>{" "}
                    {shift.restaurantLocationName
                      ? `${shift.restaurantLocationName}${
                          shift.restaurantLocationCity ? ` (${shift.restaurantLocationCity})` : ""
                        }`
                      : "-"}
                  </p>
                  <p className={styles.meta}>
                    <span>{t("employeeProfile.shiftDate")}:</span> {formatShiftDate(shift.startingDate)}
                  </p>
                  <p className={styles.meta}>
                    <span>{t("employeeProfile.salary")}:</span> {shift.salary} RSD
                  </p>
                </article>
              ))}
            </div>
            <LoadMoreButton hasMore={hasMore} isLoading={isLoadingMore} onLoadMore={loadMore} />
          </>
        )}
      </div>
    </ProfileAccordion>
  );
};

const EmployeePublicProfileSections = ({ employeeId, profile }: EmployeePublicProfileSectionsProps) => (
  <div className={styles.sections}>
    <ReviewsAccordion
      employeeId={employeeId}
      reviewSummary={profile.reviewSummary}
      itemCount={profile.reviewSummary.reviewCount}
    />
    <WorkExperienceAccordion employeeId={employeeId} itemCount={profile.workExperienceCount} />
    <PlatformShiftsAccordion employeeId={employeeId} itemCount={profile.platformShiftCount} />
  </div>
);

export default EmployeePublicProfileSections;
