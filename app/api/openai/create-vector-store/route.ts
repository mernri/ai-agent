// app/api/openai/create-vector-store/route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getOpenaiClient } from '@/lib/openai'

export async function POST(req: NextRequest) {
    const { directoryPath } = await req.json()

    const SUPPORTED_FILE_TYPES = new Set([
        '.c', '.cs', '.cpp', '.doc', '.docx', '.html', '.java', '.json', '.md',
        '.pdf', '.php', '.pptx', '.py', '.rb', '.tex', '.txt', '.css', '.js',
        '.sh', '.ts'
    ]);

    function isFileSupported(filePath: string): boolean {
        const extension = path.extname(filePath).toLowerCase();
        const isSupported = SUPPORTED_FILE_TYPES.has(extension);
        console.log(`Checking file: ${filePath}, Extension: ${extension}, Supported: ${isSupported}`);
        return isSupported;
    }

    function getAllSupportedFiles(dir: string): string[] {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        const files = entries.flatMap((entry) => {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                return getAllSupportedFiles(fullPath);
            } else if (isFileSupported(fullPath)) {
                console.log(`Adding supported file: ${fullPath}`);
                return [fullPath];
            } else {
                console.log(`Skipping unsupported file: ${fullPath}`);
            }
            return [];
        });
        return files;
    }

    if (!directoryPath) {
        return NextResponse.json({ message: 'Directory path is required' }, { status: 400 });
    }

    const resolvedDirectoryPath = path.resolve(process.cwd(), directoryPath);

    const client = getOpenaiClient();

    try {
        if (!fs.existsSync(resolvedDirectoryPath)) {
            return NextResponse.json({ message: `The specified path does not exist or is not accessible: ${resolvedDirectoryPath}` }, { status: 404 })
        }

        const supportedFiles = getAllSupportedFiles(resolvedDirectoryPath)
        console.log("\n [ENDPOINT] supportedFiles: ", supportedFiles)

        if (supportedFiles.length === 0) {
            return NextResponse.json({ message: 'No supported files found in the specified directory' }, { status: 404 })
        }

        const vectorStore = await client.beta.vectorStores.create({
            name: `Vector Store - ${path.basename(directoryPath)}`,
        })

        console.log("\n [ENDPOINT] vectorStore: ", vectorStore)

        const files = supportedFiles.map((filePath) => {
            const content = fs.readFileSync(filePath)
            return new File([content], path.basename(filePath), { type: 'application/octet-stream' })
        })

        console.log("\n [ENDPOINT] files: ", files)

        await client.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
            files: files
        })

        const uploadedFiles = supportedFiles.map(filePath => path.basename(filePath))
        console.log("\n [ENDPOINT] uploadedFiles: ", uploadedFiles)

        return NextResponse.json({
            success: true,
            vectorStoreId: vectorStore.id,
            uploadedFilesCount: supportedFiles.length,
            uploadedFiles: uploadedFiles
        })
    } catch (error) {
        console.error('Error creating vector store:', error)
        return NextResponse.json({ message: 'Error creating vector store', error }, { status: 500 })
    }
}