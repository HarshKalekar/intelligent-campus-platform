# CampusConnect – Relational Schema

## 1. Role-Based Access Control

1. **ROLES**(
   role_id **PK**,
   role_name **UNIQUE**
   )

2. **PERMISSIONS**(
   permission_id **PK**,
   permission_name **UNIQUE**
   )

3. **ROLE_PERMISSIONS**(
   role_id **PK, FK** → ROLES(role_id),
   permission_id **PK, FK** → PERMISSIONS(permission_id)
   )

## 2. Users and Profiles

4. **USERS**(
   user_id **PK**,
   full_name,
   email **UNIQUE**,
   password_hash,
   is_active,
   created_at
   )

5. **USER_ROLES**(
   user_id **PK, FK** → USERS(user_id),
   role_id **PK, FK** → ROLES(role_id),
   assigned_at
   )

6. **STUDENT_PROFILES**(
   user_id **PK, FK** → USERS(user_id),
   srn **UNIQUE**,
   department,
   academic_year,
   graduation_year,
   bio
   )

7. **ORGANIZER_PROFILES**(
   user_id **PK, FK** → USERS(user_id),
   organization_name,
   organization_type,
   description
   )

## 3. Opportunity Management

8. **CATEGORIES**(
   category_id **PK**,
   category_name **UNIQUE**,
   description
   )

9. **OPPORTUNITIES**(
   opportunity_id **PK**,
   title,
   description,
   category_id **FK** → CATEGORIES(category_id),
   created_by **FK** → USERS(user_id),
   opportunity_type,
   location,
   application_deadline,
   status,
   created_at
   )

## 4. Skills and Skill Mapping

10. **SKILLS**(
    skill_id **PK**,
    skill_name **UNIQUE**
    )

11. **STUDENT_SKILLS**(
    user_id **PK, FK** → STUDENT_PROFILES(user_id),
    skill_id **PK, FK** → SKILLS(skill_id),
    proficiency
    )

12. **OPPORTUNITY_SKILLS**(
    opportunity_id **PK, FK** → OPPORTUNITIES(opportunity_id),
    skill_id **PK, FK** → SKILLS(skill_id)
    )

## 5. Application Management

13. **APPLICATIONS**(
    application_id **PK**,
    opportunity_id **FK** → OPPORTUNITIES(opportunity_id),
    student_id **FK** → STUDENT_PROFILES(user_id),
    application_status,
    applied_at,
    UNIQUE(opportunity_id, student_id)
    )

## 6. Events and Registrations

14. **EVENTS**(
    event_id **PK**,
    opportunity_id **FK, UNIQUE** → OPPORTUNITIES(opportunity_id),
    event_date,
    venue,
    capacity
    )

15. **REGISTRATIONS**(
    registration_id **PK**,
    event_id **FK** → EVENTS(event_id),
    student_id **FK** → STUDENT_PROFILES(user_id),
    registration_status,
    registered_at,
    UNIQUE(event_id, student_id)
    )

## 7. Club Management

16. **CLUBS**(
    club_id **PK**,
    club_name **UNIQUE**,
    description,
    faculty_coordinator **FK** → USERS(user_id)
    )

17. **CLUB_MEMBERS**(
    club_id **PK, FK** → CLUBS(club_id),
    student_id **PK, FK** → STUDENT_PROFILES(user_id),
    joined_at,
    membership_status
    )

## 8. Notifications

18. **NOTIFICATIONS**(
    notification_id **PK**,
    user_id **FK** → USERS(user_id),
    title,
    message,
    is_read,
    created_at
    )

---

## Important Database Constraints

- Primary keys uniquely identify each record.
- Foreign keys enforce referential integrity.
- UNIQUE constraints prevent duplicate emails, SRNs, skill names and category names.
- Composite primary keys are used in junction tables.
- Applications have a UNIQUE constraint on (opportunity_id, student_id).
- Registrations have a UNIQUE constraint on (event_id, student_id).
- Events enforce a UNIQUE opportunity_id.
- STUDENT_PROFILES checks academic_year BETWEEN 1 AND 6.
- EVENTS checks that capacity is NULL or greater than zero.
- CASCADE DELETE is configured for student and organizer profiles and notifications where specified in the SQL DDL.

## Normalization and Relationships

- One-to-many: USERS → OPPORTUNITIES.
- One-to-many: CATEGORIES → OPPORTUNITIES.
- Many-to-many: USERS ↔ ROLES through USER_ROLES.
- Many-to-many: ROLES ↔ PERMISSIONS through ROLE_PERMISSIONS.
- Many-to-many: STUDENTS ↔ SKILLS through STUDENT_SKILLS.
- Many-to-many: OPPORTUNITIES ↔ SKILLS through OPPORTUNITY_SKILLS.
- Many-to-many: STUDENTS ↔ OPPORTUNITIES through APPLICATIONS.
- Many-to-many: STUDENTS ↔ EVENTS through REGISTRATIONS.
- Many-to-many: CLUBS ↔ STUDENTS through CLUB_MEMBERS.
