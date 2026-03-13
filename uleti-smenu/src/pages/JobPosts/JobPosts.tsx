import { useEffect, useMemo, useState } from "react";
import JobPostItem from "../../components/JobPosts/JobPostItem";

import styles from './JobPosts.module.scss';
import JobPostForm from "../../components/JobPosts/JobPostForm";
import { GetAllJobPosts, GetMyJobPosts } from "../../services/jobPost-service";
import { JobPost } from "../../models/JobPost.model";
import { useContext } from "react";
import { AuthContext } from "../../store/Auth-context";
import EmployerApplicantsPanel from "../../components/JobPosts/EmployerApplicantsPanel";
import { ApplyToJobPost, GetMyApplications } from "../../services/application-service";
import { toast } from "react-toastify";
import { getImageUrl } from "../../helpers/getHelperUrl";
import { GetEmployersWithFavouriteStatus } from "../../services/user-service";
import { useTranslation } from "react-i18next";

const JobPosts = () => {
    const { t } = useTranslation();
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
    const editingJobPost = jobPosts.find((post) => post.id === editingJobPostId);
    const appliedJobPostIdSet = useMemo(() => new Set(appliedJobPostIds), [appliedJobPostIds]);
    const favouriteEmployerIdSet = useMemo(() => new Set(favouriteEmployerIds), [favouriteEmployerIds]);

    useEffect(() =>{
        fetchJobPosts();
    },[role, sortBy, sortDirection]);

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

    const fetchJobPosts = async () => {
        try {
            const response = role === "Employer"
                ? await GetMyJobPosts()
                : await GetAllJobPosts(sortBy, sortDirection);
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

    const selectedSortValue = `${sortBy}_${sortDirection}`;

    const handleSortChange = (value: string) => {
        switch (value) {
            case "createdAt_asc":
                setSortBy("createdAt");
                setSortDirection("asc");
                break;
            case "salary_desc":
                setSortBy("salary");
                setSortDirection("desc");
                break;
            case "salary_asc":
                setSortBy("salary");
                setSortDirection("asc");
                break;
            default:
                setSortBy("createdAt");
                setSortDirection("desc");
                break;
        }
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

    const filteredJobPosts = useMemo(() => {
        if (role !== "Employee") {
            return jobPosts;
        }

        if (employeeFilter === "notApplied") {
            return jobPosts.filter((jobPost) => !appliedJobPostIdSet.has(jobPost.id));
        }

        if (employeeFilter === "applied") {
            return jobPosts.filter((jobPost) => appliedJobPostIdSet.has(jobPost.id));
        }

        return jobPosts;
    }, [role, jobPosts, employeeFilter, appliedJobPostIdSet]);

    const employeeVisibleJobPosts = useMemo(() => {
        if (role !== "Employee") {
            return filteredJobPosts;
        }

        if (favouriteFilter === "favourites") {
            return filteredJobPosts.filter((jobPost) => favouriteEmployerIdSet.has(jobPost.employerId));
        }

        return filteredJobPosts;
    }, [role, filteredJobPosts, favouriteFilter, favouriteEmployerIdSet]);

    return (
        <div className={`${styles["posts-container"]} ${jobPostCreateFormOpened ? styles["form-opened"] : ""}`}>
            <div className={styles["left-panel"]}>
            {role === "Employee" && (
              <div className={styles["employee-filters"]}>
                <label htmlFor="employeeFilter">{t("jobPosts.show")}</label>
                <select
                  id="employeeFilter"
                  className={styles["employee-filter-select"]}
                  value={employeeFilter}
                  onChange={(event) => setEmployeeFilter(event.target.value as "all" | "notApplied" | "applied")}
                >
                  <option value="all">{t("jobPosts.all")}</option>
                  <option value="notApplied">{t("jobPosts.notApplied")}</option>
                  <option value="applied">{t("jobPosts.applied")}</option>
                </select>
                <label htmlFor="favouriteFilter">{t("jobPosts.restaurants")}</label>
                <select
                  id="favouriteFilter"
                  className={styles["employee-filter-select"]}
                  value={favouriteFilter}
                  onChange={(event) => setFavouriteFilter(event.target.value as "all" | "favourites")}
                >
                  <option value="all">{t("jobPosts.all")}</option>
                  <option value="favourites">{t("jobPosts.favoritesOnly")}</option>
                </select>
                <label htmlFor="sortFilter">{t("jobPosts.sort")}</label>
                <select
                  id="sortFilter"
                  className={styles["employee-filter-select"]}
                  value={selectedSortValue}
                  onChange={(event) => handleSortChange(event.target.value)}
                >
                  <option value="createdAt_desc">{t("jobPosts.newest")}</option>
                  <option value="createdAt_asc">{t("jobPosts.oldest")}</option>
                  <option value="salary_desc">{t("jobPosts.salaryHighLow")}</option>
                  <option value="salary_asc">{t("jobPosts.salaryLowHigh")}</option>
                </select>
              </div>
            )}
            {(role === "Employee" ? employeeVisibleJobPosts : filteredJobPosts).map((jobPost: JobPost) => {
          const isMyPost = role === "Employer" && me && "id" in me && jobPost.employerId === me.id;
          const isEmployee = role === "Employee";
          const hasApplied = appliedJobPostIdSet.has(jobPost.id);
          return (
            <div key={jobPost.id} className={styles["jobpost-card-wrapper"]}>
              {!isEmployee && <JobPostItem jobPost={jobPost}/>}
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
            </div>

            {role === "Employer" && jobPostCreateFormOpened && (
                <div className={styles["right-panel"]}>
                    <JobPostForm
                        initialData={editingJobPost}
                        onClose={() => {
                            setJobPostCreatFormOpened(false);
                            setEditingJobPostId(null);
                        }}
                        onSubmit={fetchJobPosts}
                    />
                </div>
            )}

            {role === "Employer" && !jobPostCreateFormOpened && (
                <button
                    className={styles["floating-button"]}
                    onClick={() => {
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