import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Footer from "../../components/Footer/Footer";
import PlatformShiftList from "../../components/Profile/PlatformShiftList";
import RatingBadge from "../../components/Reviews/RatingBadge";
import { getImageUrl } from "../../helpers/getHelperUrl";
import { EmployeePublicProfile } from "../../models/WorkExperience.model";
import { GetEmployeePublicProfile } from "../../services/employee-profile-service";
import { AuthContext } from "../../store/Auth-context";
import styles from "./EmployeePublicProfilePage.module.scss";

const EmployeePublicProfilePage = () => {
  const { t } = useTranslation();
  const { employeeId } = useParams();
  const { authStatus, role } = useContext(AuthContext);
  const [profile, setProfile] = useState<EmployeePublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!employeeId) {
        setLoadError(true);
        setIsLoading(false);
        return;
      }

      try {
        const response = await GetEmployeePublicProfile(employeeId);
        setProfile(response.data);
        setLoadError(false);
      } catch {
        setProfile(null);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (authStatus === "authenticated" && role === "Employer") {
      void loadProfile();
    }
  }, [authStatus, role, employeeId]);

  if (authStatus === "loading") {
    return <div className={styles.page}>{t("common.loading")}</div>;
  }

  if (authStatus === "unauthenticated" || role !== "Employer") {
    return <div className={styles.page}>{t("common.unauthorized")}</div>;
  }

  return (
    <>
      <main className={styles.page}>
        <Link className={styles.backLink} to="/profile">
          {t("employeeProfile.backToProfile")}
        </Link>

        {isLoading && <p className={styles.mutedText}>{t("common.loading")}</p>}
        {loadError && !isLoading && <p className={styles.mutedText}>{t("employeeProfile.loadError")}</p>}

        {!isLoading && !loadError && profile && (
          <>
            <header className={styles.header}>
              <img
                src={getImageUrl(profile.profilePhoto)}
                alt={profile.firstName}
                className={styles.photo}
              />
              <div>
                <h1>
                  {profile.firstName} {profile.lastName}
                </h1>
                <RatingBadge
                  averageRating={profile.reviewSummary.averageRating}
                  reviewCount={profile.reviewSummary.reviewCount}
                  subjectType="employee"
                  subjectId={employeeId}
                />
                <p className={styles.meta}>{profile.email}</p>
                <p className={styles.meta}>{profile.phoneNumber}</p>
              </div>
            </header>

            <section className={styles.section}>
              <h2>{t("employeeProfile.workExperience")}</h2>
              {profile.workExperiences.length === 0 ? (
                <p className={styles.mutedText}>{t("employeeProfile.noExperience")}</p>
              ) : (
                <div className={styles.experienceList}>
                  {profile.workExperiences.map((experience) => (
                    <article key={experience.id} className={styles.experienceCard}>
                      <h3>{experience.position}</h3>
                      <p className={styles.company}>{experience.companyName}</p>
                      <p className={styles.dates}>
                        {new Date(experience.startDate).toLocaleDateString()} –{" "}
                        {experience.endDate
                          ? new Date(experience.endDate).toLocaleDateString()
                          : t("employeeProfile.present")}
                      </p>
                      {experience.description && <p>{experience.description}</p>}
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className={styles.section}>
              <h2>{t("employeeProfile.platformHistory")}</h2>
              <PlatformShiftList shifts={profile.platformShifts} />
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
};

export default EmployeePublicProfilePage;
