import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import AdminListPage from "../../components/Admin/AdminListPage";
import styles from "../../components/Admin/AdminListPage.module.scss";
import { getAdminApplications } from "../../services/admin-service";

const AdminApplicationsPage = () => {
  const { t } = useTranslation();

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

  const formatDate = (value: string) => new Date(value).toLocaleDateString();

  return (
    <AdminListPage
      searchPlaceholder={t("admin.applications.searchPlaceholder")}
      emptyMessage={t("admin.applications.empty")}
      showStatusFilter
      statusOptions={[
        { value: "all", label: t("admin.applications.allStatuses") },
        { value: "Applied", label: "Applied" },
        { value: "Accepted", label: "Accepted" },
        { value: "Denied", label: "Denied" },
        { value: "Cancelled", label: "Cancelled" },
        { value: "Expired", label: "Expired" },
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
        { key: "job", header: t("admin.jobPosts.columns.title"), render: (item) => item.jobTitle },
        {
          key: "employer",
          header: t("admin.restaurants.columns.employer"),
          render: (item) => item.employerName,
        },
        {
          key: "status",
          header: t("admin.employers.columns.status"),
          render: (item) => <span className={styles.badge}>{item.status}</span>,
        },
        {
          key: "applied",
          header: t("admin.applications.columns.applied"),
          render: (item) => formatDate(item.appliedAtUtc),
        },
      ]}
      renderMobileCard={(item) => (
        <>
          <h3 className={styles.cardTitle}>{item.candidateName}</h3>
          <p className={styles.cardSubtitle}>{item.jobTitle}</p>
          <p className={styles.cardMeta}>
            {item.employerName} · {item.status}
          </p>
        </>
      )}
    />
  );
};

export default AdminApplicationsPage;
