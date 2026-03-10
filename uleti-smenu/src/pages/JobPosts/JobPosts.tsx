import { useEffect, useState } from "react";
import JobPostItem from "../../components/JobPosts/JobPostItem";

import styles from './JobPosts.module.scss';
import JobPostForm from "../../components/JobPosts/JobPostForm";
import { GetAllJobPosts, GetMyJobPosts } from "../../services/jobPost-service";
import { JobPost } from "../../models/JobPost.model";
import { useContext } from "react";
import { AuthContext } from "../../store/Auth-context";
import EmployerApplicantsPanel from "../../components/JobPosts/EmployerApplicantsPanel";

const JobPosts = () => {
    const { role, me } = useContext(AuthContext);
    const [jobPostCreateFormOpened, setJobPostCreatFormOpened] = useState(false);
    const [editingJobPostId, setEditingJobPostId] = useState<string | null>(null);

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

    useEffect(() =>{
        fetchJobPosts();
    },[]);

    const fetchJobPosts = async () => {
        try {
            const response = role === "Employer"
                ? await GetMyJobPosts()
                : await GetAllJobPosts();
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

    return (
        <div className={`${styles["posts-container"]} ${jobPostCreateFormOpened ? styles["form-opened"] : ""}`}>
            <div className={styles["left-panel"]}>
            {jobPosts.map((jobPost: JobPost) => {
          const isMyPost = role === "Employer" && me && "id" in me && jobPost.employerId === me.id;
          return (
            <div key={jobPost.id}>
              <JobPostItem jobPost={jobPost}/>
              {isMyPost && (
                <div className={styles["employer-actions"]}>
                  <button
                    className={styles["edit-button"]}
                    onClick={() => {
                      setEditingJobPostId(jobPost.id);
                      setJobPostCreatFormOpened(true);
                    }}
                  >
                    Izmeni oglas
                  </button>
                  <EmployerApplicantsPanel jobPostId={jobPost.id} />
                </div>
              )}
            </div>
          );
        })}
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
                    Napravi Oglas
                </button>
            )}
        </div>
    );
}

export default JobPosts;