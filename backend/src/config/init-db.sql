-- src/config/init-db.sql
CREATE DATABASE IF NOT EXISTS evaluation_system;
USE evaluation_system;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'student', 'quality_manager') NOT NULL,
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des éléments constitutifs (EC)
CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des questionnaires
CREATE TABLE IF NOT EXISTS questionnaires (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('draft', 'published') DEFAULT 'draft',
    course_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Table des questions
CREATE TABLE IF NOT EXISTS questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    questionnaire_id INT NOT NULL,
    label TEXT NOT NULL,
    type ENUM('text', 'multiple_choice', 'single_choice') NOT NULL,
    possible_answers JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE
);

-- Table des réponses aux questions
CREATE TABLE IF NOT EXISTS responses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    questionnaire_id INT NOT NULL,
    question_id INT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Table des inscriptions des étudiants aux cours
CREATE TABLE IF NOT EXISTS enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (user_id, course_id) -- Empêcher les doublons
);

-- Supprimer la contrainte de clé étrangère
ALTER TABLE responses DROP FOREIGN KEY responses_ibfk_1;

-- Supprimer la colonne user_id
ALTER TABLE responses DROP COLUMN user_id;

-- Ajouter la nouvelle colonne anonymous_id
ALTER TABLE responses ADD COLUMN anonymous_id VARCHAR(255) NOT NULL;


ALTER TABLE responses ADD CONSTRAINT unique_response UNIQUE (anonymous_id, question_id);

ALTER TABLE questionnaires ADD COLUMN status ENUM('draft', 'published', 'closed') NOT NULL DEFAULT 'draft';

ALTER TABLE users
ADD first_name VARCHAR(50) NOT NULL,
ADD surname VARCHAR(50) NOT NULL;

-- Indexer les tables pour améliorer la rapidité des requêtes
-- ALTER TABLE users ADD INDEX (email);
-- ALTER TABLE responses ADD INDEX (questionnaire_id);
-- ALTER TABLE responses ADD INDEX (question_id);

-- -- Index pour optimiser les recherches
-- CREATE INDEX idx_user_email ON users(email);
-- CREATE INDEX idx_user_role ON users(role);
-- CREATE INDEX idx_course_code ON courses(code);