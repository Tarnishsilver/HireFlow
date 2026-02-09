import getPrisma from './lib/prisma';
const prisma = getPrisma();

async function main() {
    const employees = await prisma.employee.findMany();
    console.log("Employees found:", employees.length);
    employees.forEach(e => console.log(`- ${e.first_name} ${e.last_name} (${e.job_title})`));
}

main()
    .catch(e => console.error(e));
