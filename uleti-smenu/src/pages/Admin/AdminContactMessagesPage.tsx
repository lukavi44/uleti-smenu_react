import { useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AdminListPage from "../../components/Admin/AdminListPage";
import styles from "../../components/Admin/AdminListPage.module.scss";
import { getAdminContactMessages } from "../../services/admin-service";
import { formatDisplayDateTime } from "../../helpers/formatDisplayDateTime";

const AdminContactMessagesPage = () => {
  const { t } = useTranslation();

  const statusLabel = (status: string) => {
    const key = `admin.contactMessages.status.${status}`;
    const translated = t(key);
    return translated === key ? status : translated;
  };

  const fetchItems = useCallback(
    async (params: { search: string; status: string; page: number; pageSize: number }) => {
      const response = await getAdminContactMessages({
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
      searchPlaceholder={t("admin.contactMessages.searchPlaceholder")}
      emptyMessage={t("admin.contactMessages.empty")}
      showStatusFilter
      statusOptions={[
        { value: "all", label: t("admin.contactMessages.allStatuses") },
        { value: "Open", label: t("admin.contactMessages.status.Open") },
        { value: "Resolved", label: t("admin.contactMessages.status.Resolved") },
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
          key: "from",
          header: t("admin.contactMessages.columns.from"),
          render: (item) => (
            <div>
              <p className={styles.cardTitle}>{item.name}</p>
              <p className={styles.cardMeta}>{item.email}</p>
            </div>
          ),
        },
        {
          key: "subject",
          header: t("admin.contactMessages.columns.subject"),
          render: (item) => item.subject,
        },
        {
          key: "created",
          header: t("admin.contactMessages.columns.created"),
          render: (item) => formatDisplayDateTime(item.createdAtUtc) || "—",
        },
        {
          key: "status",
          header: t("admin.contactMessages.columns.status"),
          render: (item) => (
            <span className={`${styles.badge} ${item.status === "Open" ? styles.badgeActive : ""}`}>
              {statusLabel(item.status)}
            </span>
          ),
        },
        {
          key: "actions",
          header: t("admin.contactMessages.columns.actions"),
          render: (item) => (
            <Link className={styles.linkButton} to={`/admin/contact-messages/${item.id}`}>
              {t("admin.contactMessages.viewDetails")}
            </Link>
          ),
        },
      ]}
      renderMobileCard={(item) => (
        <>
          <h3 className={styles.cardTitle}>{item.subject}</h3>
          <p className={styles.cardSubtitle}>
            {item.name} · {item.email}
          </p>
          <p className={styles.cardMeta}>
            {statusLabel(item.status)} · {formatDisplayDateTime(item.createdAtUtc)}
          </p>
          <Link className={styles.linkButton} to={`/admin/contact-messages/${item.id}`}>
            {t("admin.contactMessages.viewDetails")}
          </Link>
        </>
      )}
    />
  );
};

export default AdminContactMessagesPage;
