"use client";

import { useState } from "react";
import {
  Search,
  Bell,
  Share2,
  UserCheck,
  Download,
  Plus,
  ChevronLeft,
  ChevronDown,
  Filter,
  FileText,
  MessageCircle,
  Pencil,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

// ─── Top Bar ─────────────────────────────────────────────────────────────
function TopBar() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="relative w-[320px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search keyword..."
          className="w-full pl-10 pr-16 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[11px] text-gray-400 bg-gray-100 rounded-md px-1.5 py-0.5">
          <span>&#8984;</span>
          <span>K</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50">
          <Bell className="w-[18px] h-[18px]" />
        </button>
        <button className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50">
          <Share2 className="w-[18px] h-[18px]" />
        </button>
      </div>
    </div>
  );
}

// ─── Job List Data ───────────────────────────────────────────────────────
interface Job {
  id: string;
  title: string;
  description: string;
  department: string;
  deptColor: string;
  deptBg: string;
  deptDot: string;
  jobType: string;
  locationType: string;
  activeUntil: string;
}

const jobList: Job[] = [
  {
    id: "uiux",
    title: "UI/UX Designer",
    description:
      "Gathering and evaluating user requirements, in collaboration with product managers and engineers",
    department: "Design",
    deptColor: "text-green-700",
    deptBg: "bg-green-50",
    deptDot: "bg-green-500",
    jobType: "Full Time",
    locationType: "Onsite",
    activeUntil: "Jan 31, 2024",
  },
  {
    id: "jr-frontend",
    title: "Junior Frontend Developer",
    description:
      "A front-end developer is basically a web developer who has a specialization in creating user interfaces for applic...",
    department: "Development",
    deptColor: "text-indigo-700",
    deptBg: "bg-indigo-50",
    deptDot: "bg-indigo-500",
    jobType: "Full Time",
    locationType: "Remote",
    activeUntil: "Jan 31, 2024",
  },
  {
    id: "motion",
    title: "Motion Graphic Designer",
    description:
      "We are currently hiring a Motion Graphics Designer who will work closely with the marketing team, video produce...",
    department: "Design",
    deptColor: "text-green-700",
    deptBg: "bg-green-50",
    deptDot: "bg-green-500",
    jobType: "Full Time",
    locationType: "Onsite",
    activeUntil: "Jan 31, 2024",
  },
  {
    id: "seo",
    title: "SEO Specialist",
    description:
      "Program in HTML, CSS and JavaScript to ensure the site is accessible and easy to follow and for increased intera...",
    department: "Bussines and Marketing",
    deptColor: "text-orange-700",
    deptBg: "bg-orange-50",
    deptDot: "bg-orange-500",
    jobType: "Full Time",
    locationType: "Onsite",
    activeUntil: "Jan 31, 2024",
  },
  {
    id: "project-asst",
    title: "Project Assistant Manager",
    description:
      "Ensure that the project complies with the schedule, rules and regulations. Manage and coordinate with the entire t...",
    department: "Project Manager",
    deptColor: "text-blue-700",
    deptBg: "bg-blue-50",
    deptDot: "bg-blue-500",
    jobType: "Full Time",
    locationType: "Remote",
    activeUntil: "Jan 31, 2024",
  },
  {
    id: "intern-design",
    title: "Intern Graphic Design",
    description:
      "Develop illustrations, logos and other designs using software or by hand. Work with copywriters and creative...",
    department: "Design",
    deptColor: "text-green-700",
    deptBg: "bg-green-50",
    deptDot: "bg-green-500",
    jobType: "Full Time",
    locationType: "Onsite",
    activeUntil: "Jan 31, 2024",
  },
  {
    id: "3d-animation",
    title: "3D Animation (Junior-Middle)",
    description:
      "Using 3D modeling, texturing, mapping and other techniques to create graphics, visual effect and animation...",
    department: "Design",
    deptColor: "text-green-700",
    deptBg: "bg-green-50",
    deptDot: "bg-green-500",
    jobType: "Full Time",
    locationType: "Onsite",
    activeUntil: "Jan 31, 2024",
  },
  {
    id: "sr-webdev",
    title: "Senior Web Developer",
    description:
      "Able to communicate well and collaborate with other dev teams. Have strong skills in problem solving and debugg...",
    department: "Development",
    deptColor: "text-indigo-700",
    deptBg: "bg-indigo-50",
    deptDot: "bg-indigo-500",
    jobType: "Full Time",
    locationType: "Remote",
    activeUntil: "Jan 31, 2024",
  },
];

// ─── Job Card ────────────────────────────────────────────────────────────
function JobCard({ job, onClick }: { job: Job; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-[11px] text-gray-400">Active until:</span>
        <span className="text-[11px] font-semibold text-gray-700">
          {job.activeUntil}
        </span>
      </div>
      <h3 className="text-[15px] font-bold text-gray-900 mb-2">{job.title}</h3>
      <p className="text-[13px] text-gray-500 leading-relaxed mb-4 line-clamp-2">
        {job.description}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${job.deptBg} ${job.deptColor}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${job.deptDot}`}></span>
          {job.department}
        </span>
        <span className="text-[11px] text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
          {job.jobType}
        </span>
        <span className="text-[11px] text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
          {job.locationType}
        </span>
      </div>
    </div>
  );
}

// ─── Job List View ───────────────────────────────────────────────────────
function JobListView({ onSelectJob }: { onSelectJob: (job: Job) => void }) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Recruitment</h1>
            <p className="text-sm text-gray-400">Manage recruitment process</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
            Active Jobs
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 rounded-xl text-sm font-medium text-white hover:bg-indigo-700">
            <Plus className="w-4 h-4" />
            Create New Job
          </button>
        </div>
      </div>

      {/* Job Grid */}
      <div className="grid grid-cols-3 gap-4">
        {jobList.map((job) => (
          <JobCard key={job.id} job={job} onClick={() => onSelectJob(job)} />
        ))}
      </div>
    </div>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────
function Avatar({
  initials,
  color,
  size = "sm",
  image,
}: {
  initials: string;
  color: string;
  size?: "sm" | "md" | "lg";
  image?: string;
}) {
  const sizeClass =
    size === "lg"
      ? "w-10 h-10 text-xs"
      : size === "md"
      ? "w-9 h-9 text-[11px]"
      : "w-8 h-8 text-[10px]";
  if (image) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden bg-gray-200 shrink-0`}>
        <img src={image} alt={initials} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-semibold shrink-0 ${color}`}
    >
      {initials}
    </div>
  );
}

// ─── Job Description Tab ─────────────────────────────────────────────────
function JobDescriptionTab({ job }: { job: Job }) {
  return (
    <div className="flex gap-6">
      {/* Left content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Job Description</h2>
          <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-xl px-4 py-2 hover:bg-gray-50 font-medium">
            <Pencil className="w-4 h-4" />
            Description
          </button>
        </div>

        {/* About Company */}
        <div className="mb-6">
          <h3 className="text-base font-bold text-gray-900 mb-3">About Company</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            We craft digital products for business and user goals. Help find solutions with UI / UX designs that are intuitive and in
            accordance with client business goals. We provide a high-quality service in UI/ UX Design & Development. We craft
            digital products for businesses in achieving user goals by providing intuitive solutions. We have worked with a vast
            number clients who have different backgrounds such as construction, insurance, health, marketing, cryptocurrency,
            stocks, games, startup, real estate and many others.
          </p>
        </div>

        {/* What you'll do */}
        <div className="mb-6">
          <h3 className="text-base font-bold text-gray-900 mb-2">What you&apos;ll do</h3>
          <p className="text-sm text-gray-500 mb-3">Areas you could work on:</p>
          <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
            <li>Work as a User Interface Designer for our B2B SaaS product along with stakeholders</li>
            <li>
              Translate client briefs into a clear, user-friendly interface design and interactions. Develop both low and high-fidelity mockups.
            </li>
            <li>
              Testing out design assumptions and usability level of your design. Validate your design decisions through user
              feedback, iterate your designs based on this feedback, and meticulously document the process.
            </li>
            <li>Work closely with a team of project managers, client stakeholders, researchers, and content designers.</li>
            <li>Conduct user research and evaluate user feedback</li>
          </ul>
        </div>

        {/* Requirements */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Requirements:</h3>
          <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
            <li>A mid level product designer with min. 3 years of experience.</li>
            <li>
              A designer with a strong UX and UI portfolio that demonstrates problem-solving skills, design methods, and
              craftsmanship.
            </li>
            <li>An organized designer that always documents their works, Figma files, and research reports.</li>
            <li>Comfortable with fast-paced work environments, context switching, and excited to drive the projects forwards.</li>
            <li>
              Able to analyze your design process, outcome, and decisions that you&apos;ve made.
            </li>
          </ul>
        </div>
      </div>

      {/* Right sidebar info */}
      <div className="w-[220px] shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
          <div>
            <p className="text-xs text-gray-400 mb-1">Active until</p>
            <p className="text-sm font-semibold text-gray-900">{job.activeUntil}</p>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 mb-1">Department Type</p>
            <p className="text-sm font-semibold text-gray-900">{job.department}</p>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 mb-1">Job Type</p>
            <p className="text-sm font-semibold text-gray-900">{job.jobType === "Full Time" ? "Fulltime" : job.jobType}</p>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 mb-1">Location</p>
            <p className="text-sm font-semibold text-gray-900">{job.locationType === "Onsite" ? "Onsite Indonesia, Jakarta" : "Remote"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Candidates Tab ──────────────────────────────────────────────────────

interface Candidate {
  name: string;
  email: string;
  initials: string;
  avatarColor: string;
  source: string;
  files: number;
  comments: number;
}

const candidateColumns: {
  title: string;
  color: string;
  count: number;
  candidates: Candidate[];
}[] = [
  {
    title: "SOURCED",
    color: "bg-yellow-400",
    count: 20,
    candidates: [
      {
        name: "Sonia Hoppe",
        email: "hao-sonia92@gmail.com",
        initials: "SH",
        avatarColor: "bg-pink-100 text-pink-600",
        source: "LinkedIn",
        files: 4,
        comments: 1,
      },
      {
        name: "Melissa Bartoletti",
        email: "mel.barto@gmail.com",
        initials: "MB",
        avatarColor: "bg-purple-100 text-purple-600",
        source: "LinkedIn",
        files: 4,
        comments: 2,
      },
      {
        name: "Gina Steuber",
        email: "gina-stu32@gmail.com",
        initials: "GS",
        avatarColor: "bg-orange-100 text-orange-600",
        source: "LinkedIn",
        files: 4,
        comments: 2,
      },
      {
        name: "Caroline Stracke",
        email: "carolines@yahoo.com",
        initials: "CS",
        avatarColor: "bg-teal-100 text-teal-600",
        source: "LinkedIn",
        files: 0,
        comments: 0,
      },
    ],
  },
  {
    title: "IN PROGRESS",
    color: "bg-blue-500",
    count: 20,
    candidates: [
      {
        name: "Wilbur Hackett",
        email: "wilbur-hack@yahoo.com",
        initials: "WH",
        avatarColor: "bg-indigo-100 text-indigo-600",
        source: "LinkedIn",
        files: 2,
        comments: 1,
      },
      {
        name: "Keith Hirthe",
        email: "keith-hiirthe@yahoo.com",
        initials: "KH",
        avatarColor: "bg-green-100 text-green-600",
        source: "LinkedIn",
        files: 3,
        comments: 1,
      },
      {
        name: "Lisa Harvey",
        email: "helo-lisaa@hotmail.com",
        initials: "LH",
        avatarColor: "bg-yellow-100 text-yellow-600",
        source: "LinkedIn",
        files: 4,
        comments: 1,
      },
    ],
  },
  {
    title: "INTERVIEW",
    color: "bg-purple-500",
    count: 20,
    candidates: [
      {
        name: "Annette Dickinson",
        email: "anet-son@hotmail.com",
        initials: "AD",
        avatarColor: "bg-red-100 text-red-600",
        source: "LinkedIn",
        files: 4,
        comments: 2,
      },
      {
        name: "Angela Von",
        email: "angela93@gmail.com",
        initials: "AV",
        avatarColor: "bg-blue-100 text-blue-600",
        source: "LinkedIn",
        files: 4,
        comments: 2,
      },
    ],
  },
  {
    title: "HIRED",
    color: "bg-green-500",
    count: 0,
    candidates: [
      {
        name: "Loretta Becker",
        email: "lor-lue@gmail.com",
        initials: "LB",
        avatarColor: "bg-gray-200 text-gray-600",
        source: "LinkedIn",
        files: 0,
        comments: 0,
      },
    ],
  },
];

function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3.5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-3">
        <Avatar initials={candidate.initials} color={candidate.avatarColor} size="md" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{candidate.name}</p>
          <p className="text-[11px] text-gray-400 truncate">{candidate.email}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
          </svg>
          <span>{candidate.source}</span>
        </div>
        {(candidate.files > 0 || candidate.comments > 0) && (
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            {candidate.files > 0 && (
              <div className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                <span>{candidate.files}</span>
              </div>
            )}
            {candidate.comments > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{candidate.comments}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CandidatesTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">Candidates</h2>
        <div className="relative w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-4 gap-4">
        {candidateColumns.map((col) => (
          <div key={col.title} className="min-w-0">
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3">
              <div className={`h-8 rounded-lg flex-1 flex items-center px-3 ${col.color} bg-opacity-10`}>
                <span className="text-xs font-bold tracking-wider text-gray-700">{col.title}</span>
              </div>
              {col.count > 0 && (
                <span className="w-6 h-6 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {col.count}
                </span>
              )}
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {col.candidates.map((c) => (
                <CandidateCard key={c.name} candidate={c} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab Navigation ──────────────────────────────────────────────────────
function TabNav({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const tabs = [
    { id: "description", label: "Job Description", icon: PenIcon },
    { id: "candidates", label: "Candidates", icon: CandidatesIcon },
  ];
  return (
    <div className="flex border-b border-gray-200 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === tab.id
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function PenIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function CandidatesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// ─── Recruitment Page ────────────────────────────────────────────────────
export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState("description");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  return (
    <div className="flex min-h-screen bg-gray-50/80">
      <Sidebar active="Recruitment" />

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-[1100px]">
          <TopBar />

          {!selectedJob ? (
            <JobListView onSelectJob={(job) => setSelectedJob(job)} />
          ) : (
            <>
              {/* Back to Job List */}
              <button
                onClick={() => {
                  setSelectedJob(null);
                  setActiveTab("description");
                }}
                className="flex items-center gap-1.5 text-sm text-gray-500 mb-3 hover:text-gray-700"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Job List
              </button>

              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-5">
                {selectedJob.title}
              </h1>

              {/* Tabs */}
              <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />

              {activeTab === "description" && (
                <JobDescriptionTab job={selectedJob} />
              )}
              {activeTab === "candidates" && <CandidatesTab />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
