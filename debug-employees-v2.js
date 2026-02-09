const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const employees = await prisma.employee.findMany();
    console.log("--- Employee List ---");
    employees.forEach(e => {
        console.log(`"${e.first_name}" "${e.last_name}"`);
    });
    console.log("---------------------");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
