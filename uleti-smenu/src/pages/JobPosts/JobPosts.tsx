import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import JobPostItem from "../../components/JobPosts/JobPostItem";
import styles from "./JobPosts.module.scss";
import JobPostForm from "../../components/JobPosts/JobPostForm";
import {
    GetMyJobPostPositions,
    GetMyJobPostsPaged,
    GetVisibleJobPostFilterOptions,
    GetVisibleJobPostsPaged,
    VisibleJobPostFilterOptions,
} from "../../services/jobPost-service";
import { JobPost } from "../../models/JobPost.model";
import { AuthContext } from "../../store/Auth-context";
import EmployerApplicantsPanel from "../../components/JobPosts/EmployerApplicantsPanel";
import { ApplyToJobPost, GetMyApplications } from "../../services/application-service";
import { toast } from "react-toastify";
import { getImageUrl } from "../../helpers/getHelperUrl";
import { getJobPostStatusLabel } from "../../helpers/jobPostStatus";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Employer } from "../../models/User.model";
import LazyLoadSentinel from "../../components/Common/LazyLoadSentinel";
import { LIST_PAGE_SIZE } from "../../constants/pagination";
import { useServerLazyLoad } from "../../hooks/useServerLazyLoad";
import JobPostsFiltersBar from "../../components/JobPosts/JobPostsFiltersBar";
import { GetMyRestaurantLocations } from "../../services/restaurantLocation-service";
import { RestaurantLocation } from "../../models/RestaurantLocation.model";

import "tailwindcss";

const parseOptionalSalary = (value: string) => {
    if (!value.trim()) {
        return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

const parseEmployerSortValue = (
    value: string
): { sortBy: "createdAt" | "startingDate"; sortDirection: "asc" | "desc" } => {
    switch (value) {
        case "startingDate_asc":
            return { sortBy: "startingDate", sortDirection: "asc" };
        case "startingDate_desc":
            return { sortBy: "startingDate", sortDirection: "desc" };
        case "createdAt_asc":
            return { sortBy: "createdAt", sortDirection: "asc" };
        default:
            return { sortBy: "createdAt", sortDirection: "desc" };
    }
};

const parseSortValue = (value: string): { sortBy: "createdAt" | "salary"; sortDirection: "asc" | "desc" } => {
    switch (value) {
        case "createdAt_asc":
            return { sortBy: "createdAt", sortDirection: "asc" };
        case "salary_desc":
            return { sortBy: "salary", sortDirection: "desc" };
        case "salary_asc":
            return { sortBy: "salary", sortDirection: "asc" };
        default:
            return { sortBy: "createdAt", sortDirection: "desc" };
    }
};

const JobPosts = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { role, me } = useContext(AuthContext);
    const [jobPostCreateFormOpened, setJobPostCreatFormOpened] = useState(false);
    const [editingJobPostId, setEditingJobPostId] = useState<string | null>(null);
    const [employeeFilter, setEmployeeFilter] = useState<"all" | "notApplied" | "applied">("all");
    const [favouriteFilter, setFavouriteFilter] = useState<"all" | "favourites">("all");
    const [sortBy, setSortBy] = useState<"createdAt" | "salary">("createdAt");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [appliedJobPostIds, setAppliedJobPostIds] = useState<string[]>([]);
    const [applyInProgressForPostId, setApplyInProgressForPostId] = useState<string | null>(null);
    const [employerLifecycleFilter, setEmployerLifecycleFilter] = useState<"active" | "archived" | "all">("active");
    const [cityFilter, setCityFilter] = useState("");
    const [restaurantFilter, setRestaurantFilter] = useState("");
    const [positionFilter, setPositionFilter] = useState("");
    const [minSalaryFilter, setMinSalaryFilter] = useState("");
    const [maxSalaryFilter, setMaxSalaryFilter] = useState("");
    const [employerSortBy, setEmployerSortBy] = useState<"createdAt" | "startingDate">("startingDate");
    const [employerSortDirection, setEmployerSortDirection] = useState<"asc" | "desc">("asc");
    const [employerPositionOptions, setEmployerPositionOptions] = useState<string[]>([]);
    const [employerLocations, setEmployerLocations] = useState<RestaurantLocation[]>([]);
    const [employeeFilterOptions, setEmployeeFilterOptions] = useState<VisibleJobPostFilterOptions>({
        cities: [],
        locations: [],
        positions: [],
    });
    const leftPanelRef = useRef<HTMLDivElement>(null);
    const savedListScrollTopRef = useRef(0);

    const saveListScrollPosition = () => {
        if (leftPanelRef.current) {
            savedListScrollTopRef.current = leftPanelRef.current.scrollTop;
        }
    };

    const restoreListScrollPosition = () => {
        requestAnimationFrame(() => {
            if (leftPanelRef.current) {
                leftPanelRef.current.scrollTop = savedListScrollTopRef.current;
            }
        });
    };

    const openJobPostForm = (jobPostId: string | null = null) => {
        saveListScrollPosition();
        setEditingJobPostId(jobPostId);
        setJobPostCreatFormOpened(true);
    };

    const closeJobPostForm = () => {
        setJobPostCreatFormOpened(false);
        setEditingJobPostId(null);
        restoreListScrollPosition();
    };

    const employerJobPostsResetKey = `${role}|${employerLifecycleFilter}|${cityFilter}|${restaurantFilter}|${positionFilter}|${employerSortBy}|${employerSortDirection}`;
    const fetchEmployerJobPostsPage = useCallback(
        async (page: number) => {
            if (role !== "Employer") {
                return { items: [], totalCount: 0 };
            }

            const response = await GetMyJobPostsPaged({
                page,
                pageSize: LIST_PAGE_SIZE,
                lifecycle: employerLifecycleFilter,
                sortBy: employerSortBy,
                sortDirection: employerSortDirection,
                city: cityFilter || undefined,
                restaurantLocationId: restaurantFilter || undefined,
                position: positionFilter || undefined,
            });

            return {
                items: response.data.items,
                totalCount: response.data.totalCount,
            };
        },
        [role, employerLifecycleFilter, cityFilter, restaurantFilter, positionFilter, employerSortBy, employerSortDirection]
    );

    const {
        items: employerJobPosts,
        hasMore: hasMoreEmployerJobPosts,
        loadMore: loadMoreEmployerJobPosts,
        isLoading: isEmployerJobPostsLoading,
        isLoadingMore: isEmployerJobPostsLoadingMore,
        totalCount: employerTotalCount,
        reset: resetEmployerJobPosts,
    } = useServerLazyLoad(fetchEmployerJobPostsPage, employerJobPostsResetKey);

    const employeeJobPostsResetKey = `${role}|${employeeFilter}|${favouriteFilter}|${sortBy}|${sortDirection}|${cityFilter}|${restaurantFilter}|${positionFilter}|${minSalaryFilter}|${maxSalaryFilter}`;
    const fetchEmployeeJobPostsPage = useCallback(
        async (page: number) => {
            if (role !== "Employee") {
                return { items: [], totalCount: 0 };
            }

            const response = await GetVisibleJobPostsPaged({
                page,
                pageSize: LIST_PAGE_SIZE,
                sortBy,
                sortDirection,
                city: cityFilter || undefined,
                restaurantLocationId: restaurantFilter || undefined,
                position: positionFilter || undefined,
                minSalary: parseOptionalSalary(minSalaryFilter),
                maxSalary: parseOptionalSalary(maxSalaryFilter),
                applicationFilter: employeeFilter,
                favouritesOnly: favouriteFilter === "favourites",
            });

            return {
                items: response.data.items,
                totalCount: response.data.totalCount,
            };
        },
        [
            role,
            employeeFilter,
            favouriteFilter,
            sortBy,
            sortDirection,
            cityFilter,
            restaurantFilter,
            positionFilter,
            minSalaryFilter,
            maxSalaryFilter,
        ]
    );

    const {
        items: employeeJobPosts,
        hasMore: hasMoreEmployeeJobPosts,
        loadMore: loadMoreEmployeeJobPosts,
        isLoading: isEmployeeJobPostsLoading,
        isLoadingMore: isEmployeeJobPostsLoadingMore,
        totalCount: employeeTotalCount,
        reset: resetEmployeeJobPosts,
    } = useServerLazyLoad(fetchEmployeeJobPostsPage, employeeJobPostsResetKey);

    const editingJobPost = useMemo(() => {
        if (!editingJobPostId || role !== "Employer") {
            return undefined;
        }

        return employerJobPosts.find((post) => post.id === editingJobPostId);
    }, [editingJobPostId, role, employerJobPosts]);
    const appliedJobPostIdSet = useMemo(() => new Set(appliedJobPostIds), [appliedJobPostIds]);

    useEffect(() => {
        if (role !== "Employer") {
            return;
        }

        const loadEmployerFilterOptions = async () => {
            try {
                const [positionsResponse, locationsResponse] = await Promise.all([
                    GetMyJobPostPositions(),
                    GetMyRestaurantLocations(),
                ]);
                setEmployerPositionOptions(positionsResponse.data);
                setEmployerLocations(locationsResponse.data);
            } catch {
                setEmployerPositionOptions([]);
                setEmployerLocations([]);
            }
        };

        void loadEmployerFilterOptions();
    }, [role]);

    useEffect(() => {
        if (role !== "Employee") {
            return;
        }

        const loadEmployeeFilterOptions = async () => {
            try {
                const response = await GetVisibleJobPostFilterOptions(cityFilter || undefined);
                setEmployeeFilterOptions(response.data);
            } catch {
                setEmployeeFilterOptions({
                    cities: [],
                    locations: [],
                    positions: [],
                });
            }
        };

        void loadEmployeeFilterOptions();
    }, [role, cityFilter]);

    useEffect(() => {
        leftPanelRef.current?.scrollTo(0, 0);
    }, [
        employeeFilter,
        favouriteFilter,
        sortBy,
        sortDirection,
        employerLifecycleFilter,
        cityFilter,
        restaurantFilter,
        positionFilter,
        minSalaryFilter,
        maxSalaryFilter,
        employerSortBy,
        employerSortDirection,
    ]);

    useEffect(() => {
        const loadMyApplications = async () => {
            if (role !== "Employee") {
                setAppliedJobPostIds([]);
                return;
            }

            try {
                const response = await GetMyApplications();
                const uniqueJobPostIds = Array.from(new Set(response.data.map((application) => application.jobPostId)));
                setAppliedJobPostIds(uniqueJobPostIds);
            } catch {
                // If this fails, keep filter functional with current loaded state.
                setAppliedJobPostIds([]);
            }
        };

        loadMyApplications();
    }, [role]);

    const reloadJobPosts = async () => {
        if (role === "Employer") {
            resetEmployerJobPosts();
            return;
        }

        if (role === "Employee") {
            resetEmployeeJobPosts();
        }
    };

    const selectedSortValue = `${sortBy}_${sortDirection}`;
    const selectedEmployerSortValue = `${employerSortBy}_${employerSortDirection}`;

    const handleCityFilterChange = (value: string) => {
        setCityFilter(value);
        setRestaurantFilter("");
    };

    const handleSortChange = (value: string) => {
        const parsedSort = parseSortValue(value);
        setSortBy(parsedSort.sortBy);
        setSortDirection(parsedSort.sortDirection);
    };

    const handleEmployerSortChange = (value: string) => {
        const parsedSort = parseEmployerSortValue(value);
        setEmployerSortBy(parsedSort.sortBy);
        setEmployerSortDirection(parsedSort.sortDirection);
    };

    const handleApply = async (jobPostId: string) => {
        setApplyInProgressForPostId(jobPostId);
        try {
            await ApplyToJobPost(jobPostId);
            toast.success(t("jobPosts.applySuccess"));
            setAppliedJobPostIds((previousIds) =>
                previousIds.includes(jobPostId) ? previousIds : [...previousIds, jobPostId]
            );
        } catch {
            toast.error(t("jobPosts.applyError"));
        } finally {
            setApplyInProgressForPostId(null);
        }
    };

    const formatDate = (value: Date) => {
        const parsedDate = new Date(value);
        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }
        return parsedDate.toLocaleString();
    };

    const visibleJobPosts = role === "Employee"
        ? (employeeJobPosts ?? [])
        : role === "Employer"
            ? (employerJobPosts ?? [])
            : [];

    const employerCityOptions = useMemo(
        () =>
            [...new Set(employerLocations.map((location) => location.city).filter(Boolean))]
                .sort((left, right) => left.localeCompare(right))
                .map((city) => ({ value: city, label: city })),
        [employerLocations]
    );

    const employerRestaurantOptions = useMemo(
        () =>
            employerLocations
                .filter((location) => !cityFilter || location.city === cityFilter)
                .map((location) => ({
                    value: location.id,
                    label: `${location.name} (${location.city})`,
                })),
        [employerLocations, cityFilter]
    );

    const employerPositionFilterOptions = useMemo(
        () => employerPositionOptions.map((position) => ({ value: position, label: position })),
        [employerPositionOptions]
    );

    const employeeCityOptions = useMemo(
        () => employeeFilterOptions.cities.map((city) => ({ value: city, label: city })),
        [employeeFilterOptions.cities]
    );

    const employeeRestaurantOptions = useMemo(
        () =>
            employeeFilterOptions.locations.map((location) => ({
                value: location.id,
                label: `${location.name} (${location.city})`,
            })),
        [employeeFilterOptions.locations]
    );

    const employeePositionFilterOptions = useMemo(
        () => employeeFilterOptions.positions.map((position) => ({ value: position, label: position })),
        [employeeFilterOptions.positions]
    );

    return (
        <div className={`${styles["posts-container"]} ${jobPostCreateFormOpened ? styles["form-opened"] : ""}`}>
            <div className={styles["left-panel"]}>
            {role === "Employer" && (
              <JobPostsFiltersBar
                showLifecycle
                showSort
                sortMode="employer"
                showSalaryFilters={false}
                restaurantLabelKey="filterLocation"
                city={cityFilter}
                restaurant={restaurantFilter}
                position={positionFilter}
                minSalary=""
                maxSalary=""
                lifecycle={employerLifecycleFilter}
                sortValue={selectedEmployerSortValue}
                cityOptions={employerCityOptions}
                restaurantOptions={employerRestaurantOptions}
                positionOptions={employerPositionFilterOptions}
                onCityChange={handleCityFilterChange}
                onRestaurantChange={setRestaurantFilter}
                onPositionChange={setPositionFilter}
                onMinSalaryChange={() => undefined}
                onMaxSalaryChange={() => undefined}
                onLifecycleChange={setEmployerLifecycleFilter}
                onSortChange={handleEmployerSortChange}
              />
            )}
            {role === "Employee" && (
              <JobPostsFiltersBar
                showApplicationFilters
                showSort
                restaurantLabelKey="filterLocation"
                city={cityFilter}
                restaurant={restaurantFilter}
                position={positionFilter}
                minSalary={minSalaryFilter}
                maxSalary={maxSalaryFilter}
                applicationFilter={employeeFilter}
                favouriteFilter={favouriteFilter}
                sortValue={selectedSortValue}
                cityOptions={employeeCityOptions}
                restaurantOptions={employeeRestaurantOptions}
                positionOptions={employeePositionFilterOptions}
                onCityChange={handleCityFilterChange}
                onRestaurantChange={setRestaurantFilter}
                onPositionChange={setPositionFilter}
                onMinSalaryChange={setMinSalaryFilter}
                onMaxSalaryChange={setMaxSalaryFilter}
                onApplicationFilterChange={setEmployeeFilter}
                onFavouriteFilterChange={setFavouriteFilter}
                onSortChange={handleSortChange}
              />
            )}
            <div ref={leftPanelRef} className={styles["posts-list"]}>
            {visibleJobPosts.map((jobPost: JobPost) => {
          const isMyPost = role === "Employer" && me && "id" in me && jobPost.employerId === me.id;
          const isEmployee = role === "Employee";
          const hasApplied = appliedJobPostIdSet.has(jobPost.id);
          const isArchivedPost = Boolean(jobPost.isArchived);
          return (
            <div key={jobPost.id} className={styles["jobpost-card-wrapper"]}>
              {isMyPost && (
                <span
                  className={`${styles["employer-lifecycle-badge"]} ${isArchivedPost ? styles["employer-lifecycle-archived"] : styles["employer-lifecycle-active"]}`}
                >
                  {isArchivedPost ? t("jobPosts.lifecycleArchived") : t("jobPosts.lifecycleActive")}
                </span>
              )}
              {!isEmployee && (
                <JobPostItem
                  jobPost={jobPost}
                  disableCardHover={isMyPost}
                  imageOverlay={
                    isMyPost ? (
                      <div className={styles["employer-card-overlay"]}>
                        <button
                          className={styles["edit-icon-button"]}
                          aria-label="Edit job post"
                          title="Edit job post"
                          onClick={() => openJobPostForm(jobPost.id)}
                        >
                          ✎
                        </button>
                      </div>
                    ) : undefined
                  }
                />
              )}
              {isMyPost && (
                <div className={styles["applicants-button-anchor"]}>
                  <EmployerApplicantsPanel jobPostId={jobPost.id} variant="inlineCard" />
                </div>
              )}
              {isEmployee && (
                <article className={styles["employee-jobpost-card"]}>
                  <div className={styles["employee-card-header"]}>
                    <img
                      className={styles["employee-card-logo"]}
                      src={getImageUrl(jobPost.employer?.profilePhoto)}
                      alt={jobPost.employer?.name ? `${jobPost.employer.name} logo` : "Employer logo"}
                    />
                    <h4>{jobPost.title}</h4>
                  </div>
                  <div className={styles["employee-card-meta"]}>
                    <div><span>{t("jobPosts.position")}:</span><strong>{jobPost.position}</strong></div>
                    <div>
                      <span>{t("jobPosts.location")}:</span>
                      <strong>
                        {jobPost.restaurantLocationName
                          ? `${jobPost.restaurantLocationName}${jobPost.restaurantLocationCity ? ` (${jobPost.restaurantLocationCity})` : ""}`
                          : "-"}
                      </strong>
                    </div>
                    <div><span>{t("jobPosts.startingDate")}:</span><strong>{formatDate(jobPost.startingDate)}</strong></div>
                    <div><span>{t("jobPosts.salary")}:</span><strong>{jobPost.salary} RSD</strong></div>
                    <div><span>{t("jobPosts.status")}:</span><strong>{getJobPostStatusLabel(jobPost.status, t)}</strong></div>
                  </div>
                  <p className={styles["employee-description"]}>{jobPost.description}</p>
                  <div className={styles["employee-card-actions"]}>
                    {hasApplied && <span className={styles["applied-badge"]}>{t("jobPosts.alreadyApplied")}</span>}
                    <button
                      className={styles["apply-button"]}
                      disabled={hasApplied || applyInProgressForPostId !== null}
                      onClick={() => handleApply(jobPost.id)}
                    >
                      {applyInProgressForPostId === jobPost.id ? t("jobPosts.applying") : hasApplied ? t("jobPosts.appliedShort") : t("jobPosts.apply")}
                    </button>
                  </div>
                </article>
              )}
            </div>
          );
        })}
            {role === "Employee" && (employeeJobPosts?.length ?? 0) === 0 && !isEmployeeJobPostsLoading && (
              <p className={styles["empty-message"]}>{t("jobPosts.noPostsFiltered")}</p>
            )}
            {role === "Employer" && (employerJobPosts?.length ?? 0) === 0 && !isEmployerJobPostsLoading && (
              <p className={styles["empty-message"]}>
                {employerLifecycleFilter === "archived"
                  ? t("jobPosts.noArchivedPosts")
                  : t("jobPosts.noPostsFiltered")}
              </p>
            )}
            {(role === "Employee" || role === "Employer") && (
              <LazyLoadSentinel
                hasMore={role === "Employee" ? hasMoreEmployeeJobPosts : hasMoreEmployerJobPosts}
                isLoading={
                  role === "Employee"
                    ? isEmployeeJobPostsLoading || isEmployeeJobPostsLoadingMore
                    : isEmployerJobPostsLoading || isEmployerJobPostsLoadingMore
                }
                onLoadMore={role === "Employee" ? loadMoreEmployeeJobPosts : loadMoreEmployerJobPosts}
                visibleCount={role === "Employee" ? (employeeJobPosts?.length ?? 0) : (employerJobPosts?.length ?? 0)}
                totalCount={role === "Employee" ? employeeTotalCount : employerTotalCount}
              />
            )}
            </div>
            </div>

            {role === "Employer" && jobPostCreateFormOpened && (
                <div className={styles["right-panel"]}>
                    <JobPostForm
                        key={editingJobPostId ?? "create"}
                        initialData={editingJobPost}
                        onClose={closeJobPostForm}
                        onSubmit={reloadJobPosts}
                    />
                </div>
            )}

            {role === "Employer" && !jobPostCreateFormOpened && (
                <button
                    className={styles["floating-button"]}
                    onClick={() => {
                        const employer = me as Employer;
                        const subscription = employer?.subscription;
                        if (subscription && subscription.canPost === false) {
                            toast.error(t("billing.postingBlocked"));
                            navigate("/billing/upgrade");
                            return;
                        }

                        openJobPostForm();
                    }}
                >
                    {t("jobPosts.createPost")}
                </button>
            )}
        </div>
    );
}

export default JobPosts;