import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type)

    // Check if token exists
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN is not set')
      return NextResponse.json(
        { error: 'Upload service not configured' },
        { status: 500 }
      )
    }

    // Upload to Vercel Blob with random suffix to avoid conflicts
    const blob = await put(file.name, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: true,
    })

    console.log('Upload successful:', blob.url)
    return NextResponse.json({ url: blob.url })
  } catch (error: any) {
    console.error('Error uploading file:', error)
    console.error('Error details:', error.message, error.stack)
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    )
  }
}
