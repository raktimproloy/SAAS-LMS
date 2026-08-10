import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("url");

  if (!fileUrl) {
    return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 });
  }

  try {
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch file from source" }, { status: response.status });
    }

    const filename = fileUrl.split("/").pop() || "download";
    
    // Create custom headers to force the browser to download the file
    const headers = new Headers();
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    const contentType = response.headers.get("content-type");
    if (contentType) {
      headers.set("Content-Type", contentType);
    } else {
      headers.set("Content-Type", "application/octet-stream");
    }

    // Pipe the response body stream directly to the client
    return new Response(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Download proxy error:", error);
    return NextResponse.json({ error: "Failed to proxy download file" }, { status: 500 });
  }
}
