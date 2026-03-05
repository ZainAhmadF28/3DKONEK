import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase URL or Service Role Key is missing. File uploads might fail.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

/**
 * Uploads a file buffer to Supabase Storage.
 * 
 * @param fileBuffer The file content buffer
 * @param bucketName The name of the bucket (e.g., 'uploads')
 * @param folderPath The folder path inside the bucket (e.g., 'gallery')
 * @param filename The name of the file
 * @param contentType The MIME type of the file
 * @returns The public URL of the uploaded file
 */
export async function uploadToSupabase(
    fileBuffer: Buffer,
    bucketName: string,
    folderPath: string,
    filename: string,
    contentType?: string
): Promise<string> {
    const filePath = `${folderPath}/${filename}`.replace(/\/+/g, '/'); // Clean up double slashes

    const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileBuffer, {
            contentType: contentType,
            upsert: true,
        });

    if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Failed to upload to Supabase: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
}
