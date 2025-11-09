const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * Create comprehensive test accounts for all grades
 * This script creates test accounts that can access all grade levels
 */
async function main() {
  console.log('🧪 Creating test accounts for all grades...');

  // Test password (meets all requirements: 12+ chars, uppercase, lowercase, number, special)
  const testPassword = 'TestAccount123!';
  const passwordHash = await bcrypt.hash(testPassword, 10);

  try {
    // 1. Create ADMIN/TEACHER account with access to all grades
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: {},
      create: {
        email: 'admin@test.com',
        password_hash: passwordHash,
        role: 'ADMIN',
        is_admin: true,
      },
    });

    console.log('✅ Created admin account:', adminUser.email);

    // 2. Create PARENT account that can manage students in all grades
    const parentUser = await prisma.user.upsert({
      where: { email: 'parent@test.com' },
      update: {},
      create: {
        email: 'parent@test.com',
        password_hash: passwordHash,
        role: 'PARENT',
      },
    });

    console.log('✅ Created parent account:', parentUser.email);

    // 3. Create student accounts for each grade level (K-12)
    const grades = [
      { level: 0, name: 'Kindergarten' },
      { level: 1, name: '1st Grade' },
      { level: 2, name: '2nd Grade' },
      { level: 3, name: '3rd Grade' },
      { level: 4, name: '4th Grade' },
      { level: 5, name: '5th Grade' },
      { level: 6, name: '6th Grade' },
      { level: 7, name: '7th Grade' },
      { level: 8, name: '8th Grade' },
      { level: 9, name: '9th Grade' },
      { level: 10, name: '10th Grade' },
      { level: 11, name: '11th Grade' },
      { level: 12, name: '12th Grade' },
    ];

    const studentAccounts = [];

    for (const grade of grades) {
      // Create user for each grade
      const studentUser = await prisma.user.upsert({
        where: { email: `grade${grade.level}@test.com` },
        update: {},
        create: {
          email: `grade${grade.level}@test.com`,
          password_hash: passwordHash,
          role: 'STUDENT',
        },
      });

      // Create student profile (if Student model exists)
      try {
        const student = await prisma.student.upsert({
          where: { 
            userId: studentUser.id 
          },
          update: {
            gradeLevel: grade.level,
            firstName: `Grade${grade.level}`,
            lastName: 'TestStudent',
            parentId: parentUser.id, // Link to parent account
          },
          create: {
            userId: studentUser.id,
            firstName: `Grade${grade.level}`,
            lastName: 'TestStudent',
            gradeLevel: grade.level,
            parentId: parentUser.id,
            birthDate: new Date(2010 - grade.level, 0, 1), // Approximate birth date
          },
        });

        studentAccounts.push({
          email: studentUser.email,
          grade: grade.name,
          studentId: student.id,
        });
      } catch (error) {
        // Student model doesn't exist - just create User account
        console.log(`⚠️  Student model not found, created User account only: ${studentUser.email}`);
        studentAccounts.push({
          email: studentUser.email,
          grade: grade.name,
          studentId: null,
        });
      }

      console.log(`✅ Created ${grade.name} account: ${studentUser.email}`);
    }

    // 4. Create a comprehensive test account (all-in-one)
    const testUser = await prisma.user.upsert({
      where: { email: 'test@learnai.com' },
      update: {},
      create: {
        email: 'test@learnai.com',
        password_hash: passwordHash,
        role: 'STUDENT',
      },
    });

    // Create student profile (if Student model exists)
    try {
      const testStudent = await prisma.student.upsert({
        where: { userId: testUser.id },
        update: {},
        create: {
          userId: testUser.id,
          firstName: 'Test',
          lastName: 'Student',
          gradeLevel: 5, // Default to 5th grade
          parentId: parentUser.id,
        },
      });
      console.log('✅ Created student profile for test account');
    } catch (error) {
      // Student model doesn't exist - just User account
      console.log('⚠️  Student model not found, created User account only');
    }

    console.log('✅ Created comprehensive test account:', testUser.email);

    // Summary
    console.log('\n📋 Test Accounts Created:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔑 Login Credentials (All accounts use same password):');
    console.log(`   Password: ${testPassword}`);
    console.log('\n📧 Account List:');
    console.log(`   1. Admin Account:     admin@test.com`);
    console.log(`   2. Parent Account:    parent@test.com`);
    console.log(`   3. Test Account:      test@learnai.com (Grade 5)`);
    console.log('\n📚 Grade-Specific Accounts:');
    studentAccounts.forEach((account, index) => {
      console.log(`   ${index + 4}. ${account.grade.padEnd(15)} ${account.email}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ All test accounts created successfully!');
    console.log('\n💡 Tips:');
    console.log('   - Use admin@test.com for admin access');
    console.log('   - Use parent@test.com to see parent dashboard');
    console.log('   - Use grade0@test.com through grade12@test.com for specific grades');
    console.log('   - Use test@learnai.com for general testing');
    console.log('\n');

  } catch (error) {
    console.error('❌ Error creating test accounts:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

