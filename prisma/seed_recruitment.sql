
-- 1. Ensure a User exists to own the jobs
INSERT INTO users (id, firebase_uid, email, name, role, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'seed_user_uid', 'admin@hrtech.com', 'Admin User', 'HR', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 2. Create Job Openings
WITH admin_user AS (SELECT id FROM users LIMIT 1)
INSERT INTO job_openings (id, title, company_name, location, job_type, experience_level, description, responsibilities, required_skills, preferred_skills, status, created_by, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(), 
    'Senior Frontend Developer', 
    'TechCorp', 
    'Bangalore, India', 
    'Full-time', 
    'Senior', 
    'We are looking for an experienced Frontend Developer with React and Next.js skills.', 
    ARRAY['Develop UI components', 'Optimize performance', 'Collaborate with design team'], 
    ARRAY['React', 'TypeScript', 'Next.js', 'Tailwind CSS'], 
    ARRAY['Redux', 'GraphQL'], 
    'LIVE', 
    (SELECT id FROM admin_user), 
    NOW(), 
    NOW()
  ),
  (
    gen_random_uuid(), 
    'Product Designer', 
    'TechCorp', 
    'Mumbai, India', 
    'Full-time', 
    'Mid', 
    'Join our design team to build intuitive user experiences.', 
    ARRAY['Create wireframes', 'Conduct user research', 'Design high-fidelity mockups'], 
    ARRAY['Figma', 'Adobe XD', 'Prototyping'], 
    ARRAY['HTML/CSS knowledge'], 
    'LIVE', 
    (SELECT id FROM admin_user), 
    NOW(), 
    NOW()
  )
ON CONFLICT DO NOTHING;

-- 3. Create Applications (Candidates)
-- We need the Job IDs. Using CTEs/Subqueries.

WITH 
  job_frontend AS (SELECT id FROM job_openings WHERE title = 'Senior Frontend Developer' LIMIT 1),
  job_design AS (SELECT id FROM job_openings WHERE title = 'Product Designer' LIMIT 1)

INSERT INTO applications (id, candidate_name, candidate_email, resume_url, linkedin_url, ats_score, ats_decision, job_id, created_at)
VALUES
  -- Candidates for Frontend Role
  (
    gen_random_uuid(), 
    'Rahul Kumar', 
    'rahul.k@example.com', 
    'https://example.com/resume/rahul.pdf', 
    'https://linkedin.com/in/rahulkumar', 
    85, 
    'Qualified', 
    (SELECT id FROM job_frontend), 
    NOW() - INTERVAL '2 days'
  ),
  (
    gen_random_uuid(), 
    'Amit Singh', 
    'amit.s@example.com', 
    'https://example.com/resume/amit.pdf', 
    'https://linkedin.com/in/amitsingh', 
    45, 
    'Rejected', 
    (SELECT id FROM job_frontend), 
    NOW() - INTERVAL '5 days'
  ),
  (
    gen_random_uuid(), 
    'Sneha Gupta', 
    'sneha.g@example.com', 
    'https://example.com/resume/sneha.pdf', 
    'https://linkedin.com/in/snehagupta', 
    72, 
    'Qualified', 
    (SELECT id FROM job_frontend), 
    NOW() - INTERVAL '1 day'
  ),
   (
    gen_random_uuid(), 
    'Priya Sharma', 
    'priya.s@example.com', 
    'https://example.com/resume/priya.pdf', 
    'https://linkedin.com/in/priyasharma', 
    60, 
    'Pending', 
    (SELECT id FROM job_frontend), 
    NOW() - INTERVAL '3 days'
  ),

  -- Candidates for Design Role
  (
    gen_random_uuid(), 
    'Anjali Desai', 
    'anjali.d@example.com', 
    'https://example.com/resume/anjali.pdf', 
    'https://linkedin.com/in/anjalidesai', 
    90, 
    'Qualified', 
    (SELECT id FROM job_design), 
    NOW() - INTERVAL '1 day'
  ),
  (
    gen_random_uuid(), 
    'Vikram Malhotra', 
    'vikram.m@example.com', 
    'https://example.com/resume/vikram.pdf', 
    'https://linkedin.com/in/vikrammalhotra', 
    55, 
    'Pending', 
    (SELECT id FROM job_design), 
    NOW() - INTERVAL '4 days'
  );
