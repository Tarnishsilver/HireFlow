
-- Enable UUID extension if needed (usually built-in on modern Postgres)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Insert Departments
INSERT INTO departments (id, name, color, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Engineering', 'bg-blue-100 text-blue-800', NOW(), NOW()),
  (gen_random_uuid(), 'Design', 'bg-pink-100 text-pink-800', NOW(), NOW()),
  (gen_random_uuid(), 'Product', 'bg-purple-100 text-purple-800', NOW(), NOW()),
  (gen_random_uuid(), 'Human Resources', 'bg-orange-100 text-orange-800', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Employees
-- Using CTEs to get Department IDs easily
WITH 
  dept_eng AS (SELECT id FROM departments WHERE name = 'Engineering'),
  dept_design AS (SELECT id FROM departments WHERE name = 'Design'),
  dept_prod AS (SELECT id FROM departments WHERE name = 'Product'),
  dept_hr AS (SELECT id FROM departments WHERE name = 'Human Resources')
INSERT INTO employees (id, first_name, last_name, email, job_title, contract_type, avatar_color, department_id, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Aarav', 'Sharma', 'aarav.sharma@company.com', 'Senior Frontend Developer', 'Full-time', 'bg-blue-500', (SELECT id FROM dept_eng), NOW(), NOW()),
  (gen_random_uuid(), 'Diya', 'Patel', 'diya.patel@company.com', 'UI/UX Designer', 'Full-time', 'bg-pink-500', (SELECT id FROM dept_design), NOW(), NOW()),
  (gen_random_uuid(), 'Vihaan', 'Singh', 'vihaan.singh@company.com', 'Product Manager', 'Full-time', 'bg-purple-500', (SELECT id FROM dept_prod), NOW(), NOW()),
  (gen_random_uuid(), 'Aditi', 'Gupta', 'aditi.gupta@company.com', 'HR Manager', 'Full-time', 'bg-orange-500', (SELECT id FROM dept_hr), NOW(), NOW()),
  (gen_random_uuid(), 'Rohan', 'Verma', 'rohan.verma@company.com', 'Backend Developer', 'Full-time', 'bg-indigo-500', (SELECT id FROM dept_eng), NOW(), NOW()),
  (gen_random_uuid(), 'Kavya', 'Iyer', 'kavya.iyer@company.com', 'Visual Designer', 'Contract', 'bg-rose-500', (SELECT id FROM dept_design), NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 3. Set Manager (Rohan reports to Aarav)
UPDATE employees 
SET manager_id = (SELECT id FROM employees WHERE email = 'aarav.sharma@company.com')
WHERE email = 'rohan.verma@company.com';

-- 4. Create Leave Requests (Rohan)
INSERT INTO leave_requests (id, type, status, start_date, end_date, reason, employee_id, created_at, updated_at)
VALUES (
  gen_random_uuid(), 
  'Sick', 
  'Approved', 
  '2026-02-10 00:00:00', 
  '2026-02-12 00:00:00', 
  'Viral fever', 
  (SELECT id FROM employees WHERE email = 'rohan.verma@company.com'), 
  NOW(), 
  NOW()
);

-- 5. Create Work Logs (Aarav - last 7 days)
INSERT INTO work_logs (id, date, hours_worked, overtime, status, employee_id, created_at, updated_at)
VALUES 
  (gen_random_uuid(), CURRENT_DATE - INTERVAL '1 day', 8.5, 0.5, 'On Time', (SELECT id FROM employees WHERE email = 'aarav.sharma@company.com'), NOW(), NOW()),
  (gen_random_uuid(), CURRENT_DATE - INTERVAL '2 days', 7.5, 0, 'On Time', (SELECT id FROM employees WHERE email = 'aarav.sharma@company.com'), NOW(), NOW()),
  (gen_random_uuid(), CURRENT_DATE - INTERVAL '3 days', 8.0, 0, 'On Time', (SELECT id FROM employees WHERE email = 'aarav.sharma@company.com'), NOW(), NOW()),
  (gen_random_uuid(), CURRENT_DATE - INTERVAL '4 days', 9.0, 1.0, 'On Time', (SELECT id FROM employees WHERE email = 'aarav.sharma@company.com'), NOW(), NOW()),
  (gen_random_uuid(), CURRENT_DATE - INTERVAL '5 days', 8.0, 0, 'On Time', (SELECT id FROM employees WHERE email = 'aarav.sharma@company.com'), NOW(), NOW()),
  (gen_random_uuid(), CURRENT_DATE - INTERVAL '6 days', 6.5, 0, 'Late', (SELECT id FROM employees WHERE email = 'aarav.sharma@company.com'), NOW(), NOW()),
  (gen_random_uuid(), CURRENT_DATE - INTERVAL '7 days', 0, 0, 'Absent', (SELECT id FROM employees WHERE email = 'aarav.sharma@company.com'), NOW(), NOW());

-- 6. Create Company Payment Method
INSERT INTO company_payment_methods (id, card_holder, account_number, expiration, card_type, method_type, is_default, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'TechCorp India Pvt Ltd',
  '**** **** **** 8899',
  '12/28',
  'Visa',
  'Credit Card',
  true,
  NOW(),
  NOW()
);
