import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import AdminListPage from "../../components/Admin/AdminListPage";
import styles from "../../components/Admin/AdminListPage.module.scss";
import { getAdminRestaurants } from "../../services/admin-service";

const AdminRestaurantsPage = () => {
  const { t } = useTranslation();

  const fetchItems = useCallback(
    async (params: { search: string; city: string; page: number; pageSize: number }) => {
      const response = await getAdminRestaurants({
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
      searchPlaceholder={t("admin.restaurants.searchPlaceholder")}
      emptyMessage={t("admin.restaurants.empty")}
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
        { key: "name", header: t("admin.restaurants.columns.name"), render: (item) => item.name },
        {
          key: "employer",
          header: t("admin.restaurants.columns.employer"),
          render: (item) => item.employerName,
        },
        { key: "city", header: t("admin.employers.columns.city"), render: (item) => item.city },
        { key: "phone", header: t("admin.candidates.columns.phone"), render: (item) => item.phoneNumber },
      ]}
      renderMobileCard={(item) => (
        <>
          <h3 className={styles.cardTitle}>{item.name}</h3>
          <p className={styles.cardSubtitle}>{item.employerName}</p>
          <p className={styles.cardMeta}>
            {item.city} · {item.phoneNumber}
          </p>
        </>
      )}
    />
  );
};

export default AdminRestaurantsPage;
