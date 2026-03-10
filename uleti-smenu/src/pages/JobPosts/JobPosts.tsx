import { useEffect, useState } from "react";
import JobPostItem from "../../components/JobPosts/JobPostItem";

import styles from './JobPosts.module.scss';
import JobPostForm from "../../components/JobPosts/JobPostForm";
import { GetAllJobPosts } from "../../services/jobPost-service";
import { JobPost } from "../../models/JobPost.model";
import { useContext } from "react";
import { AuthContext } from "../../store/Auth-context";

const JobPosts = () => {
    const { role } = useContext(AuthContext);
    const [jobPostCreateFormOpened, setJobPostCreatFormOpened] = useState(false);

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

    useEffect(() =>{
        fetchJobPosts();
    },[]);

    const fetchJobPosts = async () => {
        try {
            const response = await GetAllJobPosts();
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
          return (
            <div key={jobPost.id}>
              <JobPostItem jobPost={jobPost}/>
            </div>
          );
        })}
            </div>

            {role === "Employer" && jobPostCreateFormOpened && (
                <div className={styles["right-panel"]}>
                    <JobPostForm onClose={() => setJobPostCreatFormOpened(false)} />
                </div>
            )}

            {role === "Employer" && !jobPostCreateFormOpened && (
                <button
                    className={styles["floating-button"]}
                    onClick={() => setJobPostCreatFormOpened(true)}
                >
                    Napravi Oglas
                </button>
            )}
        </div>
    );
}

export default JobPosts;