import { NextResponse } from "next/server";

const INSTAGRAM_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID;

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  if (!INSTAGRAM_TOKEN || !INSTAGRAM_USER_ID) {
    return NextResponse.json({ posts: [], error: "Instagram not configured" }, { status: 200 });
  }

  try {
    const url = `https://graph.instagram.com/${INSTAGRAM_USER_ID}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=12&access_token=${INSTAGRAM_TOKEN}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      console.error("Instagram API error:", res.status, await res.text());
      return NextResponse.json({ posts: [], error: "Instagram API error" }, { status: 200 });
    }

    const data = await res.json();

    const posts = (data.data || [])
      .filter((post: { media_type: string }) => post.media_type === "VIDEO" || post.media_type === "CAROUSEL_ALBUM" || post.media_type === "IMAGE")
      .slice(0, 8)
      .map((post: { id: string; media_type: string; media_url: string; thumbnail_url?: string; permalink: string; caption?: string }) => ({
        id: post.id,
        mediaType: post.media_type,
        mediaUrl: post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url,
        permalink: post.permalink,
        caption: post.caption?.slice(0, 100) || "",
      }));

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("Instagram fetch error:", err);
    return NextResponse.json({ posts: [], error: "Failed to fetch" }, { status: 200 });
  }
}
