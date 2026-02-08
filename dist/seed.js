"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Start seeding...');
    // 1. Create Departments
    const engineering = await prisma.department.upsert({
        where: { name: 'Engineering' },
        update: {},
        create: { name: 'Engineering', color: 'bg-blue-100 text-blue-800' },
    });
    const design = await prisma.department.upsert({
        where: { name: 'Design' },
        update: {},
        create: { name: 'Design', color: 'bg-pink-100 text-pink-800' },
    });
    const product = await prisma.department.upsert({
        where: { name: 'Product' },
        update: {},
        create: { name: 'Product', color: 'bg-purple-100 text-purple-800' },
    });
    const hr = await prisma.department.upsert({
        where: { name: 'Human Resources' },
        update: {},
        create: { name: 'Human Resources', color: 'bg-orange-100 text-orange-800' },
    });
    console.log('Created departments.');
    // 2. Create Employees (Indian Names)
    const employeesData = [
        {
            first_name: 'Aarav',
            last_name: 'Sharma',
            email: 'aarav.sharma@company.com',
            job_title: 'Senior Frontend Developer',
            contract_type: 'Full-time',
            department_id: engineering.id,
            avatar_color: 'bg-blue-500',
        },
        {
            first_name: 'Diya',
            last_name: 'Patel',
            email: 'diya.patel@company.com',
            job_title: 'UI/UX Designer',
            contract_type: 'Full-time',
            department_id: design.id,
            avatar_color: 'bg-pink-500',
        },
        {
            first_name: 'Vihaan',
            last_name: 'Singh',
            email: 'vihaan.singh@company.com',
            job_title: 'Product Manager',
            contract_type: 'Full-time',
            department_id: product.id,
            avatar_color: 'bg-purple-500',
        },
        {
            first_name: 'Aditi',
            last_name: 'Gupta',
            email: 'aditi.gupta@company.com',
            job_title: 'HR Manager',
            contract_type: 'Full-time',
            department_id: hr.id,
            avatar_color: 'bg-orange-500',
        },
        {
            first_name: 'Rohan',
            last_name: 'Verma',
            email: 'rohan.verma@company.com',
            job_title: 'Backend Developer',
            contract_type: 'Full-time',
            department_id: engineering.id,
            avatar_color: 'bg-indigo-500',
        },
        {
            first_name: 'Kavya',
            last_name: 'Iyer',
            email: 'kavya.iyer@company.com',
            job_title: 'Visual Designer',
            contract_type: 'Contract',
            department_id: design.id,
            avatar_color: 'bg-rose-500',
        },
    ];
    for (const emp of employeesData) {
        await prisma.employee.upsert({
            where: { email: emp.email },
            update: {},
            create: emp,
        });
    }
    console.log('Created employees.');
    // Fetch mapped employees to link managers and create logs
    const allEmployees = await prisma.employee.findMany();
    const aarav = allEmployees.find(e => e.email === 'aarav.sharma@company.com');
    const rohan = allEmployees.find(e => e.email === 'rohan.verma@company.com'); // Reports to Aarav
    if (aarav && rohan) {
        await prisma.employee.update({
            where: { id: rohan.id },
            data: { manager_id: aarav.id }
        });
    }
    // 3. Create Leave Requests
    if (rohan) {
        const count = await prisma.leaveRequest.count({ where: { employee_id: rohan.id } });
        if (count === 0) {
            await prisma.leaveRequest.create({
                data: {
                    type: 'Sick',
                    status: 'Pending',
                    start_date: new Date('2026-02-10'),
                    end_date: new Date('2026-02-12'),
                    reason: 'Viral fever',
                    employee_id: rohan.id
                }
            });
        }
    }
    // 4. Create Work Logs (Mock data for the chart)
    const today = new Date();
    // Create logs for the last 7 days for a few employees
    if (aarav) {
        const existingLogs = await prisma.workLog.count({ where: { employee_id: aarav.id } });
        if (existingLogs === 0) {
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                // Random hours between 6 and 10
                const hours = 6 + Math.random() * 4;
                await prisma.workLog.create({
                    data: {
                        date: date,
                        hours_worked: parseFloat(hours.toFixed(1)),
                        status: 'On Time',
                        employee_id: aarav.id
                    }
                });
            }
        }
    }
    // 5. Create Company Payment Method
    const existingPayment = await prisma.companyPaymentMethod.findFirst({ where: { is_default: true } });
    if (!existingPayment) {
        await prisma.companyPaymentMethod.create({
            data: {
                card_holder: 'TechCorp India Pvt Ltd',
                account_number: '**** **** **** 8899',
                expiration: '12/28',
                card_type: 'Visa',
                method_type: 'Credit Card',
                is_default: true
            }
        });
    }
    console.log('Seeding finished.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
