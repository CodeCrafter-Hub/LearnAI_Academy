import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Subjects + Topics
  const math = await prisma.subject.upsert({
    where: { name: "Math" },
    update: {},
    create: {
      name: "Math",
      topics: { create: [{ name: "Algebra" }, { name: "Geometry" }, { name: "Arithmetic" }] }
    }
  });
  const english = await prisma.subject.upsert({
    where: { name: "English" },
    update: {},
    create: { name: "English", topics: { create: [{ name: "Grammar" }, { name: "Reading" }] } }
  });

  // Demo user & student
  const user = await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      email: "student@example.com",
      password: "$2a$10$kH4zqHUXeF3s5n.5c9i5puc3f1oK1D6KfXU7EoQw0qQ9HfGg8YHcS", // bcrypt('password')
      role: "STUDENT",
      student: { create: { name: "Demo Student", grade: "5" } }
    }
  });

  // Enroll the student
  await prisma.subjectEnrollment.createMany({
    data: [
      { studentId: user.student.id, subjectId: math.id },
      { studentId: user.student.id, subjectId: english.id },
    ],
    skipDuplicates: true
  });

  console.log("Seed complete.");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
