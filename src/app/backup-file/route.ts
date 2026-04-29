import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const filePath = path.join(process.cwd(), 'src/app/backup-file', 'TRADEVAULT-BACKUP.zip')
  const fileBuffer = fs.readFileSync(filePath)
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="TRADEVAULT-BACKUP.zip"',
      'Content-Length': fileBuffer.length.toString(),
    },
  })
}
