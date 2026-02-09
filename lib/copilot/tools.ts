import { PrismaClient } from '@prisma/client';
import getPrisma from '@/lib/prisma';

const prisma = getPrisma();

// 1. Tool Definitions for Mistral
export const tools = [
    {
        type: "function",
        function: {
            name: "search_employees",
            description: "Search for employees by name, role, or department. Returns basic profile info.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "Name, job title, or department to search for (e.g., 'John', 'Engineer', 'Alice in HR')",
                    },
                },
                required: ["query"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_employee_details",
            description: "Get detailed information about a specific employee including payroll, performance, and projects.",
            parameters: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        description: "The name of the employee to look up.",
                    },
                },
                required: ["name"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_leave_stats",
            description: "Get statistics about leave requests (pending, approved, who is on leave).",
            parameters: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        description: "Filter by status: 'Pending', 'Approved', 'Rejected', or 'All'. Default 'All'."
                    }
                },
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_company_overview",
            description: "Get a high-level overview of the company: employee count, departments, recent announcements, and pending actions.",
            parameters: {
                type: "object",
                properties: {},
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_all_employees",
            description: "List all employees in the company.",
            parameters: {
                type: "object",
                properties: {},
            }
        }
    },
    {
        type: "function",
        function: {
            name: "send_message",
            description: "Send a direct message to an employee.",
            parameters: {
                type: "object",
                properties: {
                    recipient: { type: "string", description: "Name of the employee to message (e.g., 'Alice Smith')" },
                    message: { type: "string", description: "The message content" }
                },
                required: ["recipient", "message"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "create_announcement",
            description: "Create a new company-wide announcement.",
            parameters: {
                type: "object",
                properties: {
                    title: { type: "string", description: "Title of the announcement" },
                    content: { type: "string", description: "Body/Content of the announcement" },
                    priority: { type: "string", description: "Priority: 'Normal', 'High', 'Critical'" }
                },
                required: ["title", "content"]
            }
        }
    }
];

// 2. Tool Execution Logic
export const executeTool = async (name: string, args: any) => {
    try {
        switch (name) {
            case 'search_employees':
                return await searchEmployees(args.query);
            case 'get_employee_details':
                return await getEmployeeDetails(args.name);
            case 'get_leave_stats':
                return await getLeaveStats(args.status);
            case 'get_company_overview':
                return await getCompanyOverview();
            case 'get_all_employees':
                return await getAllEmployees();
            case 'send_message':
                return await sendMessage(args.recipient, args.message);
            case 'create_announcement':
                return await createAnnouncement(args);
            default:
                return { error: `Tool ${name} not found.` };
        }
    } catch (error) {
        console.error(`Error executing tool ${name}:`, error);
        return { error: `Failed to execute ${name}.` };
    }
};

// 3. Helper Functions (The actual logic)

// --- Shared Search Logic ---
async function findEmployee(query: string) {
    const nameParts = query.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

    const orConditions: any[] = [
        { first_name: { contains: query, mode: 'insensitive' } },
        { last_name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } } // Added email search
    ];

    if (lastName) {
        // "First Last" match
        orConditions.push({
            AND: [
                { first_name: { contains: firstName, mode: 'insensitive' } },
                { last_name: { contains: lastName, mode: 'insensitive' } }
            ]
        });
        // "Last First" match (Reversed)
        orConditions.push({
            AND: [
                { first_name: { contains: lastName, mode: 'insensitive' } },
                { last_name: { contains: firstName, mode: 'insensitive' } }
            ]
        });
    }

    // Fallback: If query is single word, match start of first name roughly
    if (!lastName) {
        orConditions.push({ first_name: { startsWith: firstName, mode: 'insensitive' } });
    }

    return await prisma.employee.findFirst({
        where: { OR: orConditions },
        include: {
            department: true,
            payroll: { take: 1, orderBy: { effective_date: 'desc' as any } }, // Cast for strict type
            performance_reviews: { take: 1, orderBy: { review_date: 'desc' } },
            projects: { include: { project: true } }
        }
    }) as any;
}
// ---------------------------

async function getAllEmployees() {
    const employees = await prisma.employee.findMany({
        select: {
            first_name: true,
            last_name: true,
            job_title: true,
            department: { select: { name: true } }
        },
        orderBy: { first_name: 'asc' }
    });

    return JSON.stringify(employees.map(e => ({
        name: `${e.first_name} ${e.last_name}`,
        role: e.job_title,
        department: e.department?.name || 'N/A'
    })));
}

async function sendMessage(recipientName: string, content: string) {
    // 1. Find the recipient using robust helper
    const recipient = await findEmployee(recipientName);

    if (!recipient) {
        // Double check partials?
        return `Error: Could not find an employee named "${recipientName}". Please check the spelling or try their email.`;
    }

    // 2. Find a sender (fallback to Admin/First User for now)
    // In a real app, this comes from the authenticated session
    const sender = await prisma.employee.findFirst();

    if (!sender) return "Error: No active user found to send the message.";

    // 3. Create Message
    const msg = await prisma.message.create({
        data: {
            content: content,
            sender_id: sender.id,
            receiver_id: recipient.id,
            created_at: new Date()
        }
    });

    return `Message sent to ${recipient.first_name} ${recipient.last_name}: "${content}"`;
}

async function searchEmployees(query: string) {
    // Determine if we want a single best match or list. 
    // Original tool was findMany. Let's keep findsMany but use the OR conditions.
    const nameParts = query.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

    const orConditions: any[] = [
        { first_name: { contains: query, mode: 'insensitive' } },
        { last_name: { contains: query, mode: 'insensitive' } },
        { job_title: { contains: query, mode: 'insensitive' } },
        { department: { name: { contains: query, mode: 'insensitive' } } }
    ];

    if (lastName) {
        orConditions.push({
            AND: [
                { first_name: { contains: firstName, mode: 'insensitive' } },
                { last_name: { contains: lastName, mode: 'insensitive' } }
            ]
        });
    }

    const employees = await prisma.employee.findMany({
        where: { OR: orConditions },
        select: {
            id: true,
            first_name: true,
            last_name: true,
            job_title: true,
            department: { select: { name: true } },
            email: true
        },
        take: 5,
    });

    if (employees.length === 0) return "No employees found matching that query.";
    return JSON.stringify(employees);
}

async function getEmployeeDetails(name: string) {
    const employee = await findEmployee(name);

    if (!employee) return `Could not find employee named ${name}.`;

    // Formatting for LLM consumption
    const salary = employee.payroll?.[0]?.salary ? `$${employee.payroll[0].salary}` : 'N/A';
    const rating = employee.performance_reviews?.[0]?.rating || 'N/A';
    const projects = employee.projects?.map((p: any) => p.project?.name).join(', ') || 'None';

    return JSON.stringify({
        name: `${employee.first_name} ${employee.last_name}`,
        role: employee.job_title,
        department: employee.department?.name,
        salary: salary,
        latest_performance_rating: rating,
        active_projects: projects,
        email: employee.email
    });
}

async function getLeaveStats(status: string = 'All') {
    const whereClause: any = status !== 'All' ? { status: { equals: status, mode: 'insensitive' } } : {};

    const count = await prisma.leaveRequest.count({ where: whereClause });
    const requests = await prisma.leaveRequest.findMany({
        where: whereClause,
        take: 5,
        orderBy: { created_at: 'desc' },
        include: { employee: { select: { first_name: true, last_name: true } } }
    }) as any[];

    return JSON.stringify({
        total_count: count,
        recent_requests: requests.map((r: any) => ({
            employee: `${r.employee.first_name} ${r.employee.last_name}`,
            type: r.type,
            status: r.status,
            dates: `${new Date(r.start_date).toLocaleDateString()} - ${new Date(r.end_date).toLocaleDateString()}`
        }))
    });
}

async function getCompanyOverview() {
    const [empCount, deptCount, latestAnnouncements] = await Promise.all([
        prisma.employee.count(),
        prisma.department.count(),
        prisma.announcement.findMany({ take: 3, orderBy: { created_at: 'desc' } } as any) // Cast any
    ]);

    return JSON.stringify({
        total_employees: empCount,
        total_departments: deptCount,
        latest_news: latestAnnouncements.map((a: any) => ({ title: a.title, priority: a.priority })),
        summary: "This data is fetched in real-time from the database."
    });
}

async function createAnnouncement(args: any) {
    // In a real app, we'd get the author ID from the session context passed to this function.
    // For now, we'll find a fallback admin.
    const admin = await prisma.employee.findFirst();

    if (!admin) return "Error: No user found to attribute announcement to.";

    const announcement = await prisma.announcement.create({
        data: {
            title: args.title,
            content: args.content,
            type: 'Company',
            priority: args.priority || 'Normal',
            author_id: admin.id
        }
    } as any);

    return `Announcement created successfully: "${announcement.title}" (ID: ${announcement.id})`;
}
