import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import AdminListPage from "../../components/Admin/AdminListPage";
import styles from "../../components/Admin/AdminListPage.module.scss";
import { getAdminBilling } from "../../services/admin-service";
import { formatDisplayDateTime } from "../../helpers/formatDisplayDateTime";

const AdminBillingPage = () => {
  const { t } = useTranslation();

  const fetchItems = useCallback(async (params: { search: string; page: number; pageSize: number }) => {
    const response = await getAdminBilling({
      search: params.search.trim() || undefined,
      page: params.page,
      pageSize: params.pageSize,
    });
    return { items: response.data.items, totalCount: response.data.totalCount };
  }, []);

  const formatDate = (value: string) => formatDisplayDateTime(value) || "—";

  return (
    <AdminListPage
      searchPlaceholder={t("admin.billing.searchPlaceholder")}
      emptyMessage={t("admin.billing.empty")}
      fetchItems={(params) =>
        fetchItems({
          search: params.search,
          page: params.page,
          pageSize: params.pageSize,
        })
      }
      columns={[
        {
          key: "employer",
          header: t("admin.restaurants.columns.employer"),
          render: (item) => item.employerName,
        },
        {
          key: "amount",
          header: t("admin.billing.columns.amount"),
          render: (item) => `${item.amount.toLocaleString()} RSD`,
        },
        { key: "type", header: t("admin.billing.columns.type"), render: (item) => item.type },
        {
          key: "date",
          header: t("admin.billing.columns.date"),
          render: (item) => formatDate(item.createdAtUtc),
        },
      ]}
      renderMobileCard={(item) => (
        <>
          <h3 className={styles.cardTitle}>{item.employerName}</h3>
          <p className={styles.cardSubtitle}>
            {item.amount.toLocaleString()} RSD · {item.type}
          </p>
          <p className={styles.cardMeta}>{formatDate(item.createdAtUtc)}</p>
        </>
      )}
    />
  );
};

export default AdminBillingPage;
