
CREATE DATABASE IF NOT EXISTS intelligent_campus;
USE intelligent_campus;

-- =========================================
-- 1. ROLE-BASED ACCESS CONTROL
-- =========================================

CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE permissions (
    permission_id INT AUTO_INCREMENT PRIMARY KEY,
    permission_name VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id)
);

-- =========================================
-- 2. USERS AND PROFILES
-- =========================================

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

CREATE TABLE student_profiles (
    user_id INT PRIMARY KEY,
    srn VARCHAR(30) NOT NULL UNIQUE,
    department VARCHAR(80),
    academic_year INT,
    graduation_year INT,
    bio TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    CHECK (academic_year BETWEEN 1 AND 6)
);

CREATE TABLE organizer_profiles (
    user_id INT PRIMARY KEY,
    organization_name VARCHAR(150) NOT NULL,
    organization_type VARCHAR(60),
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- =========================================
-- 3. OPPORTUNITY MANAGEMENT
-- =========================================

CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(80) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE opportunities (
    opportunity_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category_id INT NOT NULL,
    created_by INT NOT NULL,
    opportunity_type ENUM(
        'INTERNSHIP',
        'HACKATHON',
        'WORKSHOP',
        'COMPETITION',
        'RESEARCH',
        'OTHER'
    ) NOT NULL,
    location VARCHAR(150),
    application_deadline DATE,
    status ENUM(
        'DRAFT',
        'PUBLISHED',
        'CLOSED',
        'CANCELLED'
    ) DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    INDEX idx_opportunity_status (status),
    INDEX idx_opportunity_deadline (application_deadline)
);

-- =========================================
-- 4. SKILLS AND SKILL MAPPING
-- =========================================

CREATE TABLE skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE student_skills (
    user_id INT NOT NULL,
    skill_id INT NOT NULL,
    proficiency ENUM(
        'BEGINNER',
        'INTERMEDIATE',
        'ADVANCED'
    ) DEFAULT 'BEGINNER',
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES student_profiles(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id)
);

CREATE TABLE opportunity_skills (
    opportunity_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (opportunity_id, skill_id),
    FOREIGN KEY (opportunity_id)
        REFERENCES opportunities(opportunity_id)
        ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id)
);

-- =========================================
-- 5. APPLICATION MANAGEMENT
-- =========================================

CREATE TABLE applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    opportunity_id INT NOT NULL,
    student_id INT NOT NULL,
    application_status ENUM(
        'APPLIED',
        'SHORTLISTED',
        'REJECTED',
        'ACCEPTED',
        'WITHDRAWN'
    ) DEFAULT 'APPLIED',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (opportunity_id)
        REFERENCES opportunities(opportunity_id),
    FOREIGN KEY (student_id)
        REFERENCES student_profiles(user_id),
    UNIQUE (opportunity_id, student_id)
);

-- =========================================
-- 6. EVENTS AND REGISTRATIONS
-- =========================================

CREATE TABLE events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    opportunity_id INT UNIQUE,
    event_date DATETIME NOT NULL,
    venue VARCHAR(150),
    capacity INT,
    FOREIGN KEY (opportunity_id)
        REFERENCES opportunities(opportunity_id),
    CHECK (capacity IS NULL OR capacity > 0)
);

CREATE TABLE registrations (
    registration_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    student_id INT NOT NULL,
    registration_status ENUM(
        'REGISTERED',
        'CANCELLED',
        'ATTENDED'
    ) DEFAULT 'REGISTERED',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(event_id),
    FOREIGN KEY (student_id)
        REFERENCES student_profiles(user_id),
    UNIQUE (event_id, student_id)
);

-- =========================================
-- 7. CLUB MANAGEMENT
-- =========================================

CREATE TABLE clubs (
    club_id INT AUTO_INCREMENT PRIMARY KEY,
    club_name VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    faculty_coordinator INT,
    FOREIGN KEY (faculty_coordinator) REFERENCES users(user_id)
);

CREATE TABLE club_members (
    club_id INT NOT NULL,
    student_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    membership_status ENUM(
        'ACTIVE',
        'INACTIVE'
    ) DEFAULT 'ACTIVE',
    PRIMARY KEY (club_id, student_id),
    FOREIGN KEY (club_id) REFERENCES clubs(club_id),
    FOREIGN KEY (student_id)
        REFERENCES student_profiles(user_id)
);

-- =========================================
-- 8. NOTIFICATIONS
-- =========================================

CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- =========================================
-- END OF INITIAL SCHEMA
-- =========================================
