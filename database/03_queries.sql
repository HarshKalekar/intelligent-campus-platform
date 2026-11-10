
USE intelligent_campus;

-- Q1. Display all opportunities with their category
SELECT
    o.opportunity_id,
    o.title,
    c.category_name,
    o.opportunity_type,
    o.status
FROM opportunities o
INNER JOIN categories c
    ON o.category_id = c.category_id;

-- Q2. Display students and their applied opportunities
SELECT
    u.full_name,
    o.title,
    a.application_status,
    a.applied_at
FROM applications a
JOIN student_profiles sp
    ON a.student_id = sp.user_id
JOIN users u
    ON sp.user_id = u.user_id
JOIN opportunities o
    ON a.opportunity_id = o.opportunity_id;

-- Q3. Count applications for every opportunity
SELECT
    o.title,
    COUNT(a.application_id) AS application_count
FROM opportunities o
LEFT JOIN applications a
    ON o.opportunity_id = a.opportunity_id
GROUP BY o.opportunity_id, o.title
ORDER BY application_count DESC;

-- Q4. Display students and their registered events
SELECT
    u.full_name,
    o.title AS event_name,
    r.registration_status
FROM registrations r
JOIN student_profiles sp
    ON r.student_id = sp.user_id
JOIN users u
    ON sp.user_id = u.user_id
JOIN events e
    ON r.event_id = e.event_id
JOIN opportunities o
    ON e.opportunity_id = o.opportunity_id;

-- Q5. Display students with their skills
SELECT
    u.full_name,
    s.skill_name,
    ss.proficiency
FROM student_skills ss
JOIN users u
    ON ss.user_id = u.user_id
JOIN skills s
    ON ss.skill_id = s.skill_id
ORDER BY u.full_name;

-- Q6. Find matching student skills and opportunity requirements
SELECT
    u.full_name,
    o.title,
    s.skill_name
FROM student_skills ss
JOIN users u
    ON ss.user_id = u.user_id
JOIN skills s
    ON ss.skill_id = s.skill_id
JOIN opportunity_skills os
    ON s.skill_id = os.skill_id
JOIN opportunities o
    ON os.opportunity_id = o.opportunity_id
ORDER BY u.full_name, o.title;


-- Q7. Find students who have applied for at least one internship

SELECT full_name
FROM users
WHERE user_id IN (
    SELECT student_id
    FROM applications
    WHERE opportunity_id IN (
        SELECT opportunity_id
        FROM opportunities
        WHERE opportunity_type = 'INTERNSHIP'
    )
);

-- Q8. Find opportunities with applications
-- greater than the average applications per opportunity

SELECT title
FROM opportunities
WHERE opportunity_id IN (
    SELECT opportunity_id
    FROM applications
    GROUP BY opportunity_id
    HAVING COUNT(*) > (
        SELECT AVG(application_count)
        FROM (
            SELECT COUNT(*) AS application_count
            FROM applications
            GROUP BY opportunity_id
        ) AS application_stats
    )
);

-- Q9. Find students who have never applied

SELECT full_name
FROM users
WHERE user_id IN (
    SELECT user_id
    FROM student_profiles
    WHERE user_id NOT IN (
        SELECT student_id
        FROM applications
    )
);

-- Q10. Find the opportunities belonging to
-- the category with the highest number of opportunities

SELECT title
FROM opportunities
WHERE category_id = (
    SELECT category_id
    FROM opportunities
    GROUP BY category_id
    ORDER BY COUNT(*) DESC, category_id
    LIMIT 1
);


-- Q11. Find opportunities having more than one application

SELECT
    o.title
FROM opportunities o
WHERE (
    SELECT COUNT(*)
    FROM applications a
    WHERE a.opportunity_id = o.opportunity_id
) > 1;

-- Q12. Find students who have applied to at least
-- one opportunity requiring their skills

SELECT u.full_name
FROM users u
JOIN student_profiles sp
    ON u.user_id = sp.user_id
WHERE EXISTS (
    SELECT 1
    FROM applications a
    JOIN opportunity_skills os
        ON a.opportunity_id = os.opportunity_id
    JOIN student_skills ss
        ON os.skill_id = ss.skill_id
    WHERE a.student_id = sp.user_id
      AND ss.user_id = sp.user_id
);

-- Q13. Find students who have more applications
-- than the average applications per student

SELECT
    u.full_name
FROM users u
JOIN student_profiles sp
    ON u.user_id = sp.user_id
WHERE (
    SELECT COUNT(*)
    FROM applications a
    WHERE a.student_id = sp.user_id
) > (
    SELECT AVG(student_application_count)
    FROM (
        SELECT COUNT(*) AS student_application_count
        FROM student_profiles sp2
        LEFT JOIN applications a2
            ON sp2.user_id = a2.student_id
        GROUP BY sp2.user_id
    ) AS student_stats
);
