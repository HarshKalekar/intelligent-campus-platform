
USE intelligent_campus;

-- =========================================
-- A. ROLES
-- =========================================

INSERT INTO roles (role_name) VALUES
('ADMIN'),
('ORGANIZER'),
('STUDENT');

-- =========================================
-- B. PERMISSIONS
-- =========================================

INSERT INTO permissions (permission_name) VALUES
('MANAGE_USERS'),
('MANAGE_OPPORTUNITIES'),
('APPROVE_OPPORTUNITIES'),
('VIEW_ANALYTICS'),
('APPLY_OPPORTUNITIES'),
('REGISTER_EVENTS'),
('MANAGE_APPLICATIONS');

-- =========================================
-- C. ROLE PERMISSIONS
-- =========================================

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r CROSS JOIN permissions p
WHERE r.role_name = 'ADMIN';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r JOIN permissions p
WHERE r.role_name = 'ORGANIZER'
AND p.permission_name IN (
    'MANAGE_OPPORTUNITIES',
    'MANAGE_APPLICATIONS',
    'VIEW_ANALYTICS'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r JOIN permissions p
WHERE r.role_name = 'STUDENT'
AND p.permission_name IN (
    'APPLY_OPPORTUNITIES',
    'REGISTER_EVENTS'
);

-- =========================================
-- D. USERS
-- =========================================
-- Passwords are temporary seed placeholders.
-- Replace with real bcrypt hashes before authentication.

INSERT INTO users
(full_name, email, password_hash)
VALUES
('Platform Admin', 'admin@campus.edu', 'SEED_ONLY_ADMIN'),
('Rahul Sharma', 'rahul@campus.edu', 'SEED_ONLY_ORG'),
('Priya Nair', 'priya@campus.edu', 'SEED_ONLY_ORG'),
('Arjun Rao', 'arjun@campus.edu', 'SEED_ONLY_ORG'),

('Aarav Mehta', 'aarav@campus.edu', 'SEED_ONLY_STUDENT'),
('Ananya Iyer', 'ananya@campus.edu', 'SEED_ONLY_STUDENT'),
('Rohan Kumar', 'rohan@campus.edu', 'SEED_ONLY_STUDENT'),
('Sneha Reddy', 'sneha@campus.edu', 'SEED_ONLY_STUDENT'),
('Karan Shah', 'karan@campus.edu', 'SEED_ONLY_STUDENT'),
('Ishita Das', 'ishita@campus.edu', 'SEED_ONLY_STUDENT'),
('Aditya Verma', 'aditya@campus.edu', 'SEED_ONLY_STUDENT'),
('Meera Joshi', 'meera@campus.edu', 'SEED_ONLY_STUDENT'),
('Vikram Singh', 'vikram@campus.edu', 'SEED_ONLY_STUDENT'),
('Diya Menon', 'diya@campus.edu', 'SEED_ONLY_STUDENT');

-- =========================================
-- E. ASSIGN ROLES
-- =========================================

INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u CROSS JOIN roles r
WHERE
    (u.email = 'admin@campus.edu' AND r.role_name = 'ADMIN')
    OR
    (u.email IN (
        'rahul@campus.edu',
        'priya@campus.edu',
        'arjun@campus.edu'
    ) AND r.role_name = 'ORGANIZER')
    OR
    (u.email NOT IN (
        'admin@campus.edu',
        'rahul@campus.edu',
        'priya@campus.edu',
        'arjun@campus.edu'
    ) AND r.role_name = 'STUDENT');

-- =========================================
-- F. STUDENT PROFILES
-- =========================================

INSERT INTO student_profiles
(user_id, srn, department, academic_year, graduation_year)
SELECT user_id,
       CONCAT('DEMO', LPAD(user_id, 4, '0')),
       'Computer Science',
       2,
       2028
FROM users
WHERE email IN (
    'aarav@campus.edu',
    'ananya@campus.edu',
    'rohan@campus.edu',
    'sneha@campus.edu',
    'karan@campus.edu',
    'ishita@campus.edu',
    'aditya@campus.edu',
    'meera@campus.edu',
    'vikram@campus.edu',
    'diya@campus.edu'
);

-- =========================================
-- G. ORGANIZER PROFILES
-- =========================================

INSERT INTO organizer_profiles
(user_id, organization_name, organization_type)
SELECT user_id,
       CASE email
           WHEN 'rahul@campus.edu' THEN 'Coding Club'
           WHEN 'priya@campus.edu' THEN 'Innovation Cell'
           WHEN 'arjun@campus.edu' THEN 'Placement Cell'
       END,
       'CAMPUS ORGANIZATION'
FROM users
WHERE email IN (
    'rahul@campus.edu',
    'priya@campus.edu',
    'arjun@campus.edu'
);

-- =========================================
-- H. CATEGORIES
-- =========================================

INSERT INTO categories (category_name, description)
VALUES
('Internship', 'Internship and work experience'),
('Hackathon', 'Coding competitions and hackathons'),
('Workshop', 'Technical and practical workshops'),
('Research', 'Academic and research opportunities'),
('Competition', 'Technical and non-technical competitions'),
('Placement', 'Placement and recruitment opportunities');

-- =========================================
-- I. SKILLS
-- =========================================

INSERT INTO skills (skill_name) VALUES
('Python'),
('Java'),
('C++'),
('JavaScript'),
('React'),
('Node.js'),
('MySQL'),
('MongoDB'),
('Machine Learning'),
('Artificial Intelligence'),
('Data Structures'),
('Cloud Computing'),
('Cybersecurity'),
('Blockchain'),
('Data Analytics');


-- =========================================
-- J. OPPORTUNITIES
-- =========================================

INSERT INTO opportunities
(title, description, category_id, created_by,
 opportunity_type, location, application_deadline, status)
VALUES
('AI/ML Research Internship',
 'Work on machine learning and AI research projects.',
 (SELECT category_id FROM categories WHERE category_name='Internship'),
 (SELECT user_id FROM users WHERE email='arjun@campus.edu'),
 'INTERNSHIP', 'Bengaluru', '2026-12-15', 'PUBLISHED'),

('National Coding Hackathon',
 'Build innovative software solutions in a 24-hour hackathon.',
 (SELECT category_id FROM categories WHERE category_name='Hackathon'),
 (SELECT user_id FROM users WHERE email='rahul@campus.edu'),
 'HACKATHON', 'PES University', '2026-12-01', 'PUBLISHED'),

('Full Stack Development Workshop',
 'Learn modern full-stack web development.',
 (SELECT category_id FROM categories WHERE category_name='Workshop'),
 (SELECT user_id FROM users WHERE email='priya@campus.edu'),
 'WORKSHOP', 'Bengaluru', '2026-11-25', 'PUBLISHED'),

('Blockchain Innovation Challenge',
 'Develop decentralized applications using blockchain.',
 (SELECT category_id FROM categories WHERE category_name='Competition'),
 (SELECT user_id FROM users WHERE email='rahul@campus.edu'),
 'COMPETITION', 'Online', '2026-12-10', 'PUBLISHED'),

('Data Science Internship',
 'Work with real-world datasets and predictive models.',
 (SELECT category_id FROM categories WHERE category_name='Internship'),
 (SELECT user_id FROM users WHERE email='arjun@campus.edu'),
 'INTERNSHIP', 'Bengaluru', '2026-12-20', 'PUBLISHED'),

('Cybersecurity Workshop',
 'Learn ethical hacking and network security fundamentals.',
 (SELECT category_id FROM categories WHERE category_name='Workshop'),
 (SELECT user_id FROM users WHERE email='priya@campus.edu'),
 'WORKSHOP', 'PES University', '2026-11-30', 'PUBLISHED'),

('Cloud Computing Research',
 'Explore distributed systems and cloud infrastructure.',
 (SELECT category_id FROM categories WHERE category_name='Research'),
 (SELECT user_id FROM users WHERE email='arjun@campus.edu'),
 'RESEARCH', 'Online', '2026-12-18', 'PUBLISHED'),

('Campus Startup Challenge',
 'Present innovative startup ideas and prototypes.',
 (SELECT category_id FROM categories WHERE category_name='Competition'),
 (SELECT user_id FROM users WHERE email='rahul@campus.edu'),
 'COMPETITION', 'PES University', '2026-12-05', 'PUBLISHED'),

('React and Node.js Internship',
 'Build scalable web applications with modern technologies.',
 (SELECT category_id FROM categories WHERE category_name='Internship'),
 (SELECT user_id FROM users WHERE email='arjun@campus.edu'),
 'INTERNSHIP', 'Bengaluru', '2026-12-22', 'PUBLISHED'),

('AI for Social Good Hackathon',
 'Build AI-powered solutions for social challenges.',
 (SELECT category_id FROM categories WHERE category_name='Hackathon'),
 (SELECT user_id FROM users WHERE email='rahul@campus.edu'),
 'HACKATHON', 'Online', '2026-12-12', 'PUBLISHED'),

('Advanced SQL Workshop',
 'Master SQL joins, procedures, triggers and optimization.',
 (SELECT category_id FROM categories WHERE category_name='Workshop'),
 (SELECT user_id FROM users WHERE email='priya@campus.edu'),
 'WORKSHOP', 'PES University', '2026-11-28', 'PUBLISHED'),

('Graduate Placement Preparation',
 'Prepare for technical interviews and recruitment.',
 (SELECT category_id FROM categories WHERE category_name='Placement'),
 (SELECT user_id FROM users WHERE email='arjun@campus.edu'),
 'OTHER', 'PES University', '2026-12-30', 'PUBLISHED');

-- =========================================
-- K. STUDENT SKILLS
-- =========================================

INSERT INTO student_skills (user_id, skill_id, proficiency)
SELECT u.user_id, s.skill_id, 'ADVANCED'
FROM users u CROSS JOIN skills s
WHERE
    (u.email='aarav@campus.edu'
     AND s.skill_name IN ('Python','Machine Learning','MySQL'))
 OR (u.email='ananya@campus.edu'
     AND s.skill_name IN ('JavaScript','React','Node.js'))
 OR (u.email='rohan@campus.edu'
     AND s.skill_name IN ('Python','Data Analytics','MySQL'))
 OR (u.email='sneha@campus.edu'
     AND s.skill_name IN ('Java','Data Structures','Cloud Computing'))
 OR (u.email='karan@campus.edu'
     AND s.skill_name IN ('C++','Blockchain','Java'))
 OR (u.email='ishita@campus.edu'
     AND s.skill_name IN ('Python','Artificial Intelligence','Machine Learning'))
 OR (u.email='aditya@campus.edu'
     AND s.skill_name IN ('Cybersecurity','Python','Cloud Computing'))
 OR (u.email='meera@campus.edu'
     AND s.skill_name IN ('React','JavaScript','MongoDB'))
 OR (u.email='vikram@campus.edu'
     AND s.skill_name IN ('Java','MySQL','Data Structures'))
 OR (u.email='diya@campus.edu'
     AND s.skill_name IN ('Python','Data Analytics','Artificial Intelligence'));

-- =========================================
-- L. OPPORTUNITY SKILLS
-- =========================================

INSERT INTO opportunity_skills (opportunity_id, skill_id)
SELECT o.opportunity_id, s.skill_id
FROM opportunities o CROSS JOIN skills s
WHERE
    (o.title='AI/ML Research Internship'
     AND s.skill_name IN ('Python','Machine Learning','Artificial Intelligence'))
 OR (o.title='National Coding Hackathon'
     AND s.skill_name IN ('Python','Java','Data Structures'))
 OR (o.title='Full Stack Development Workshop'
     AND s.skill_name IN ('React','Node.js','JavaScript'))
 OR (o.title='Blockchain Innovation Challenge'
     AND s.skill_name IN ('Blockchain','JavaScript'))
 OR (o.title='Data Science Internship'
     AND s.skill_name IN ('Python','Data Analytics','Machine Learning'))
 OR (o.title='Cybersecurity Workshop'
     AND s.skill_name IN ('Cybersecurity','Python'))
 OR (o.title='Cloud Computing Research'
     AND s.skill_name IN ('Cloud Computing','Python'))
 OR (o.title='Campus Startup Challenge'
     AND s.skill_name IN ('JavaScript','React'))
 OR (o.title='React and Node.js Internship'
     AND s.skill_name IN ('React','Node.js','MongoDB'))
 OR (o.title='AI for Social Good Hackathon'
     AND s.skill_name IN ('Python','Artificial Intelligence'))
 OR (o.title='Advanced SQL Workshop'
     AND s.skill_name IN ('MySQL','Data Analytics'))
 OR (o.title='Graduate Placement Preparation'
     AND s.skill_name IN ('Java','Data Structures'));

-- =========================================
-- M. APPLICATIONS
-- =========================================

INSERT INTO applications
(opportunity_id, student_id, application_status)
SELECT o.opportunity_id, u.user_id, 'APPLIED'
FROM opportunities o CROSS JOIN users u
WHERE
    (o.title='AI/ML Research Internship'
     AND u.email IN ('aarav@campus.edu','ishita@campus.edu'))
 OR (o.title='Data Science Internship'
     AND u.email IN ('rohan@campus.edu','diya@campus.edu'))
 OR (o.title='React and Node.js Internship'
     AND u.email IN ('ananya@campus.edu','meera@campus.edu'))
 OR (o.title='National Coding Hackathon'
     AND u.email IN ('karan@campus.edu','sneha@campus.edu'))
 OR (o.title='Blockchain Innovation Challenge'
     AND u.email='karan@campus.edu')
 OR (o.title='AI for Social Good Hackathon'
     AND u.email='ishita@campus.edu')
 OR (o.title='Cloud Computing Research'
     AND u.email='aditya@campus.edu')
 OR (o.title='Graduate Placement Preparation'
     AND u.email='vikram@campus.edu');

-- =========================================
-- N. EVENTS
-- =========================================

INSERT INTO events (opportunity_id, event_date, venue, capacity)
SELECT opportunity_id, '2026-12-05 10:00:00',
       'PES University RR Campus', 100
FROM opportunities
WHERE title='National Coding Hackathon';

INSERT INTO events (opportunity_id, event_date, venue, capacity)
SELECT opportunity_id, '2026-11-28 14:00:00',
       'PES University RR Campus', 50
FROM opportunities
WHERE title='Advanced SQL Workshop';

-- =========================================
-- O. EVENT REGISTRATIONS
-- =========================================

INSERT INTO registrations (event_id, student_id)
SELECT e.event_id, u.user_id
FROM events e CROSS JOIN users u
WHERE
    (e.opportunity_id = (
        SELECT opportunity_id FROM opportunities
        WHERE title='National Coding Hackathon'
    ) AND u.email IN ('karan@campus.edu','sneha@campus.edu'))
 OR (e.opportunity_id = (
        SELECT opportunity_id FROM opportunities
        WHERE title='Advanced SQL Workshop'
    ) AND u.email IN ('aarav@campus.edu','rohan@campus.edu'));

-- =========================================
-- END OF SEED DATA
-- =========================================
