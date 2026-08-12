import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import AdminListPage from "../../components/Admin/AdminListPage";
import UserAvatar from "../../components/Common/UserAvatar";
import styles from "../../components/Admin/AdminListPage.module.scss";
import { AdminCandidateListItem } from "../../models/Admin.model";
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

  const displayName = (item: AdminCandidateListItem) => {
    const name = `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim();
    return name || item.email || "—";
  };

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
          render: (item) => (
            <div className={styles.identityCell}>
              <UserAvatar
                name={displayName(item)}
                profilePhoto={item.profilePhoto}
                className={styles.avatar}
                fallbackClassName={styles.avatarFallback}
              />
              <span>{displayName(item)}</span>
            </div>
          ),
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
        <div className={styles.cardIdentity}>
          <UserAvatar
            name={displayName(item)}
            profilePhoto={item.profilePhoto}
            className={styles.avatar}
            fallbackClassName={styles.avatarFallback}
          />
          <div>
            <h3 className={styles.cardTitle}>{displayName(item)}</h3>
            <p className={styles.cardSubtitle}>{item.city ?? "—"}</p>
            <p className={styles.cardMeta}>{item.email}</p>
            <p className={styles.cardMeta}>
              {t("admin.candidates.columns.applications")}: {item.applicationsCount}
            </p>
          </div>
        </div>
      )}
    />
  );
};

export default AdminCandidatesPage;
