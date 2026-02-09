const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const employees = await prisma.employee.findMany();
    console.log("--- Employee Dump ---");
    employees.forEach(e => {
        console.log(`ID: ${e.id} | First: "${e.first_name}" | Last: "${e.last_name}" | Email: ${e.email}`);
    });
    console.log("---------------------");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
