import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AdminEmployerListItem } from "../../models/Admin.model";
import { getAdminEmployers } from "../../services/admin-service";
import AdminStatusBadge from "../../components/Admin/AdminStatusBadge";
import { formatDisplayDate } from "../../helpers/formatDisplayDate";
import styles from "./AdminEmployersPage.module.scss";

const PAGE_SIZE = 10;

const AdminEmployersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState<AdminEmployerListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmployers = async () => {
      setLoading(true);
      try {
        const response = await getAdminEmployers({
          search: search.trim() || undefined,
          status: status === "all" ? undefined : status,
          city: city.trim() || undefined,
          page,
          pageSize: PAGE_SIZE,
        });
        setItems(response.data.items);
        setTotalCount(response.data.totalCount);
      } catch {
        setItems([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    void loadEmployers();
  }, [search, status, city, page]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const renderAvatar = (employer: AdminEmployerListItem, className: string, fallbackClassName: string) =>
    employer.profilePhoto ? (
      <img src={employer.profilePhoto} alt="" className={className} />
    ) : (
      <span className={`${className} ${fallbackClassName}`}>{employer.name.charAt(0).toUpperCase()}</span>
    );

  const formatDate = (value?: string) => {
    if (!value) {
      return "—";
    }
    return formatDisplayDate(value) || "—";
  };

  return (
    <div className={styles.page}>
      <div className={styles.filters}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder={t("admin.employers.searchPlaceholder")}
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
        />
        <select
          className={styles.selectInput}
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value);
          }}
        >
          <option value="all">{t("admin.employers.allStatuses")}</option>
          <option value="Active">{t("admin.status.active")}</option>
          <option value="Suspended">{t("admin.status.suspended")}</option>
        </select>
        <input
          type="search"
          className={styles.selectInput}
          placeholder={t("admin.employers.allCities")}
          value={city}
          onChange={(event) => {
            setPage(1);
            setCity(event.target.value);
          }}
        />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t("admin.employers.columns.employer")}</th>
              <th>{t("admin.employers.columns.email")}</th>
              <th>{t("admin.employers.columns.pib")}</th>
              <th>{t("admin.employers.columns.city")}</th>
              <th>{t("admin.employers.columns.status")}</th>
              <th>{t("admin.employers.columns.verified")}</th>
              <th>{t("admin.employers.columns.created")}</th>
              <th>{t("admin.employers.columns.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((employer) => (
              <tr key={employer.id}>
                <td>
                  <div className={styles.employerCell}>
                    {renderAvatar(employer, styles.avatar, styles.avatarFallback)}
                    <div>
                      <p className={styles.employerName}>{employer.name}</p>
                    </div>
                  </div>
                </td>
                <td>{employer.email}</td>
                <td>{employer.pib}</td>
                <td>{employer.city}</td>
                <td>
                  <AdminStatusBadge kind={employer.status === "Suspended" ? "suspended" : "active"} />
                </td>
                <td>
                  <AdminStatusBadge kind={employer.isVerifiedEmployer ? "verified" : "notVerified"} />
                </td>
                <td>{formatDate(employer.createdAtUtc)}</td>
                <td>
                  <button
                    type="button"
                    className={styles.linkButton}
                    onClick={() => navigate(`/admin/employers/${employer.id}`)}
                  >
                    {t("admin.employers.viewDetails")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.cards}>
        {items.map((employer) => (
          <article key={employer.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIdentity}>
                {renderAvatar(employer, styles.cardAvatar, styles.cardAvatarFallback)}
                <div>
                  <h3 className={styles.cardTitle}>{employer.name}</h3>
                  <p className={styles.cardSubtitle}>{employer.city}</p>
                </div>
              </div>
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => navigate(`/admin/employers/${employer.id}`)}
              >
                ···
              </button>
            </div>
            <div className={styles.cardBadges}>
              <AdminStatusBadge kind={employer.status === "Suspended" ? "suspended" : "active"} />
              {employer.isVerifiedEmployer ? <AdminStatusBadge kind="verified" /> : null}
            </div>
            <div className={styles.cardFooter}>
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => navigate(`/admin/employers/${employer.id}`)}
              >
                {t("admin.employers.viewDetails")}
              </button>
            </div>
          </article>
        ))}
      </div>

      {!loading && items.length === 0 ? <p className={styles.emptyState}>{t("admin.employers.empty")}</p> : null}

      <div className={styles.pagination}>
        <button
          type="button"
          className={styles.pageButton}
          disabled={page <= 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          {t("jobPosts.previousPage")}
        </button>
        <span className={styles.pageInfo}>{t("jobPosts.pageOf", { page, totalPages })}</span>
        <button
          type="button"
          className={styles.pageButton}
          disabled={page >= totalPages}
          onClick={() => setPage((current) => current + 1)}
        >
          {t("jobPosts.nextPage")}
        </button>
      </div>
    </div>
  );
};

export default AdminEmployersPage;
