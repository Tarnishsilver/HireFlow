const { default: getPrisma } = require('./lib/prisma');
const prisma = getPrisma();

async function main() {
    const employees = await prisma.employee.findMany();
    console.log(employees);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        // connections are managed globally in lib/prisma
    });
