import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const secret = req.headers.get('x-revalidate-secret');

    if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const paths = Array.isArray(body?.paths) && body.paths.length > 0
        ? body.paths
        : ['/', '/catalog'];

    for (const path of paths) {
        if (typeof path === 'string' && path.startsWith('/')) {
            revalidatePath(path);
        }
    }

    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, revalidated: paths });
}
