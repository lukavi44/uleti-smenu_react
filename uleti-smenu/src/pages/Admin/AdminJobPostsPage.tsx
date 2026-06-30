import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import AdminListPage from "../../components/Admin/AdminListPage";
import styles from "../../components/Admin/AdminListPage.module.scss";
import { getAdminJobPosts } from "../../services/admin-service";

const AdminJobPostsPage = () => {
  const { t } = useTranslation();

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

  const formatDate = (value: string) => new Date(value).toLocaleDateString();

  return (
    <AdminListPage
      searchPlaceholder={t("admin.jobPosts.searchPlaceholder")}
      emptyMessage={t("admin.jobPosts.empty")}
      showStatusFilter
      statusOptions={[
        { value: "all", label: t("admin.jobPosts.allStatuses") },
        { value: "Active", label: t("admin.status.active") },
        { value: "Draft", label: "Draft" },
        { value: "Completed", label: t("admin.employerDetail.completedShifts") },
        { value: "Expired", label: "Expired" },
        { value: "Cancelled", label: "Cancelled" },
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
          key: "employer",
          header: t("admin.restaurants.columns.employer"),
          render: (item) => item.employerName,
        },
        { key: "location", header: t("jobPosts.location"), render: (item) => item.locationName ?? "—" },
        {
          key: "applications",
          header: t("admin.candidates.columns.applications"),
          render: (item) => item.applicationsCount,
        },
        {
          key: "created",
          header: t("admin.employers.columns.created"),
          render: (item) => formatDate(item.createdAtUtc),
        },
        {
          key: "status",
          header: t("admin.employers.columns.status"),
          render: (item) => (
            <span className={`${styles.badge} ${item.status === "Active" ? styles.badgeActive : ""}`}>
              {item.status}
            </span>
          ),
        },
      ]}
      renderMobileCard={(item) => (
        <>
          <h3 className={styles.cardTitle}>{item.title}</h3>
          <p className={styles.cardSubtitle}>{item.employerName}</p>
          <p className={styles.cardMeta}>
            {item.status} · {formatDate(item.createdAtUtc)}
          </p>
        </>
      )}
    />
  );
};

export default AdminJobPostsPage;
