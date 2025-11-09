import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

// Force dynamic rendering - uses database and authentication
export const dynamic = 'force-dynamic';

const createStudentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  gradeLevel: z.number().min(0).max(12, 'Grade level must be between 0 and 12'),
  parentId: z.string().uuid().optional(),
  birthDate: z.string().optional(),
});

export async function GET(request) {
  try {
    // Verify authentication
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get students for the authenticated user
    // If admin, return all students (or implement pagination)
    // If parent, return their children
    // If student, return their own profile
    
    let students = [];
    
    if (user.role === 'ADMIN' || user.is_admin) {
      // Admin can see all students
      try {
        // Check if Student model exists by checking Prisma client
        if (!prisma.student) {
          return NextResponse.json({ students: [] });
        }
        students = await prisma.student.findMany({
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
          take: 100, // Limit for now
        });
      } catch (error) {
        // Student model might not exist or database error
        console.warn('Error fetching students:', error.message);
        // Return empty array instead of error to prevent page crash
        return NextResponse.json({ students: [] });
      }
    } else if (user.role === 'PARENT') {
      // Parent sees their children
      try {
        if (!prisma.student) {
          return NextResponse.json({ students: [] });
        }
        students = await prisma.student.findMany({
          where: {
            parentId: user.id,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        });
      } catch (error) {
        console.warn('Error fetching students:', error.message);
        return NextResponse.json({ students: [] });
      }
    } else if (user.role === 'STUDENT') {
      // Student sees their own profile
      try {
        if (!prisma.student) {
          return NextResponse.json({ students: [] });
        }
        const student = await prisma.student.findFirst({
          where: {
            userId: user.id,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        });
        students = student ? [student] : [];
      } catch (error) {
        console.warn('Error fetching student:', error.message);
        return NextResponse.json({ students: [] });
      }
    }

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Verify authentication
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createStudentSchema.parse(body);

    // Check if Student model exists
    try {
      // Check if Student model is available
      if (!prisma.student) {
        return NextResponse.json(
          { 
            error: 'Student profiles are not available. Please contact support.',
            details: 'The Student model is not configured in the database.'
          },
          { status: 503 }
        );
      }

      // Check if user already has a student profile
      const existingStudent = await prisma.student.findFirst({
        where: {
          userId: user.id,
        },
      });

      if (existingStudent) {
        return NextResponse.json(
          { error: 'Student profile already exists for this user' },
          { status: 400 }
        );
      }

      // Create student profile
      // If user is a STUDENT, link to their own userId
      // If user is a PARENT, create a new student linked to parentId
      const studentData = {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName || '',
        gradeLevel: validatedData.gradeLevel,
        birthDate: validatedData.birthDate 
          ? new Date(validatedData.birthDate) 
          : null,
      };

      if (user.role === 'STUDENT') {
        // Student creating their own profile
        studentData.userId = user.id;
      } else if (user.role === 'PARENT' && validatedData.parentId) {
        // Parent creating a child profile
        studentData.parentId = validatedData.parentId;
        // Need to create a User account for the child first
        // For now, we'll link to the parent's userId
        // In a full implementation, you'd create a separate User account
        studentData.userId = user.id; // Temporary: link to parent's account
      } else {
        // Default: link to current user
        studentData.userId = user.id;
        if (validatedData.parentId) {
          studentData.parentId = validatedData.parentId;
        }
      }

      const student = await prisma.student.create({
        data: studentData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        student,
      });
    } catch (prismaError) {
      // Check if it's a model not found error
      if (prismaError.code === 'P2001' || prismaError.message?.includes('model') || prismaError.message?.includes('Student')) {
        console.warn('Student model not found in database');
        return NextResponse.json(
          { 
            error: 'Student profiles are not available. Please contact support.',
            details: 'The Student model is not configured in the database.'
          },
          { status: 503 }
        );
      }
      // Check if it's a unique constraint violation
      if (prismaError.code === 'P2002') {
        return NextResponse.json(
          { error: 'Student profile already exists for this user' },
          { status: 400 }
        );
      }
      throw prismaError;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student profile' },
      { status: 500 }
    );
  }
}
