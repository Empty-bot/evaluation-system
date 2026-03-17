-- =============================================================================
-- Script d'initialisation de la base de données
-- Reflète l'état final du schéma (fusion de toutes les migrations)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS evaluation_system;
USE evaluation_system;

-- ─── Table des utilisateurs ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    email               VARCHAR(255) NOT NULL UNIQUE,
    password            VARCHAR(255) NOT NULL,
    role                ENUM('admin', 'teacher', 'student', 'quality_manager') NOT NULL,
    department          VARCHAR(100),
    first_name          VARCHAR(50) NOT NULL DEFAULT '',
    surname             VARCHAR(50) NOT NULL DEFAULT '',
    reset_token         VARCHAR(255) NULL,
    reset_token_expiry  BIGINT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Index pour optimiser les recherches
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
);

-- ─── Table des cours (éléments constitutifs) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    code        VARCHAR(50) NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    department  ENUM('DSTI', 'DGAE', 'DGO', 'DU2ADT', 'DST2AN') NOT NULL,
    level       ENUM('Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2') NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Index pour optimiser les recherches
    INDEX idx_course_code (code)
);

-- ─── Table des questionnaires ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questionnaires (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    status      ENUM('draft', 'published', 'closed') NOT NULL DEFAULT 'draft',
    course_id   INT NOT NULL,
    deadline    DATETIME,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- ─── Table des questions ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questions (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    questionnaire_id    INT NOT NULL,
    label               TEXT NOT NULL,
    type                ENUM('text', 'multiple_choice', 'single_choice') NOT NULL,
    possible_answers    JSON NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE
);

-- ─── Table des réponses (anonymisées) ────────────────────────────────────────
-- Pas de user_id : l'anonymat est garanti via anonymous_id (hash SHA256)
CREATE TABLE IF NOT EXISTS responses (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    anonymous_id        VARCHAR(255) NOT NULL,
    questionnaire_id    INT NOT NULL,
    question_id         INT NOT NULL,
    answer              TEXT NOT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Index pour améliorer la rapidité des requêtes
    INDEX idx_response_questionnaire_id (questionnaire_id),
    INDEX idx_response_question_id (question_id),

    FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    -- Un anonymous_id ne peut répondre qu'une seule fois à chaque question
    CONSTRAINT unique_response UNIQUE (anonymous_id, question_id)
);

-- ─── Table des inscriptions ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    user_id     INT NOT NULL,
    course_id   INT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT unique_enrollment UNIQUE (user_id, course_id)
);