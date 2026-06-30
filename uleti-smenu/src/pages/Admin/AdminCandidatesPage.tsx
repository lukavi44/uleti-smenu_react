import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import AdminListPage from "../../components/Admin/AdminListPage";
import styles from "../../components/Admin/AdminListPage.module.scss";
import { getAdminCandidates } from "../../services/admin-service";

const AdminCandidatesPage = () => {
  const { t } = useTranslation();

  const fetchItems = useCallback(
    async (params: { search: string; city: string; page: number; pageSize: number }) => {
      const response = await getAdminCandidates({
        search: params.search.trim() || undefined,
        city: params.city.trim() || undefined,
        page: params.page,
        pageSize: params.pageSize,
      });
      return { items: response.data.items, totalCount: response.data.totalCount };
    },
    []
  );

  return (
    <AdminListPage
      searchPlaceholder={t("admin.candidates.searchPlaceholder")}
      emptyMessage={t("admin.candidates.empty")}
      showCityFilter
      fetchItems={(params) =>
        fetchItems({
          search: params.search,
          city: params.city,
          page: params.page,
          pageSize: params.pageSize,
        })
      }
      columns={[
        {
          key: "name",
          header: t("admin.candidates.columns.name"),
          render: (item) => `${item.firstName} ${item.lastName}`,
        },
        { key: "email", header: t("admin.employers.columns.email"), render: (item) => item.email },
        { key: "phone", header: t("admin.candidates.columns.phone"), render: (item) => item.phoneNumber },
        { key: "city", header: t("admin.employers.columns.city"), render: (item) => item.city ?? "—" },
        {
          key: "applications",
          header: t("admin.candidates.columns.applications"),
          render: (item) => item.applicationsCount,
        },
      ]}
      renderMobileCard={(item) => (
        <>
          <h3 className={styles.cardTitle}>
            {item.firstName} {item.lastName}
          </h3>
          <p className={styles.cardSubtitle}>{item.city ?? "—"}</p>
          <p className={styles.cardMeta}>{item.email}</p>
          <p className={styles.cardMeta}>
            {t("admin.candidates.columns.applications")}: {item.applicationsCount}
          </p>
        </>
      )}
    />
  );
};

export default AdminCandidatesPage;
