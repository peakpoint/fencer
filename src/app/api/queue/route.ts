import { NextResponse } from "next/server";

export async function POST(request: Request) {
    // console.log(await request.)
    const res = await request.formData()
    const username = res.get('username')

    await new Promise(res => setTimeout(res, 3000))

    return NextResponse.json({ username });
    // const { searchParams } = new URL(request.url)
    // console.log(Object.fromEntries(searchParams.entries()))
}