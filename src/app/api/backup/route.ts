import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const filePath = path.join(process.cwd(), 'download', 'TRADEVAULT-BACKUP-20260429-182251.zip')
  
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })
  }

  const fileBuffer = fs.readFileSync(filePath)
  
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="TRADEVAULT-BACKUP.zip"',
      'Content-Length': fileBuffer.length.toString(),
    },
  })
}
