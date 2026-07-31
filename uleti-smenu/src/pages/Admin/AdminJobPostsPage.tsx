import { useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AdminListPage from "../../components/Admin/AdminListPage";
import styles from "../../components/Admin/AdminListPage.module.scss";
import { getAdminJobPosts } from "../../services/admin-service";
import { formatDisplayDate } from "../../helpers/formatDisplayDate";

const AdminJobPostsPage = () => {
  const { t } = useTranslation();

  const statusLabel = (status: string) => {
    const key = `admin.jobStatus.${status}`;
    const translated = t(key);
    return translated === key ? status : translated;
  };

  const fetchItems = useCallback(
    async (params: { search: string; status: string; page: number; pageSize: number }) => {
      const response = await getAdminJobPosts({
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
      searchPlaceholder={t("admin.jobPosts.searchPlaceholder")}
      emptyMessage={t("admin.jobPosts.empty")}
      showStatusFilter
      statusOptions={[
        { value: "all", label: t("admin.jobPosts.allStatuses") },
        { value: "Active", label: t("admin.jobStatus.Active") },
        { value: "Draft", label: t("admin.jobStatus.Draft") },
        { value: "Completed", label: t("admin.jobStatus.Completed") },
        { value: "Expired", label: t("admin.jobStatus.Expired") },
        { value: "Cancelled", label: t("admin.jobStatus.Cancelled") },
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
        { key: "title", header: t("admin.jobPosts.columns.title"), render: (item) => item.title },
        {
          key: "position",
          header: t("admin.jobPosts.columns.position"),
          render: (item) => item.position || "—",
        },
        {
          key: "employer",
          header: t("admin.restaurants.columns.employer"),
          render: (item) => (
            <Link className={styles.linkButton} to={`/admin/employers/${item.employerId}`}>
              {item.employerName}
            </Link>
          ),
        },
        { key: "location", header: t("jobPosts.location"), render: (item) => item.locationName ?? "—" },
        {
          key: "starting",
          header: t("admin.jobPosts.columns.startingDate"),
          render: (item) => formatDisplayDate(item.startingDate) || "—",
        },
        {
          key: "applications",
          header: t("admin.candidates.columns.applications"),
          render: (item) => item.applicationsCount,
        },
        {
          key: "status",
          header: t("admin.employers.columns.status"),
          render: (item) => (
            <span className={`${styles.badge} ${item.status === "Active" ? styles.badgeActive : ""}`}>
              {statusLabel(item.status)}
            </span>
          ),
        },
        {
          key: "actions",
          header: t("admin.jobPosts.columns.actions"),
          render: (item) => (
            <Link className={styles.linkButton} to={`/admin/job-posts/${item.id}`}>
              {t("admin.jobPosts.viewDetails")}
            </Link>
          ),
        },
      ]}
      renderMobileCard={(item) => (
        <>
          <h3 className={styles.cardTitle}>{item.title}</h3>
          <p className={styles.cardSubtitle}>{item.employerName}</p>
          <p className={styles.cardMeta}>
            {statusLabel(item.status)} · {formatDisplayDate(item.startingDate)}
          </p>
          <Link className={styles.linkButton} to={`/admin/job-posts/${item.id}`}>
            {t("admin.jobPosts.viewDetails")}
          </Link>
        </>
      )}
    />
  );
};

export default AdminJobPostsPage;
