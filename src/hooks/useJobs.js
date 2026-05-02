/**
 * useJobs — fetches live jobs from our /api/jobs backend,
 * merges with Firestore admin jobs and static BD jobs.
 * Adzuna API key stays safely on the server.
 */
import { useState, useEffect, useCallback } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'

const STATIC_JOBS = [
  { id:'bd1',  title:'Frontend Developer (React)',   company:{display_name:'bKash Limited'},    location:{display_name:'Dhaka, Bangladesh'}, description:'Build and maintain responsive UIs with React.js. Work with REST APIs, implement state management, collaborate with backend teams.',          salary_min:40000, salary_max:70000,  contract_type:'Full-time', created:new Date(Date.now()-1*86400000).toISOString(), redirect_url:'#', category:{label:'IT Jobs'}, source:'local' },
  { id:'bd2',  title:'Backend Engineer (Node.js)',   company:{display_name:'Shohoz'},            location:{display_name:'Dhaka, Bangladesh'}, description:'Design scalable RESTful APIs. Experience with MongoDB, PostgreSQL, microservices architecture required.',                                  salary_min:50000, salary_max:85000,  contract_type:'Full-time', created:new Date(Date.now()-2*86400000).toISOString(), redirect_url:'#', category:{label:'IT Jobs'}, source:'local' },
  { id:'bd3',  title:'Data Analyst',                 company:{display_name:'Grameenphone'},      location:{display_name:'Dhaka, Bangladesh'}, description:'Analyze large datasets, build dashboards and derive business insights. Python, SQL, and Power BI preferred.',                            salary_min:35000, salary_max:60000,  contract_type:'Full-time', created:new Date(Date.now()-3*86400000).toISOString(), redirect_url:'#', category:{label:'IT Jobs'}, source:'local' },
  { id:'bd4',  title:'UI/UX Designer',               company:{display_name:'BJIT Group'},        location:{display_name:'Dhaka, Bangladesh'}, description:'Create wireframes, prototypes and high-fidelity designs for web and mobile apps. Proficiency in Figma required.',                        salary_min:30000, salary_max:55000,  contract_type:'Full-time', created:new Date(Date.now()-4*86400000).toISOString(), redirect_url:'#', category:{label:'Design Jobs'}, source:'local' },
  { id:'bd5',  title:'Full Stack Developer (MERN)',  company:{display_name:'Brain Station 23'},  location:{display_name:'Dhaka, Bangladesh'}, description:'Develop end-to-end web applications using MERN stack. Strong JavaScript fundamentals and team collaboration skills required.',           salary_min:55000, salary_max:90000,  contract_type:'Full-time', created:new Date(Date.now()-1*86400000).toISOString(), redirect_url:'#', category:{label:'IT Jobs'}, source:'local' },
  { id:'bd6',  title:'DevOps Engineer',              company:{display_name:'Robi Axiata'},       location:{display_name:'Dhaka, Bangladesh'}, description:'Manage CI/CD pipelines, Docker containers, Kubernetes clusters, and AWS infrastructure. Terraform experience is a plus.',              salary_min:60000, salary_max:100000, contract_type:'Full-time', created:new Date(Date.now()-5*86400000).toISOString(), redirect_url:'#', category:{label:'IT Jobs'}, source:'local' },
  { id:'bd7',  title:'Python Developer (ML/AI)',     company:{display_name:'DataSoft Systems'},  location:{display_name:'Dhaka, Bangladesh'}, description:'Build machine learning models and data pipelines. Experience with TensorFlow, scikit-learn, and NLP required.',                         salary_min:50000, salary_max:85000,  contract_type:'Full-time', created:new Date(Date.now()-2*86400000).toISOString(), redirect_url:'#', category:{label:'IT Jobs'}, source:'local' },
  { id:'bd8',  title:'Project Manager (IT)',         company:{display_name:'Samsung R&D BD'},    location:{display_name:'Dhaka, Bangladesh'}, description:'Lead software projects from planning to delivery. PMP or PRINCE2 certification preferred. Agile/Scrum required.',                      salary_min:70000, salary_max:120000, contract_type:'Full-time', created:new Date(Date.now()-6*86400000).toISOString(), redirect_url:'#', category:{label:'IT Jobs'}, source:'local' },
  { id:'bd9',  title:'Mobile Developer (Flutter)',   company:{display_name:'Pathao'},            location:{display_name:'Dhaka, Bangladesh'}, description:'Build cross-platform mobile apps using Flutter and Dart. Experience with Firebase and state management required.',                       salary_min:45000, salary_max:75000,  contract_type:'Full-time', created:new Date(Date.now()-3*86400000).toISOString(), redirect_url:'#', category:{label:'IT Jobs'}, source:'local' },
  { id:'bd10', title:'QA Engineer',                  company:{display_name:'Chaldal'},           location:{display_name:'Dhaka, Bangladesh'}, description:'Design test plans, perform manual and automated testing. Experience with Selenium, Cypress or Playwright preferred.',                   salary_min:28000, salary_max:50000,  contract_type:'Full-time', created:new Date(Date.now()-7*86400000).toISOString(), redirect_url:'#', category:{label:'IT Jobs'}, source:'local' },
  { id:'bd11', title:'Cybersecurity Analyst',        company:{display_name:'Dutch-Bangla Bank'}, location:{display_name:'Dhaka, Bangladesh'}, description:'Monitor systems for security threats, conduct vulnerability assessments and implement security protocols. CISSP/CEH preferred.',         salary_min:55000, salary_max:95000,  contract_type:'Full-time', created:new Date(Date.now()-2*86400000).toISOString(), redirect_url:'#', category:{label:'IT Jobs'}, source:'local' },
  { id:'bd12', title:'React Native Developer',       company:{display_name:'Kona Software Lab'}, location:{display_name:'Dhaka, Bangladesh'}, description:'Develop and maintain mobile apps using React Native. Strong knowledge of JavaScript, REST APIs and mobile deployment required.',         salary_min:45000, salary_max:80000,  contract_type:'Full-time', created:new Date(Date.now()-1*86400000).toISOString(), redirect_url:'#', category:{label:'IT Jobs'}, source:'local' },
]

async function fetchFromFirestore() {
  try {
    const snap = await getDocs(query(collection(db, 'jobs'), orderBy('created', 'desc')))
    return snap.docs.map(d => ({ id: d.id, ...d.data(), source: 'admin' }))
  } catch { return [] }
}

async function fetchFromBackend(q = 'developer') {
  try {
    const res  = await fetch(`/api/jobs?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    return data.jobs || []
  } catch { return [] }
}

export function useJobs({ query = '', filter = 'all' } = {}) {
  const [jobs,    setJobs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [firestoreJobs, liveJobs] = await Promise.all([
        fetchFromFirestore(),
        fetchFromBackend(query || 'developer'),
      ])

      // Merge: live → admin → static (dedup by title+company)
      let merged = [...liveJobs, ...firestoreJobs]
      const keys = new Set(merged.map(j => `${j.title}-${j.company?.display_name || j.company}`))
      merged = [...merged, ...STATIC_JOBS.filter(j => !keys.has(`${j.title}-${j.company.display_name}`))]

      // Filter by category
      const byCat = filter === 'all' ? merged : merged.filter(j =>
        (j.category?.label || j.category || '').toLowerCase().includes(filter.toLowerCase())
      )

      // Filter by search query
      const byQ = query ? byCat.filter(j =>
        j.title?.toLowerCase().includes(query.toLowerCase()) ||
        (j.company?.display_name || j.company || '').toLowerCase().includes(query.toLowerCase()) ||
        j.description?.toLowerCase().includes(query.toLowerCase())
      ) : byCat

      setJobs(byQ)
    } catch (err) {
      setError(err.message)
      setJobs(STATIC_JOBS)
    } finally {
      setLoading(false)
    }
  }, [query, filter])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  return { jobs, loading, error, refetch: fetchJobs }
}
