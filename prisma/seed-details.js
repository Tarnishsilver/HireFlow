const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Fetching employees...');
    const employees = await prisma.employee.findMany();

    if (employees.length === 0) {
        console.log('No employees found. Seed employees first.');
        return;
    }

    // projects
    const projectsData = [
        { name: 'Website Redesign', description: 'Revamping the corporate website.', status: 'Active', start_date: new Date('2025-01-15') },
        { name: 'Mobile App Launch', description: 'Launching the new iOS and Android apps.', status: 'Active', start_date: new Date('2025-02-01') },
        { name: 'Internal HR System', description: 'Upgrading the HR management tools.', status: 'On Hold', start_date: new Date('2024-11-01') },
    ];

    console.log('Seeding projects...');
    const createdProjects = [];
    for (const p of projectsData) {
        const project = await prisma.project.create({ data: p });
        createdProjects.push(project);
    }

    console.log('Seeding details for employees...');
    for (const emp of employees) {
        // Payroll
        await prisma.payroll.create({
            data: {
                salary: Math.floor(Math.random() * 5000) + 3000,
                effective_date: new Date('2025-01-01'),
                pay_frequency: 'Monthly',
                employee_id: emp.id
            }
        });

        // Performance
        await prisma.performanceReview.create({
            data: {
                rating: (Math.random() * 2) + 3, // 3.0 to 5.0
                review_date: new Date('2025-12-15'),
                reviewer: 'Manager',
                comments: 'Consistent performer with great attention to detail.',
                kpis_assigned: 5,
                kpis_achieved: Math.floor(Math.random() * 2) + 3,
                employee_id: emp.id
            }
        });

        // Assign random project
        const randomProject = createdProjects[Math.floor(Math.random() * createdProjects.length)];
        await prisma.employeeProject.create({
            data: {
                role: 'Contributor',
                employee_id: emp.id,
                project_id: randomProject.id
            }
        });
    }

    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
