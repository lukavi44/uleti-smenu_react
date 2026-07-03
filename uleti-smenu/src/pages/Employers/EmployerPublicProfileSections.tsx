import { useEffect, useState } from "react";
import {
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  InformationCircleIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CandidateProfileAccordion from "../../components/Candidate/CandidateProfileAccordion";
import LoadMoreButton from "../../components/Common/LoadMoreButton";
import RichReviewList from "../../components/Reviews/RichReviewList";
import { CANDIDATE_SECTION_PAGE_SIZE, LIST_PAGE_SIZE } from "../../constants/pagination";
import { mapReviewToRichItem } from "../../helpers/mapReviewPageToRich";
import { useLazyLoadList } from "../../hooks/useLazyLoadList";
import { EmployerPublicProfile } from "../../models/EmployerPublicProfile.model";
import { Review } from "../../models/Review.model";
import { GetEmployerReviewPage } from "../../services/review-service";
import styles from "./EmployerPublicProfileSections.module.scss";

interface EmployerPublicProfileSectionsProps {
  slug: string;
  profile: EmployerPublicProfile;
  appliedJobPostIdSet: Set<string>;
  applyInProgressForPostId: string | null;
  onApply: (jobPostId: string) => void;
}

const formatAddress = (location: EmployerPublicProfile["locations"][number]) => {
  const street = [location.streetName, location.streetNumber].filter(Boolean).join(" ");
  const cityLine = [location.postalCode, location.city].filter(Boolean).join(" ");
  return [street, cityLine, location.country].filter(Boolean).join(", ");
};

const formatDate = (value: string) => {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }
  return parsedDate.toLocaleString();
};

const SectionSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <div className={styles.skeletonList} aria-hidden="true">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className={styles.skeletonCard} />
    ))}
  </div>
);

const LocationsAccordion = ({ profile }: { profile: EmployerPublicProfile }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <CandidateProfileAccordion
      title={t("employerProfile.locations")}
      icon={<MapPinIcon />}
      itemCount={profile.locations.length}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      {profile.locations.length === 0 ? (
        <p className={styles.mutedText}>{t("employerProfile.noLocations")}</p>
      ) : (
        <div className={styles.locationList}>
          {profile.locations.map((location) => (
            <article key={location.id} className={styles.locationCard}>
              <h3>{location.name}</h3>
              {location.phoneNumber ? (
                <p className={styles.meta}>{location.phoneNumber}</p>
              ) : null}
              <p className={styles.jobMeta}>{formatAddress(location)}</p>
            </article>
          ))}
        </div>
      )}
    </CandidateProfileAccordion>
  );
};

const ActiveJobPostsAccordion = ({
  profile,
  appliedJobPostIdSet,
  applyInProgressForPostId,
  onApply,
}: Pick<
  EmployerPublicProfileSectionsProps,
  "profile" | "appliedJobPostIdSet" | "applyInProgressForPostId" | "onApply"
>) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const {
    visibleItems: visibleJobPosts,
    hasMore,
    loadMore,
  } = useLazyLoadList(profile.activeJobPosts, LIST_PAGE_SIZE, profile.employerId);

  return (
    <CandidateProfileAccordion
      title={t("employerProfile.activeJobPosts")}
      icon={<BriefcaseIcon />}
      itemCount={profile.activeJobPosts.length}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      {profile.activeJobPosts.length === 0 ? (
        <p className={styles.mutedText}>{t("employerProfile.noActiveJobPosts")}</p>
      ) : (
        <>
          <div className={styles.jobPostList}>
            {visibleJobPosts.map((jobPost) => {
              const hasApplied = appliedJobPostIdSet.has(jobPost.id);
              return (
                <article key={jobPost.id} className={styles.jobPostCard}>
                  <h3>{jobPost.title}</h3>
                  <p className={styles.meta}>{jobPost.position}</p>
                  <p className={styles.jobMeta}>
                    {t("employerProfile.shiftDate")}: {formatDate(jobPost.startingDate)}
                  </p>
                  <p className={styles.jobMeta}>
                    {t("employerProfile.salary")}: {jobPost.salary} RSD
                  </p>
                  {(jobPost.restaurantLocationName || jobPost.restaurantLocationCity) && (
                    <p className={styles.jobMeta}>
                      {t("employerProfile.location")}:{" "}
                      {[jobPost.restaurantLocationName, jobPost.restaurantLocationCity]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  <div className={styles.jobPostActions}>
                    {hasApplied ? (
                      <span className={styles.appliedBadge}>{t("jobPosts.alreadyApplied")}</span>
                    ) : null}
                    <button
                      type="button"
                      className={styles.applyButton}
                      disabled={hasApplied || applyInProgressForPostId !== null}
                      onClick={() => onApply(jobPost.id)}
                    >
                      {applyInProgressForPostId === jobPost.id
                        ? t("jobPosts.applying")
                        : hasApplied
                          ? t("jobPosts.appliedShort")
                          : t("jobPosts.apply")}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          <LoadMoreButton hasMore={hasMore} isLoading={false} onLoadMore={loadMore} />
          <Link className={styles.jobPostLink} to="/oglasi-za-posao">
            {t("employerProfile.browseAllJobPosts")}
          </Link>
        </>
      )}
    </CandidateProfileAccordion>
  );
};

const ReviewsAccordion = ({
  employerId,
  slug,
  reviewCount,
  averageRating,
}: {
  employerId: string;
  slug: string;
  reviewCount: number;
  averageRating: number;
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(reviewCount > 0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!isOpen || reviewCount === 0) {
      return;
    }

    let active = true;

    const loadReviews = async () => {
      setIsLoading(true);
      setLoadError(false);

      try {
        const response = await GetEmployerReviewPage(employerId);
        if (!active) {
          return;
        }
        setReviews(response.data.reviews);
      } catch {
        if (active) {
          setReviews([]);
          setLoadError(true);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadReviews();

    return () => {
      active = false;
    };
  }, [employerId, isOpen, reviewCount]);

  const {
    visibleItems: visibleReviews,
    hasMore,
    loadMore,
  } = useLazyLoadList(reviews, CANDIDATE_SECTION_PAGE_SIZE, employerId);

  return (
    <CandidateProfileAccordion
      title={t("employerProfile.reviewsAboutRestaurant")}
      icon={<ChatBubbleLeftRightIcon />}
      itemCount={reviewCount}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className={styles.scrollArea}>
        {reviewCount > 0 && (
          <p className={styles.reviewSummary}>
            ★ {averageRating.toFixed(1)} · {reviewCount} {t("reviews.reviewCountLabel")}
          </p>
        )}

        {isLoading && reviews.length === 0 ? (
          <SectionSkeleton />
        ) : loadError ? (
          <p className={styles.mutedText}>{t("reviews.loadError")}</p>
        ) : reviews.length === 0 ? (
          <p className={styles.mutedText}>{t("reviews.noReviews")}</p>
        ) : (
          <>
            <RichReviewList
              reviews={visibleReviews.map(mapReviewToRichItem)}
              recommendsLabelKey="restaurantReviews.recommends"
              verifiedBadgeMode="whenVerified"
            />
            <LoadMoreButton hasMore={hasMore} isLoading={false} onLoadMore={loadMore} />
            <Link className={styles.viewAllReviewsLink} to={`/restaurants/${slug}/reviews`}>
              {t("employerProfile.viewAllReviews")}
            </Link>
          </>
        )}
      </div>
    </CandidateProfileAccordion>
  );
};

const AboutAccordion = ({ profile }: { profile: EmployerPublicProfile }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <CandidateProfileAccordion
      title={t("employerProfile.aboutRestaurant")}
      icon={<InformationCircleIcon />}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className={styles.aboutContent}>
        {profile.phoneNumber ? (
          <p className={styles.aboutRow}>
            <span>{t("employerProfile.contactPhone")}</span>
            <strong>{profile.phoneNumber}</strong>
          </p>
        ) : null}
        <p className={styles.aboutDescription}>{t("employerProfile.aboutDescription")}</p>
      </div>
    </CandidateProfileAccordion>
  );
};

const EmployerPublicProfileSections = ({
  slug,
  profile,
  appliedJobPostIdSet,
  applyInProgressForPostId,
  onApply,
}: EmployerPublicProfileSectionsProps) => (
  <div className={styles.sections}>
    <LocationsAccordion profile={profile} />
    <ActiveJobPostsAccordion
      profile={profile}
      appliedJobPostIdSet={appliedJobPostIdSet}
      applyInProgressForPostId={applyInProgressForPostId}
      onApply={onApply}
    />
    <ReviewsAccordion
      employerId={profile.employerId}
      slug={slug}
      reviewCount={profile.reviewSummary.reviewCount}
      averageRating={profile.reviewSummary.averageRating}
    />
    <AboutAccordion profile={profile} />
  </div>
);

export default EmployerPublicProfileSections;
