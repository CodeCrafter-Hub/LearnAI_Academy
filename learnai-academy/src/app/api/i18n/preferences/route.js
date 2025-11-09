import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { supportedLanguages } from '@/lib/i18n/config.js';

/**
 * GET /api/i18n/preferences
 * Get user language preferences
 */
export async function GET(request) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user preferences
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { preferences: true },
    });

    const preferences = userData?.preferences || {};
    const language = preferences.language || 'en';

    return NextResponse.json({
      success: true,
      language,
      supportedLanguages: supportedLanguages.map(l => ({
        code: l.code,
        name: l.name,
        nativeName: l.nativeName,
        flag: l.flag,
      })),
    });
  } catch (error) {
    console.error('Error getting language preferences:', error);
    return NextResponse.json(
      { error: 'Failed to get language preferences' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/i18n/preferences
 * Update user language preferences
 */
export async function POST(request) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { language } = body;

    if (!language) {
      return NextResponse.json(
        { error: 'language is required' },
        { status: 400 }
      );
    }

    // Validate language
    if (!supportedLanguages.find(l => l.code === language)) {
      return NextResponse.json(
        { error: 'Unsupported language' },
        { status: 400 }
      );
    }

    // Get current preferences
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { preferences: true },
    });

    const currentPreferences = userData?.preferences || {};

    // Update preferences
    await prisma.user.update({
      where: { id: user.userId },
      data: {
        preferences: {
          ...currentPreferences,
          language,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Language preference updated',
      language,
    });
  } catch (error) {
    console.error('Error updating language preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update language preferences' },
      { status: 500 }
    );
  }
}

