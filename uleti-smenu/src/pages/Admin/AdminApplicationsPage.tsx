import { useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AdminListPage from "../../components/Admin/AdminListPage";
import styles from "../../components/Admin/AdminListPage.module.scss";
import { getAdminApplications } from "../../services/admin-service";
import { formatDisplayDate } from "../../helpers/formatDisplayDate";

const AdminApplicationsPage = () => {
  const { t } = useTranslation();

  const statusLabel = (status: string) => {
    const key = `admin.applicationStatus.${status}`;
    const translated = t(key);
    return translated === key ? status : translated;
  };

  const fetchItems = useCallback(
    async (params: { search: string; status: string; page: number; pageSize: number }) => {
      const response = await getAdminApplications({
        search: params.search.trim() || undefined,
        status: params.status === "all" ? undefined : params.status,
        page: params.page,
        pageSize: params.pageSize,
      });
      return { items: response.data.items, totalCount: response.data.totalCount };
    },
    []
  );

  return (
    <AdminListPage
      searchPlaceholder={t("admin.applications.searchPlaceholder")}
      emptyMessage={t("admin.applications.empty")}
      showStatusFilter
      statusOptions={[
        { value: "all", label: t("admin.applications.allStatuses") },
        { value: "Applied", label: t("admin.applicationStatus.Applied") },
        { value: "Accepted", label: t("admin.applicationStatus.Accepted") },
        { value: "Denied", label: t("admin.applicationStatus.Denied") },
        { value: "Cancelled", label: t("admin.applicationStatus.Cancelled") },
        { value: "Expired", label: t("admin.applicationStatus.Expired") },
      ]}
      fetchItems={(params) =>
        fetchItems({
          search: params.search,
          status: params.status,
          page: params.page,
          pageSize: params.pageSize,
        })
      }
      columns={[
        {
          key: "candidate",
          header: t("admin.applications.columns.candidate"),
          render: (item) => item.candidateName,
        },
        {
          key: "job",
          header: t("admin.jobPosts.columns.title"),
          render: (item) => (
            <Link className={styles.linkButton} to={`/admin/job-posts/${item.jobPostId}`}>
              {item.jobTitle}
            </Link>
          ),
        },
        {
          key: "employer",
          header: t("admin.restaurants.columns.employer"),
          render: (item) =>
            item.employerId ? (
              <Link className={styles.linkButton} to={`/admin/employers/${item.employerId}`}>
                {item.employerName}
              </Link>
            ) : (
              item.employerName
            ),
        },
        {
          key: "status",
          header: t("admin.employers.columns.status"),
          render: (item) => <span className={styles.badge}>{statusLabel(item.status)}</span>,
        },
        {
          key: "applied",
          header: t("admin.applications.columns.applied"),
          render: (item) => formatDisplayDate(item.appliedAtUtc),
        },
      ]}
      renderMobileCard={(item) => (
        <>
          <h3 className={styles.cardTitle}>{item.candidateName}</h3>
          <p className={styles.cardSubtitle}>{item.jobTitle}</p>
          <p className={styles.cardMeta}>
            {item.employerName} · {statusLabel(item.status)}
          </p>
          <div className={styles.cardActions}>
            <Link className={styles.linkButton} to={`/admin/job-posts/${item.jobPostId}`}>
              {t("admin.applications.openJob")}
            </Link>
            {item.employerId ? (
              <Link className={styles.linkButton} to={`/admin/employers/${item.employerId}`}>
                {t("admin.applications.openEmployer")}
              </Link>
            ) : null}
          </div>
        </>
      )}
    />
  );
};

export default AdminApplicationsPage;
