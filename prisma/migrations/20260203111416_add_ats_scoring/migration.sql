-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('HR', 'CANDIDATE');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'LIVE', 'CLOSED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firebase_uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CANDIDATE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_openings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "job_type" TEXT NOT NULL,
    "experience_level" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "responsibilities" TEXT[],
    "required_skills" TEXT[],
    "preferred_skills" TEXT[],
    "stipend" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'LIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "jd_hard_requirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "jd_preferred_skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "jd_skill_normalization" JSONB,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "job_openings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "candidate_name" TEXT NOT NULL,
    "candidate_email" TEXT NOT NULL,
    "resume_url" TEXT NOT NULL,
    "github_url" TEXT,
    "portfolio_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ats_score" INTEGER,
    "ats_decision" TEXT,
    "ats_missing_skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ats_reasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "job_id" TEXT NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_firebase_uid_key" ON "users"("firebase_uid");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "job_openings" ADD CONSTRAINT "job_openings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "job_openings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
