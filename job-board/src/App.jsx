import { useCallback, useEffect, useState } from 'react';
import moment from 'moment';

export default function App() {
  const [jobStories, setJobStories] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchJobStories = async () => {
      const response = await fetch('https://hacker-news.firebaseio.com/v0/jobstories.json');
      const jobIds = await response.json();
      if (isMounted) {
        setJobStories((prev) => [...prev, ...jobIds]);
      }
    };
    fetchJobStories();
    return () => {
      isMounted = false;
    };
  }, []);

  const loadJobs = useCallback(
    async (jobStories) => {
      const nextJobIds = jobStories?.slice(page * 6, page * 6 + 6);
      const nextJobs = await Promise.all(nextJobIds.map((jobId) => fetchJob(jobId)));
      setJobs((prev) => [...prev, ...nextJobs]);
    },
    [page],
  );

  useEffect(() => {
    let isMounted = true;
    if (isMounted && jobStories.length) {
      loadJobs(jobStories);
    }
    return () => {
      isMounted = false;
    };
  }, [jobStories, loadJobs]);

  const fetchJob = async (id) => {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
    const job = await response.json();
    return job;
  };

  return (
    <div className='container'>
      <div className='job-container'>
        <h3>Hacker News Job Board</h3>
        <div className='job-board'>
          {jobs.map((job, index) => (
            <div className='job-item' key={index}>
              <h4>{job.title}</h4>
              <div className='job-info'>
                <p>By {job.by} ~ </p>
                <p>{moment(job.time).format('DD/MM/YYYY, h:mm:ss a')}</p>
              </div>
            </div>
          ))}
        </div>
        <button className='btn-more' onClick={() => setPage((prev) => prev + 1)}>
          Load More
        </button>
      </div>
    </div>
  );
}
