import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "@mui/material";
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
import EmployerJobPostCandidatesSidePanel from "../../components/JobPosts/EmployerJobPostCandidatesSidePanel";
import EmployerJobPostMobileCard from "../../components/JobPosts/EmployerJobPostMobileCard";
import { ApplyToJobPost, GetMyApplications } from "../../services/application-service";
import { toast } from "react-toastify";
import { getImageUrl } from "../../helpers/getHelperUrl";
import { getJobPostStatusLabel } from "../../helpers/jobPostStatus";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UsersIcon } from "@heroicons/react/24/outline";
import { Employer } from "../../models/User.model";
import LazyLoadSentinel from "../../components/Common/LazyLoadSentinel";
import { LIST_PAGE_SIZE } from "../../constants/pagination";
import { useServerLazyLoad } from "../../hooks/useServerLazyLoad";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import JobPostsFiltersBar from "../../components/JobPosts/JobPostsFiltersBar";
import JobPostsEmployeeHeader from "../../components/JobPosts/JobPostsEmployeeHeader";
import JobPostsEmployerHeader from "../../components/JobPosts/JobPostsEmployerHeader";
import JobPostsActiveFilterChips from "../../components/JobPosts/JobPostsActiveFilterChips";
import JobPostsFiltersDrawer from "../../components/JobPosts/JobPostsFiltersDrawer";
import JobPostsEmployerFiltersDrawer from "../../components/JobPosts/JobPostsEmployerFiltersDrawer";
import JobPostsEmployerFormDrawer from "../../components/JobPosts/JobPostsEmployerFormDrawer";
import { useIsCandidateShell } from "../../hooks/useIsCandidateShell";
import { useIsEmployerShell } from "../../hooks/useIsEmployerShell";
import {
    buildEmployeeActiveFilterChips,
    buildEmployerActiveFilterChips,
    removeEmployeeActiveFilter,
    removeEmployerActiveFilter,
} from "../../helpers/jobPostActiveFilters";
import { resolveShiftDateRange, ShiftDatePreset } from "../../helpers/shiftDateFilter";
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

const SALARY_FILTER_DEBOUNCE_MS = 400;
const DEFAULT_SALARY_MIN = 3000;
const DEFAULT_SALARY_MAX = 10000;

const JobPosts = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { role, me, authStatus } = useContext(AuthContext);
    const isCandidateShell = useIsCandidateShell();
    const isEmployerShell = useIsEmployerShell();
    const isGuestBrowse = authStatus === "unauthenticated";
    const isEmployeeCandidateView = isCandidateShell && role === "Employee";
    const isEmployerShellView = isEmployerShell && role === "Employer";
    const isMobileEmployer = useMediaQuery("(max-width:1023px)");
    const [jobPostCreateFormOpened, setJobPostCreatFormOpened] = useState(false);
    const [candidatesPanelJobPost, setCandidatesPanelJobPost] = useState<JobPost | null>(null);
    const [editingJobPostId, setEditingJobPostId] = useState<string | null>(null);
    const [employeeFilter, setEmployeeFilter] = useState<"all" | "notApplied" | "applied">("all");
    const [hideAppliedPosts, setHideAppliedPosts] = useState(false);
    const [favouriteFilter, setFavouriteFilter] = useState<"all" | "favourites">("all");
    const [sortBy, setSortBy] = useState<"createdAt" | "salary">("createdAt");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [appliedJobPostIds, setAppliedJobPostIds] = useState<string[]>([]);
    const [applyInProgressForPostId, setApplyInProgressForPostId] = useState<string | null>(null);
    const [employerLifecycleFilter, setEmployerLifecycleFilter] = useState<"active" | "archived" | "all">("active");
    const [cityFilter, setCityFilter] = useState("");
    const [restaurantFilter, setRestaurantFilter] = useState("");
    const [positionFilter, setPositionFilter] = useState("");
    const [minSalaryInput, setMinSalaryInput] = useState("");
    const [maxSalaryInput, setMaxSalaryInput] = useState("");
    const debouncedMinSalary = useDebouncedValue(minSalaryInput, SALARY_FILTER_DEBOUNCE_MS);
    const debouncedMaxSalary = useDebouncedValue(maxSalaryInput, SALARY_FILTER_DEBOUNCE_MS);
    const [employerSortBy, setEmployerSortBy] = useState<"createdAt" | "startingDate">("startingDate");
    const [employerSortDirection, setEmployerSortDirection] = useState<"asc" | "desc">("asc");
    const [employerPositionOptions, setEmployerPositionOptions] = useState<string[]>([]);
    const [employerLocations, setEmployerLocations] = useState<RestaurantLocation[]>([]);
    const [employeeFilterOptions, setEmployeeFilterOptions] = useState<VisibleJobPostFilterOptions>({
        cities: [],
        locations: [],
        positions: [],
    });
    const salaryBounds = useMemo(
        () => ({
            min: employeeFilterOptions.minSalary ?? DEFAULT_SALARY_MIN,
            max: employeeFilterOptions.maxSalary ?? DEFAULT_SALARY_MAX,
        }),
        [employeeFilterOptions.minSalary, employeeFilterOptions.maxSalary]
    );
    const [isEmployeeFiltersOpen, setIsEmployeeFiltersOpen] = useState(false);
    const [isEmployerFiltersOpen, setIsEmployerFiltersOpen] = useState(false);
    const [employeePositionFilters, setEmployeePositionFilters] = useState<string[]>([]);
    const [shiftDatePreset, setShiftDatePreset] = useState<ShiftDatePreset>("any");
    const [shiftDateCustom, setShiftDateCustom] = useState("");
    const [salarySliderMin, setSalarySliderMin] = useState(DEFAULT_SALARY_MIN);
    const [salarySliderMax, setSalarySliderMax] = useState(DEFAULT_SALARY_MAX);
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
        setIsEmployerFiltersOpen(false);
        setJobPostCreatFormOpened(true);
    };

    const closeJobPostForm = () => {
        setJobPostCreatFormOpened(false);
        setEditingJobPostId(null);
        restoreListScrollPosition();
    };

    const handleOpenEmployerFilters = () => {
        closeJobPostForm();
        setIsEmployerFiltersOpen(true);
    };

    const handleEmployerCreatePost = () => {
        const employer = me as Employer;
        const subscription = employer?.subscription;
        if (subscription && subscription.canPost === false) {
            toast.error(t("billing.postingBlocked"));
            navigate("/billing/upgrade");
            return;
        }

        setIsEmployerFiltersOpen(false);
        openJobPostForm();
    };

    useEffect(() => {
        const state = location.state as { openCreateForm?: boolean } | null;
        if (!state?.openCreateForm || !isEmployerShellView) {
            return;
        }

        const employer = me as Employer;
        const subscription = employer?.subscription;
        if (subscription && subscription.canPost === false) {
            toast.error(t("billing.postingBlocked"));
            navigate("/billing/upgrade", { replace: true, state: null });
            return;
        }

        openJobPostForm();
        navigate(location.pathname, { replace: true, state: null });
    }, [isEmployerShellView, location.pathname, location.state, me, navigate, t]);

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

    const employeeJobPostsResetKey = `${role}|${employeeFilter}|${hideAppliedPosts}|${favouriteFilter}|${sortBy}|${sortDirection}|${cityFilter}|${restaurantFilter}|${positionFilter}|${employeePositionFilters.join(",")}|${debouncedMinSalary}|${debouncedMaxSalary}|${salarySliderMin}|${salarySliderMax}|${shiftDatePreset}|${shiftDateCustom}|${isCandidateShell}`;
    const fetchEmployeeJobPostsPage = useCallback(
        async (page: number) => {
            if (role !== "Employee") {
                return { items: [], totalCount: 0 };
            }

            const shiftDateRange = resolveShiftDateRange(shiftDatePreset, shiftDateCustom);
            const positions = isEmployeeCandidateView
                ? employeePositionFilters.length > 0
                    ? employeePositionFilters
                    : undefined
                : positionFilter
                    ? [positionFilter]
                    : undefined;
            const salaryRangeActive =
                salarySliderMin > salaryBounds.min || salarySliderMax < salaryBounds.max;

            const applicationFilter = isEmployeeCandidateView
                ? hideAppliedPosts
                    ? "notApplied"
                    : "all"
                : employeeFilter;

            const response = await GetVisibleJobPostsPaged({
                page,
                pageSize: LIST_PAGE_SIZE,
                sortBy,
                sortDirection,
                city: cityFilter || undefined,
                restaurantLocationId: restaurantFilter || undefined,
                positions,
                minSalary:
                    isEmployeeCandidateView && salaryRangeActive
                        ? salarySliderMin
                        : parseOptionalSalary(debouncedMinSalary),
                maxSalary:
                    isEmployeeCandidateView && salaryRangeActive
                        ? salarySliderMax
                        : parseOptionalSalary(debouncedMaxSalary),
                shiftDateFrom: shiftDateRange.from?.toISOString(),
                shiftDateTo: shiftDateRange.to?.toISOString(),
                applicationFilter,
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
            hideAppliedPosts,
            favouriteFilter,
            sortBy,
            sortDirection,
            cityFilter,
            restaurantFilter,
            positionFilter,
            employeePositionFilters,
            debouncedMinSalary,
            debouncedMaxSalary,
            salarySliderMin,
            salarySliderMax,
            shiftDatePreset,
            shiftDateCustom,
            isEmployeeCandidateView,
            salaryBounds.min,
            salaryBounds.max,
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

    const guestJobPostsResetKey = `${authStatus}|${cityFilter}|${restaurantFilter}|${positionFilter}|${sortBy}|${sortDirection}`;
    const fetchGuestJobPostsPage = useCallback(
        async (page: number) => {
            if (!isGuestBrowse) {
                return { items: [], totalCount: 0 };
            }

            const response = await GetVisibleJobPostsPaged({
                page,
                pageSize: LIST_PAGE_SIZE,
                sortBy,
                sortDirection,
                city: cityFilter || undefined,
                restaurantLocationId: restaurantFilter || undefined,
                positions: positionFilter ? [positionFilter] : undefined,
            });

            return {
                items: response.data.items,
                totalCount: response.data.totalCount,
            };
        },
        [authStatus, cityFilter, isGuestBrowse, positionFilter, restaurantFilter, sortBy, sortDirection]
    );

    const {
        items: guestJobPosts,
        hasMore: hasMoreGuestJobPosts,
        loadMore: loadMoreGuestJobPosts,
        isLoading: isGuestJobPostsLoading,
        isLoadingMore: isGuestJobPostsLoadingMore,
        totalCount: guestTotalCount,
    } = useServerLazyLoad(fetchGuestJobPostsPage, guestJobPostsResetKey);

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
        if (role !== "Employee" && !isGuestBrowse) {
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
    }, [role, cityFilter, isGuestBrowse]);

    useEffect(() => {
        setSalarySliderMin((current) => Math.max(salaryBounds.min, Math.min(current, salaryBounds.max)));
        setSalarySliderMax((current) => Math.max(salaryBounds.min, Math.min(current, salaryBounds.max)));
    }, [salaryBounds.min, salaryBounds.max]);

    useEffect(() => {
        leftPanelRef.current?.scrollTo(0, 0);
    }, [
        employeeFilter,
        hideAppliedPosts,
        favouriteFilter,
        sortBy,
        sortDirection,
        employerLifecycleFilter,
        cityFilter,
        restaurantFilter,
        positionFilter,
        employeePositionFilters,
        debouncedMinSalary,
        debouncedMaxSalary,
        salarySliderMin,
        salarySliderMax,
        shiftDatePreset,
        shiftDateCustom,
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
            leftPanelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
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

    const hasEmployerFiltersActive = useMemo(
        () =>
            employerLifecycleFilter !== "active" ||
            Boolean(cityFilter) ||
            Boolean(restaurantFilter) ||
            Boolean(positionFilter) ||
            employerSortBy !== "startingDate" ||
            employerSortDirection !== "asc",
        [employerLifecycleFilter, cityFilter, restaurantFilter, positionFilter, employerSortBy, employerSortDirection]
    );

    const hasEmployeeFiltersActive = useMemo(
        () =>
            employeeFilter !== "all" ||
            hideAppliedPosts ||
            favouriteFilter !== "all" ||
            Boolean(cityFilter) ||
            Boolean(restaurantFilter) ||
            Boolean(positionFilter) ||
            employeePositionFilters.length > 0 ||
            Boolean(minSalaryInput) ||
            Boolean(maxSalaryInput) ||
            salarySliderMin > salaryBounds.min ||
            salarySliderMax < salaryBounds.max ||
            shiftDatePreset !== "any" ||
            Boolean(shiftDateCustom) ||
            sortBy !== "createdAt" ||
            sortDirection !== "desc",
        [
            employeeFilter,
            hideAppliedPosts,
            favouriteFilter,
            cityFilter,
            restaurantFilter,
            positionFilter,
            employeePositionFilters,
            minSalaryInput,
            maxSalaryInput,
            salarySliderMin,
            salarySliderMax,
            salaryBounds.min,
            salaryBounds.max,
            shiftDatePreset,
            shiftDateCustom,
            sortBy,
            sortDirection,
        ]
    );

    const clearEmployerFilters = () => {
        setEmployerLifecycleFilter("active");
        setCityFilter("");
        setRestaurantFilter("");
        setPositionFilter("");
        setEmployerSortBy("startingDate");
        setEmployerSortDirection("asc");
    };

    const clearEmployeeFilters = () => {
        setEmployeeFilter("all");
        setHideAppliedPosts(false);
        setFavouriteFilter("all");
        setSortBy("createdAt");
        setSortDirection("desc");
        setCityFilter("");
        setRestaurantFilter("");
        setPositionFilter("");
        setEmployeePositionFilters([]);
        setMinSalaryInput("");
        setMaxSalaryInput("");
        setShiftDatePreset("any");
        setShiftDateCustom("");
        setSalarySliderMin(salaryBounds.min);
        setSalarySliderMax(salaryBounds.max);
    };

    const handleEmployeePositionToggle = (position: string) => {
        setEmployeePositionFilters((currentPositions) =>
            currentPositions.includes(position)
                ? currentPositions.filter((currentPosition) => currentPosition !== position)
                : [...currentPositions, position]
        );
    };

    const handleEmployeeSalaryChange = (min: number, max: number) => {
        setSalarySliderMin(min);
        setSalarySliderMax(max);
    };

    const getEmployerEmptyMessage = () => {
        if (employerLifecycleFilter === "archived") {
            return t("jobPosts.noArchivedPosts");
        }

        if (hasEmployerFiltersActive) {
            return t("jobPosts.noPostsFiltered");
        }

        return t("jobPosts.noPostsAtAll");
    };

    const getEmployeeEmptyMessage = () => {
        if (hasEmployeeFiltersActive) {
            return t("jobPosts.noPostsFiltered");
        }

        return t("jobPosts.noPostsAtAll");
    };

    const isListRefetching =
        role === "Employer"
            ? isEmployerJobPostsLoading && (employerJobPosts?.length ?? 0) > 0
            : role === "Employee"
                ? isEmployeeJobPostsLoading && (employeeJobPosts?.length ?? 0) > 0
                : isGuestBrowse
                    ? isGuestJobPostsLoading && (guestJobPosts?.length ?? 0) > 0
                    : false;

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
            : isGuestBrowse
                ? (guestJobPosts ?? [])
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

    const employeeActiveFilterChips = useMemo(
        () =>
            buildEmployeeActiveFilterChips(
                {
                    city: cityFilter,
                    restaurant: restaurantFilter,
                    selectedPositions: employeePositionFilters,
                    salaryMin: salarySliderMin,
                    salaryMax: salarySliderMax,
                    salaryBounds,
                    shiftDatePreset,
                    shiftDateCustom,
                    applicationFilter: employeeFilter,
                    favouritesOnly: favouriteFilter === "favourites",
                    hideAppliedPosts,
                    favouriteFilter,
                    sortBy,
                    sortDirection,
                    restaurantOptions: employeeRestaurantOptions,
                    positionFilter,
                    minSalaryInput,
                    maxSalaryInput,
                    useCandidateFilters: isEmployeeCandidateView,
                },
                t
            ),
        [
            cityFilter,
            restaurantFilter,
            employeePositionFilters,
            salarySliderMin,
            salarySliderMax,
            salaryBounds,
            shiftDatePreset,
            shiftDateCustom,
            employeeFilter,
            hideAppliedPosts,
            favouriteFilter,
            sortBy,
            sortDirection,
            employeeRestaurantOptions,
            positionFilter,
            minSalaryInput,
            maxSalaryInput,
            isEmployeeCandidateView,
            t,
        ]
    );

    const employeeFiltersBarProps = {
        showApplicationFilters: true as const,
        showSort: true as const,
        restaurantLabelKey: "filterLocation" as const,
        city: cityFilter,
        restaurant: restaurantFilter,
        position: positionFilter,
        minSalary: minSalaryInput,
        maxSalary: maxSalaryInput,
        applicationFilter: employeeFilter,
        favouriteFilter,
        sortValue: selectedSortValue,
        cityOptions: employeeCityOptions,
        restaurantOptions: employeeRestaurantOptions,
        positionOptions: employeePositionFilterOptions,
        onCityChange: handleCityFilterChange,
        onRestaurantChange: setRestaurantFilter,
        onPositionChange: setPositionFilter,
        onMinSalaryChange: setMinSalaryInput,
        onMaxSalaryChange: setMaxSalaryInput,
        onApplicationFilterChange: setEmployeeFilter,
        onFavouriteFilterChange: setFavouriteFilter,
        onSortChange: handleSortChange,
    };

    const employeeFiltersPanelProps = {
        city: cityFilter,
        cityOptions: employeeCityOptions,
        selectedPositions: employeePositionFilters,
        positionOptions: employeeFilterOptions.positions,
        salaryMin: salarySliderMin,
        salaryMax: salarySliderMax,
        salaryBounds,
        shiftDatePreset,
        shiftDateCustom,
        favouritesOnly: favouriteFilter === "favourites",
        hideAppliedPosts,
        onCityChange: handleCityFilterChange,
        onPositionToggle: handleEmployeePositionToggle,
        onSalaryChange: handleEmployeeSalaryChange,
        onShiftDatePresetChange: setShiftDatePreset,
        onShiftDateCustomChange: setShiftDateCustom,
        onFavouritesOnlyChange: (enabled: boolean) =>
            setFavouriteFilter(enabled ? "favourites" : "all"),
        onHideAppliedPostsChange: setHideAppliedPosts,
    };

    const handleRemoveEmployeeFilter = (chipId: string) => {
        removeEmployeeActiveFilter(chipId, {
            onCityChange: handleCityFilterChange,
            onRestaurantChange: setRestaurantFilter,
            onPositionChange: setPositionFilter,
            onPositionToggle: handleEmployeePositionToggle,
            onMinSalaryChange: setMinSalaryInput,
            onMaxSalaryChange: setMaxSalaryInput,
            onSalaryRangeReset: () => {
                setSalarySliderMin(salaryBounds.min);
                setSalarySliderMax(salaryBounds.max);
            },
            onShiftDateReset: () => {
                setShiftDatePreset("any");
                setShiftDateCustom("");
            },
            onApplicationFilterChange: setEmployeeFilter,
            onFavouriteFilterChange: setFavouriteFilter,
            onFavouritesOnlyChange: (enabled) => setFavouriteFilter(enabled ? "favourites" : "all"),
            onHideAppliedPostsChange: setHideAppliedPosts,
            onSortReset: () => {
                setSortBy("createdAt");
                setSortDirection("desc");
            },
        });
    };

    const employerFiltersBarProps = {
        showLifecycle: true as const,
        showSort: true as const,
        sortMode: "employer" as const,
        showSalaryFilters: false as const,
        restaurantLabelKey: "filterLocation" as const,
        city: cityFilter,
        restaurant: restaurantFilter,
        position: positionFilter,
        minSalary: "",
        maxSalary: "",
        lifecycle: employerLifecycleFilter,
        sortValue: selectedEmployerSortValue,
        cityOptions: employerCityOptions,
        restaurantOptions: employerRestaurantOptions,
        positionOptions: employerPositionFilterOptions,
        onCityChange: handleCityFilterChange,
        onRestaurantChange: setRestaurantFilter,
        onPositionChange: setPositionFilter,
        onMinSalaryChange: () => undefined,
        onMaxSalaryChange: () => undefined,
        onLifecycleChange: setEmployerLifecycleFilter,
        onSortChange: handleEmployerSortChange,
    };

    const employerActiveFilterChips = useMemo(
        () =>
            buildEmployerActiveFilterChips(
                {
                    lifecycle: employerLifecycleFilter,
                    city: cityFilter,
                    restaurant: restaurantFilter,
                    position: positionFilter,
                    sortBy: employerSortBy,
                    sortDirection: employerSortDirection,
                    restaurantOptions: employerRestaurantOptions,
                },
                t
            ),
        [
            employerLifecycleFilter,
            cityFilter,
            restaurantFilter,
            positionFilter,
            employerSortBy,
            employerSortDirection,
            employerRestaurantOptions,
            t,
        ]
    );

    const handleRemoveEmployerFilter = (chipId: string) => {
        removeEmployerActiveFilter(chipId, {
            onLifecycleReset: () => setEmployerLifecycleFilter("active"),
            onCityChange: handleCityFilterChange,
            onRestaurantChange: setRestaurantFilter,
            onPositionChange: setPositionFilter,
            onSortReset: () => {
                setEmployerSortBy("startingDate");
                setEmployerSortDirection("asc");
            },
        });
    };

    const useEmployerFormDrawer = isEmployerShellView;
    const showLegacyEmployerFormPanel = role === "Employer" && !useEmployerFormDrawer && jobPostCreateFormOpened;
    const showLegacyEmployerFloatingButton = role === "Employer" && !useEmployerFormDrawer && !jobPostCreateFormOpened;

    const handleOpenEmployerJobPost = (jobPost: JobPost) => {
        navigate(`/oglasi-za-posao/${jobPost.id}`, { state: { jobPost } });
    };

    return (
        <div
            className={`${styles["posts-container"]} ${
                jobPostCreateFormOpened && !useEmployerFormDrawer ? styles["form-opened"] : ""
            } ${
                isEmployeeCandidateView || isGuestBrowse ? styles["posts-container-candidate"] : ""
            } ${isEmployerShellView ? styles["posts-container-employer"] : ""} ${
                isEmployerShellView && !isMobileEmployer && candidatesPanelJobPost
                    ? styles["posts-container-employer-split"]
                    : ""
            }`}
        >
            {isEmployeeCandidateView ? (
                <JobPostsFiltersDrawer
                    isOpen={isEmployeeFiltersOpen}
                    totalCount={employeeTotalCount}
                    onClose={() => setIsEmployeeFiltersOpen(false)}
                    onReset={clearEmployeeFilters}
                    filtersPanelProps={employeeFiltersPanelProps}
                />
            ) : null}
            {isEmployerShellView ? (
                <>
                    <JobPostsEmployerFiltersDrawer
                        isOpen={isEmployerFiltersOpen}
                        totalCount={employerTotalCount}
                        onClose={() => setIsEmployerFiltersOpen(false)}
                        onReset={clearEmployerFilters}
                        filtersBarProps={employerFiltersBarProps}
                    />
                    <JobPostsEmployerFormDrawer
                        isOpen={jobPostCreateFormOpened}
                        editingJobPost={editingJobPost}
                        onClose={closeJobPostForm}
                        onSubmit={reloadJobPosts}
                    />
                </>
            ) : null}
            <div className={styles["left-panel"]}>
            {isEmployerShellView ? (
                <div className={styles["employee-page-toolbar"]}>
                    <JobPostsEmployerHeader
                        onOpenFilters={handleOpenEmployerFilters}
                        onCreatePost={handleEmployerCreatePost}
                        activeFilterCount={employerActiveFilterChips.length}
                    />
                    <JobPostsActiveFilterChips
                        chips={employerActiveFilterChips}
                        onRemove={handleRemoveEmployerFilter}
                        onClearAll={clearEmployerFilters}
                    />
                    <p className={styles["results-count"]}>
                        {t("jobPosts.shownPostsCount", { count: employerTotalCount })}
                    </p>
                </div>
            ) : null}
            {isEmployeeCandidateView ? (
                <div className={styles["employee-page-toolbar"]}>
                    <JobPostsEmployeeHeader
                        onOpenFilters={() => setIsEmployeeFiltersOpen(true)}
                        activeFilterCount={employeeActiveFilterChips.length}
                    />
                    <JobPostsActiveFilterChips
                        chips={employeeActiveFilterChips}
                        onRemove={handleRemoveEmployeeFilter}
                        onClearAll={clearEmployeeFilters}
                    />
                    <p className={styles["results-count"]}>
                        {t("jobPosts.shownPostsCount", { count: employeeTotalCount })}
                    </p>
                </div>
            ) : null}
            {role === "Employer" && !isEmployerShellView && (
              <JobPostsFiltersBar
                {...employerFiltersBarProps}
                showClearFilters={hasEmployerFiltersActive}
                onClearFilters={clearEmployerFilters}
              />
            )}
            {role === "Employee" && !isEmployeeCandidateView && (
              <JobPostsFiltersBar
                {...employeeFiltersBarProps}
                showClearFilters={hasEmployeeFiltersActive}
                onClearFilters={clearEmployeeFilters}
              />
            )}
            {isGuestBrowse && (
              <>
                <div className={styles.guestBanner}>
                  <p>{t("publicBrowse.guestJobPostsBanner")}</p>
                  <div className={styles.guestBannerActions}>
                    <Link className={styles.guestBannerPrimary} to="/login">
                      {t("publicBrowse.signIn")}
                    </Link>
                    <Link className={styles.guestBannerSecondary} to="/registration/candidate">
                      {t("publicBrowse.register")}
                    </Link>
                  </div>
                </div>
                <JobPostsFiltersBar
                  {...employeeFiltersBarProps}
                  showApplicationFilters={false}
                  showClearFilters={
                    Boolean(cityFilter) ||
                    Boolean(restaurantFilter) ||
                    Boolean(positionFilter) ||
                    sortBy !== "createdAt" ||
                    sortDirection !== "desc"
                  }
                  onClearFilters={clearEmployeeFilters}
                />
                <p className={styles["results-count"]}>
                  {t("jobPosts.shownPostsCount", { count: guestTotalCount })}
                </p>
              </>
            )}
            <div
              ref={leftPanelRef}
              className={`${styles["posts-list"]} ${isListRefetching ? styles["posts-list-refetching"] : ""}`}
            >
            {isListRefetching && (
              <div className={styles["posts-list-loading"]} aria-live="polite">
                {t("common.loading")}
              </div>
            )}
            {visibleJobPosts.map((jobPost: JobPost) => {
          const isMyPost = role === "Employer" && me && "id" in me && jobPost.employerId === me.id;
          const isEmployee = role === "Employee";
          const isGuest = isGuestBrowse;
          const hasApplied = appliedJobPostIdSet.has(jobPost.id);
          const isArchivedPost = Boolean(jobPost.isArchived);
          const isDraftPost = jobPost.status === "Draft";
          return (
            <div
              key={jobPost.id}
              className={`${styles["jobpost-card-wrapper"]} ${isMyPost && isMobileEmployer ? styles["jobpost-card-wrapper-mobile"] : ""}`}
            >
              {isMyPost && isMobileEmployer ? (
                <EmployerJobPostMobileCard jobPost={jobPost} onOpen={handleOpenEmployerJobPost} />
              ) : (
                <>
              {isMyPost && (
                <span
                  className={`${styles["employer-lifecycle-badge"]} ${
                    isArchivedPost
                      ? styles["employer-lifecycle-archived"]
                      : isDraftPost
                        ? styles["employer-lifecycle-draft"]
                        : styles["employer-lifecycle-active"]
                  }`}
                >
                  {isArchivedPost
                    ? t("jobPosts.lifecycleArchived")
                    : isDraftPost
                      ? t("jobPostForm.statusDraft")
                      : t("jobPosts.lifecycleActive")}
                </span>
              )}
              {isMyPost && !isMobileEmployer && (
                <div
                  className={styles["employer-applicant-count"]}
                  aria-label={t("jobPosts.applicationsCount", { count: jobPost.applicantCount ?? 0 })}
                >
                  <UsersIcon className={styles["employer-applicant-count-icon"]} aria-hidden />
                  <span>{t("jobPosts.applicationsCount", { count: jobPost.applicantCount ?? 0 })}</span>
                </div>
              )}
              {!isEmployee && (
                <JobPostItem
                  jobPost={jobPost}
                  disableCardHover={isMyPost}
                  showShiftDate={isMyPost}
                  isSelected={
                    isMyPost &&
                    !isMobileEmployer &&
                    candidatesPanelJobPost?.id === jobPost.id
                  }
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
              {isGuest && (
                <div className={styles["guest-card-actions"]}>
                  <Link className={styles["apply-button"]} to="/login">
                    {t("publicBrowse.loginToApply")}
                  </Link>
                </div>
              )}
              {isMyPost && !isMobileEmployer && isEmployerShellView && (
                <div className={styles["applicants-button-anchor"]}>
                  <button
                    type="button"
                    className={styles["show-candidates-button"]}
                    onClick={() => setCandidatesPanelJobPost(jobPost)}
                  >
                    {t("applicants.seeApplicants")}
                  </button>
                </div>
              )}
              {isMyPost && !isMobileEmployer && !isEmployerShellView && (
                <div className={styles["applicants-button-anchor"]}>
                  <EmployerApplicantsPanel jobPostId={jobPost.id} variant="inlineCard" />
                </div>
              )}
                </>
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
              <p className={styles["empty-message"]}>{getEmployeeEmptyMessage()}</p>
            )}
            {role === "Employer" && (employerJobPosts?.length ?? 0) === 0 && !isEmployerJobPostsLoading && (
              <p className={styles["empty-message"]}>{getEmployerEmptyMessage()}</p>
            )}
            {isGuestBrowse && (guestJobPosts?.length ?? 0) === 0 && !isGuestJobPostsLoading && (
              <p className={styles["empty-message"]}>{getEmployeeEmptyMessage()}</p>
            )}
            {(role === "Employee" || role === "Employer" || isGuestBrowse) && (
              <LazyLoadSentinel
                hasMore={
                  role === "Employee"
                    ? hasMoreEmployeeJobPosts
                    : role === "Employer"
                      ? hasMoreEmployerJobPosts
                      : hasMoreGuestJobPosts
                }
                isLoading={
                  role === "Employee"
                    ? isEmployeeJobPostsLoading || isEmployeeJobPostsLoadingMore
                    : role === "Employer"
                      ? isEmployerJobPostsLoading || isEmployerJobPostsLoadingMore
                      : isGuestJobPostsLoading || isGuestJobPostsLoadingMore
                }
                onLoadMore={
                  role === "Employee"
                    ? loadMoreEmployeeJobPosts
                    : role === "Employer"
                      ? loadMoreEmployerJobPosts
                      : loadMoreGuestJobPosts
                }
                visibleCount={
                  role === "Employee"
                    ? (employeeJobPosts?.length ?? 0)
                    : role === "Employer"
                      ? (employerJobPosts?.length ?? 0)
                      : (guestJobPosts?.length ?? 0)
                }
                totalCount={
                  role === "Employee"
                    ? employeeTotalCount
                    : role === "Employer"
                      ? employerTotalCount
                      : guestTotalCount
                }
              />
            )}
            </div>
            </div>

            {isEmployerShellView && !isMobileEmployer && candidatesPanelJobPost ? (
                <EmployerJobPostCandidatesSidePanel
                    jobPost={candidatesPanelJobPost}
                    onClose={() => setCandidatesPanelJobPost(null)}
                />
            ) : null}

            {showLegacyEmployerFormPanel && (
                <div className={styles["right-panel"]}>
                    <JobPostForm
                        key={editingJobPostId ?? "create"}
                        initialData={editingJobPost}
                        onClose={closeJobPostForm}
                        onSubmit={reloadJobPosts}
                    />
                </div>
            )}

            {showLegacyEmployerFloatingButton && (
                <button
                    className={styles["floating-button"]}
                    onClick={handleEmployerCreatePost}
                >
                    {t("jobPosts.createPost")}
                </button>
            )}
        </div>
    );
}

export default JobPosts;