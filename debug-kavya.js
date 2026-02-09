const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const employees = await prisma.employee.findMany();
    console.log("--- Searching for Kavya ---");
    const kavya = employees.filter(e =>
        e.first_name.toLowerCase().includes('kavya') ||
        e.last_name.toLowerCase().includes('kavya')
    );

    if (kavya.length === 0) {
        console.log("NO EMPLOYEE FOUND matching 'Kavya'");
        // Dump everyone else just in case
        console.log("Total employees:", employees.length);
        employees.forEach(e => console.log(`- ${e.first_name} ${e.last_name}`));
    } else {
        kavya.forEach(e => {
            console.log(`FOUND: ID: ${e.id} | First: "${e.first_name}" | Last: "${e.last_name}"`);
        });
    }
    console.log("---------------------------");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
