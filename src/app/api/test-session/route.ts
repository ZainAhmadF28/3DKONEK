import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Test session endpoint called');
    console.log('Session data:', session);
    
    return NextResponse.json({
      success: true,
      hasSession: !!session,
      userId: session?.user?.id || null,
      userEmail: session?.user?.email || null,
      userRole: session?.user?.role || null
    });
  } catch (error) {
    console.error('Session test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
