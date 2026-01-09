import { NextRequest, NextResponse } from 'next/server'
import { profileService } from '@/lib/services'

export async function POST(request: NextRequest) {
  try {
    const { theme } = await request.json()

    if (!theme || !['light', 'dark'].includes(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme value' },
        { status: 400 }
      )
    }

    // Update profile with new theme
    const result = await profileService.updateProfile({
      theme_mode: theme,
    })

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, theme })
  } catch (error) {
    console.error('Error updating theme:', error)
    return NextResponse.json(
      { error: 'Failed to update theme' },
      { status: 500 }
    )
  }
}
