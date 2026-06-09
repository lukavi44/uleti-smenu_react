import { EmployeePlatformShift } from "../../models/WorkExperience.model";
import styles from "./PlatformShiftList.module.scss";
import { useTranslation } from "react-i18next";

interface PlatformShiftListProps {
  shifts: EmployeePlatformShift[];
}

const PlatformShiftList = ({ shifts }: PlatformShiftListProps) => {
  const { t } = useTranslation();

  const formatDate = (value: string) => {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }
    return parsedDate.toLocaleDateString();
  };

  if (shifts.length === 0) {
    return <p className={styles.mutedText}>{t("employeeProfile.noPlatformShifts")}</p>;
  }

  return (
    <div className={styles.list}>
      {shifts.map((shift) => (
        <article key={shift.applicationId} className={styles.card}>
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
              ? `${shift.restaurantLocationName}${shift.restaurantLocationCity ? ` (${shift.restaurantLocationCity})` : ""}`
              : "-"}
          </p>
          <p className={styles.meta}>
            <span>{t("employeeProfile.shiftDate")}:</span> {formatDate(shift.startingDate)}
          </p>
          <p className={styles.meta}>
            <span>{t("employeeProfile.salary")}:</span> {shift.salary} RSD
          </p>
        </article>
      ))}
    </div>
  );
};

export default PlatformShiftList;
