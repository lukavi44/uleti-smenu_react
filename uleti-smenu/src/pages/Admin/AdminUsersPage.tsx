import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { AdminUserListItem } from "../../models/Admin.model";
import { getAdminUsers, setAdminUserLockout } from "../../services/admin-service";
import AdminStatusBadge from "../../components/Admin/AdminStatusBadge";
import styles from "./AdminUsersPage.module.scss";

const PAGE_SIZE = 10;

const AdminUsersPage = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<AdminUserListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await getAdminUsers({
        search: search.trim() || undefined,
        role: role === "all" ? undefined : role,
        status: status === "all" ? undefined : status,
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

  useEffect(() => {
    void loadUsers();
  }, [search, role, status, page]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const formatRoles = (roles: string[]) =>
    roles
      .map((role) => {
        const key = `admin.users.roles.${role}`;
        const translated = t(key);
        return translated === key ? role : translated;
      })
      .join(", ") || "—";

  const handleToggleLock = async (user: AdminUserListItem) => {
    setBusyUserId(user.id);
    try {
      const response = await setAdminUserLockout(user.id, !user.isLockedOut);
      setItems((current) => current.map((item) => (item.id === user.id ? response.data : item)));
      toast.success(
        response.data.isLockedOut
          ? t("admin.users.lockedSuccess")
          : t("admin.users.unlockedSuccess"),
      );
    } catch {
      toast.error(t("admin.users.lockError"));
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.filters}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder={t("admin.users.searchPlaceholder")}
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
        />
        <select
          className={styles.selectInput}
          value={role}
          onChange={(event) => {
            setPage(1);
            setRole(event.target.value);
          }}
        >
          <option value="all">{t("admin.users.allRoles")}</option>
          <option value="Employee">{t("admin.users.roles.Employee")}</option>
          <option value="Employer">{t("admin.users.roles.Employer")}</option>
          <option value="Admin">{t("admin.users.roles.Admin")}</option>
        </select>
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
          <option value="Locked">{t("admin.status.suspended")}</option>
        </select>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t("admin.users.columns.user")}</th>
              <th>{t("admin.employers.columns.email")}</th>
              <th>{t("admin.users.columns.roles")}</th>
              <th>{t("admin.users.columns.emailConfirmed")}</th>
              <th>{t("admin.employers.columns.status")}</th>
              <th>{t("admin.employers.columns.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((user) => (
              <tr key={user.id}>
                <td>
                  <p className={styles.userName}>{user.displayName}</p>
                  {user.phoneNumber ? <p className={styles.userMeta}>{user.phoneNumber}</p> : null}
                </td>
                <td>{user.email}</td>
                <td>{formatRoles(user.roles)}</td>
                <td>{user.emailConfirmed ? t("common.yes") : t("common.no")}</td>
                <td>
                  <AdminStatusBadge kind={user.isLockedOut ? "suspended" : "active"} />
                </td>
                <td>
                  <div className={styles.actions}>
                    {user.employerId ? (
                      <Link className={styles.linkButton} to={`/admin/employers/${user.employerId}`}>
                        {t("admin.employers.viewDetails")}
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      className={user.isLockedOut ? styles.secondaryAction : styles.dangerAction}
                      disabled={busyUserId === user.id}
                      onClick={() => void handleToggleLock(user)}
                    >
                      {busyUserId === user.id
                        ? t("common.loading")
                        : user.isLockedOut
                          ? t("admin.users.unlock")
                          : t("admin.users.lock")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.cards}>
        {items.map((user) => (
          <article key={user.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>{user.displayName}</h3>
                <p className={styles.cardSubtitle}>{user.email}</p>
                <p className={styles.cardMeta}>{formatRoles(user.roles)}</p>
              </div>
              <AdminStatusBadge kind={user.isLockedOut ? "suspended" : "active"} />
            </div>
            <div className={styles.cardFooter}>
              {user.employerId ? (
                <Link className={styles.linkButton} to={`/admin/employers/${user.employerId}`}>
                  {t("admin.employers.viewDetails")}
                </Link>
              ) : null}
              <button
                type="button"
                className={user.isLockedOut ? styles.secondaryAction : styles.dangerAction}
                disabled={busyUserId === user.id}
                onClick={() => void handleToggleLock(user)}
              >
                {busyUserId === user.id
                  ? t("common.loading")
                  : user.isLockedOut
                    ? t("admin.users.unlock")
                    : t("admin.users.lock")}
              </button>
            </div>
          </article>
        ))}
      </div>

      {!loading && items.length === 0 ? <p className={styles.emptyState}>{t("admin.users.empty")}</p> : null}

      <div className={styles.pagination}>
        <button
          type="button"
          className={styles.pageButton}
          disabled={page <= 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          {t("admin.pagination.previousPage")}
        </button>
        <span className={styles.pageInfo}>{t("admin.pagination.pageOf", { page, totalPages })}</span>
        <button
          type="button"
          className={styles.pageButton}
          disabled={page >= totalPages}
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
        >
          {t("admin.pagination.nextPage")}
        </button>
      </div>
    </div>
  );
};

export default AdminUsersPage;
