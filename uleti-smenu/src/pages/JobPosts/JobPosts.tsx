import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import JobPostItem from "../../components/JobPosts/JobPostItem";
import styles from "./JobPosts.module.scss";
import JobPostForm from "../../components/JobPosts/JobPostForm";
import { GetAllJobPosts, GetMyJobPostsPaged } from "../../services/jobPost-service";
import { JobPost } from "../../models/JobPost.model";
import { AuthContext } from "../../store/Auth-context";
import EmployerApplicantsPanel from "../../components/JobPosts/EmployerApplicantsPanel";
import { ApplyToJobPost, GetMyApplications } from "../../services/application-service";
import { toast } from "react-toastify";
import { getImageUrl } from "../../helpers/getHelperUrl";
import { GetEmployersWithFavouriteStatus } from "../../services/user-service";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Employer } from "../../models/User.model";
import LazyLoadSentinel from "../../components/Common/LazyLoadSentinel";
import { LIST_PAGE_SIZE } from "../../constants/pagination";
import { useLazyLoadList } from "../../hooks/useLazyLoadList";
import { useServerLazyLoad } from "../../hooks/useServerLazyLoad";
import JobPostsFiltersBar from "../../components/JobPosts/JobPostsFiltersBar";
import { GetMyJobPostPositions } from "../../services/jobPost-service";
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
    const [favouriteEmployerIds, setFavouriteEmployerIds] = useState<string[]>([]);
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
    const leftPanelRef = useRef<HTMLDivElement>(null);

    const employerJobPostsResetKey = `${employerLifecycleFilter}|${cityFilter}|${restaurantFilter}|${positionFilter}|${employerSortBy}|${employerSortDirection}`;
    const fetchEmployerJobPostsPage = useCallback(
        async (page: number) => {
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
        [employerLifecycleFilter, cityFilter, restaurantFilter, positionFilter, employerSortBy, employerSortDirection]
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

    // return (
    //     <div className={styles["posts-container"]}>
    //         <div className={styles["left-panel"]}>
    //             <JobPostItem />
    //             <JobPostItem />
    //             <JobPostItem />
    //             <JobPostItem />
    //         </div>
    //         <div className={styles["right-panel-wrapper"]}>
    //             {!jobPostCreateFormOpened && (
    //                 <button onClick={() => setJobPostCreatFormOpened(true)}>
    //                     Napravi Oglas
    //                 </button>
    //             )}

    //             {jobPostCreateFormOpened && (
    //                 <div className={styles["right-panel"]}>
    //                     <JobPostForm onClose={() => setJobPostCreatFormOpened(false)} />
    //                 </div>
    //             )}
    //         </div>
    //     </div>
    // )
    const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
    const editingJobPost = useMemo(() => {
        if (!editingJobPostId) {
            return undefined;
        }

        if (role === "Employer") {
            return employerJobPosts.find((post) => post.id === editingJobPostId);
        }

        return jobPosts.find((post) => post.id === editingJobPostId);
    }, [editingJobPostId, role, employerJobPosts, jobPosts]);
    const appliedJobPostIdSet = useMemo(() => new Set(appliedJobPostIds), [appliedJobPostIds]);
    const favouriteEmployerIdSet = useMemo(() => new Set(favouriteEmployerIds), [favouriteEmployerIds]);

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
        employerSortBy,
        employerSortDirection,
    ]);

    useEffect(() => {
        if (role === "Employer") {
            return;
        }

        void fetchEmployeeJobPosts();
    }, [role, sortBy, sortDirection]);

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

    useEffect(() => {
        const loadFavourites = async () => {
            if (role !== "Employee") {
                setFavouriteEmployerIds([]);
                return;
            }

            try {
                const response = await GetEmployersWithFavouriteStatus();
                setFavouriteEmployerIds(
                    response.data
                        .filter((employer) => employer.isFavourite)
                        .map((employer) => employer.id)
                );
            } catch {
                setFavouriteEmployerIds([]);
            }
        };

        loadFavourites();
    }, [role]);

    const fetchEmployeeJobPosts = async () => {
        try {
            const response = await GetAllJobPosts(sortBy, sortDirection);
            setJobPosts(response.data);
        }
        catch (error: unknown) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error('Unknown error', error);
            }
        }
    }

    const reloadJobPosts = async () => {
        if (role === "Employer") {
            resetEmployerJobPosts();
            return;
        }

        await fetchEmployeeJobPosts();
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

    const attributeFilteredJobPosts = useMemo(() => {
        if (role !== "Employee") {
            return jobPosts;
        }

        let result = jobPosts;

        if (cityFilter) {
            result = result.filter((jobPost) => jobPost.restaurantLocationCity === cityFilter);
        }

        if (restaurantFilter) {
            result = result.filter((jobPost) => jobPost.employerId === restaurantFilter);
        }

        if (positionFilter) {
            result = result.filter((jobPost) => jobPost.position === positionFilter);
        }

        const minSalary = parseOptionalSalary(minSalaryFilter);
        const maxSalary = parseOptionalSalary(maxSalaryFilter);

        if (minSalary !== undefined) {
            result = result.filter((jobPost) => jobPost.salary >= minSalary);
        }

        if (maxSalary !== undefined) {
            result = result.filter((jobPost) => jobPost.salary <= maxSalary);
        }

        return result;
    }, [role, jobPosts, cityFilter, restaurantFilter, positionFilter, minSalaryFilter, maxSalaryFilter]);

    const filteredJobPosts = useMemo(() => {
        if (role !== "Employee") {
            return jobPosts;
        }

        if (employeeFilter === "notApplied") {
            return attributeFilteredJobPosts.filter((jobPost) => !appliedJobPostIdSet.has(jobPost.id));
        }

        if (employeeFilter === "applied") {
            return attributeFilteredJobPosts.filter((jobPost) => appliedJobPostIdSet.has(jobPost.id));
        }

        return attributeFilteredJobPosts;
    }, [role, jobPosts, attributeFilteredJobPosts, employeeFilter, appliedJobPostIdSet]);

    const employeeVisibleJobPosts = useMemo(() => {
        if (role !== "Employee") {
            return filteredJobPosts;
        }

        if (favouriteFilter === "favourites") {
            return filteredJobPosts.filter((jobPost) => favouriteEmployerIdSet.has(jobPost.employerId));
        }

        return filteredJobPosts;
    }, [role, filteredJobPosts, favouriteFilter, favouriteEmployerIdSet]);

    const employerVisibleJobPosts = useMemo(() => {
        if (role !== "Employer") {
            return filteredJobPosts;
        }

        return employerJobPosts;
    }, [role, filteredJobPosts, employerJobPosts]);

    const employeeListResetKey = `${employeeFilter}|${favouriteFilter}|${sortBy}|${sortDirection}|${cityFilter}|${restaurantFilter}|${positionFilter}|${minSalaryFilter}|${maxSalaryFilter}|${appliedJobPostIds.join(",")}|${favouriteEmployerIds.join(",")}`;

    const {
        visibleItems: employeeLazyJobPosts,
        hasMore: hasMoreEmployeeJobPosts,
        loadMore: loadMoreEmployeeJobPosts,
        totalCount: employeeTotalCount,
        visibleCount: employeeVisibleCount,
    } = useLazyLoadList(employeeVisibleJobPosts, LIST_PAGE_SIZE, employeeListResetKey);

    const visibleJobPosts = role === "Employee"
        ? employeeLazyJobPosts
        : role === "Employer"
            ? employerVisibleJobPosts
            : filteredJobPosts;

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

    const employeeFilterOptions = useMemo(() => {
        const cities = [...new Set(jobPosts.map((post) => post.restaurantLocationCity).filter(Boolean))]
            .sort((left, right) => left!.localeCompare(right!))
            .map((city) => ({ value: city as string, label: city as string }));

        const restaurants = [...new Map(
            jobPosts.map((post) => [post.employerId, post.employer?.name ?? ""] as const)
        ).entries()]
            .filter(([, name]) => Boolean(name))
            .filter(([employerId]) => {
                if (!cityFilter) {
                    return true;
                }

                return jobPosts.some(
                    (post) => post.employerId === employerId && post.restaurantLocationCity === cityFilter
                );
            })
            .sort((left, right) => left[1].localeCompare(right[1]))
            .map(([employerId, name]) => ({ value: employerId, label: name }));

        const positions = [...new Set(jobPosts.map((post) => post.position).filter(Boolean))]
            .sort((left, right) => left.localeCompare(right))
            .map((position) => ({ value: position, label: position }));

        return { cities, restaurants, positions };
    }, [jobPosts, cityFilter]);

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
                city={cityFilter}
                restaurant={restaurantFilter}
                position={positionFilter}
                minSalary={minSalaryFilter}
                maxSalary={maxSalaryFilter}
                applicationFilter={employeeFilter}
                favouriteFilter={favouriteFilter}
                sortValue={selectedSortValue}
                cityOptions={employeeFilterOptions.cities}
                restaurantOptions={employeeFilterOptions.restaurants}
                positionOptions={employeeFilterOptions.positions}
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
              {!isEmployee && <JobPostItem jobPost={jobPost} disableCardHover={isMyPost} />}
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
                    <div><span>{t("jobPosts.status")}:</span><strong>{jobPost.status}</strong></div>
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
              {isMyPost && (
                <div className={styles["employer-actions"]}>
                  <button
                    className={styles["edit-icon-button"]}
                    aria-label="Edit job post"
                    title="Edit job post"
                    onClick={() => {
                      setEditingJobPostId(jobPost.id);
                      setJobPostCreatFormOpened(true);
                    }}
                  >
                    ✎
                  </button>
                  <div className={styles["applicants-button-anchor"]}>
                    <EmployerApplicantsPanel jobPostId={jobPost.id} variant="inlineCard" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
            {role === "Employee" && employeeVisibleJobPosts.length === 0 && (
              <p className={styles["empty-message"]}>{t("jobPosts.noPostsFiltered")}</p>
            )}
            {role === "Employer" && employerVisibleJobPosts.length === 0 && (
              <p className={styles["empty-message"]}>
                {employerLifecycleFilter === "archived"
                  ? t("jobPosts.noArchivedPosts")
                  : t("jobPosts.noPostsFiltered")}
              </p>
            )}
            {(role === "Employee" || role === "Employer") && (
              <LazyLoadSentinel
                hasMore={role === "Employee" ? hasMoreEmployeeJobPosts : hasMoreEmployerJobPosts}
                isLoading={role === "Employer" && (isEmployerJobPostsLoading || isEmployerJobPostsLoadingMore)}
                onLoadMore={role === "Employee" ? loadMoreEmployeeJobPosts : loadMoreEmployerJobPosts}
                visibleCount={role === "Employee" ? employeeVisibleCount : employerJobPosts.length}
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
                        onClose={() => {
                            setJobPostCreatFormOpened(false);
                            setEditingJobPostId(null);
                        }}
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

                        setEditingJobPostId(null);
                        setJobPostCreatFormOpened(true);
                    }}
                >
                    {t("jobPosts.createPost")}
                </button>
            )}
        </div>
    );
}

export default JobPosts;