import JobPostItem from "./JobPostItem";

import styles from './JobPosts.module.scss';

const JobPosts = () =>{
    return (
        <div className={styles["posts-container"]}>
        <JobPostItem/>
        <JobPostItem/>
        <JobPostItem/>
        <JobPostItem/>
        </div>
    )
}

export default JobPosts;