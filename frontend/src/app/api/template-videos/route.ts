import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { INITIAL_TEMPLATE_PRODUCTS, TemplateVideo, DEFAULT_TUTORIAL_VIDEO } from "@/data/templateProducts";

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "templateVideos.json");

function getVideosFromDisk(): Record<number, TemplateVideo> {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const content = fs.readFileSync(DATA_FILE_PATH, "utf8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error reading template videos file:", error);
  }

  // Fallback to initial seeds
  const initialMap: Record<number, TemplateVideo> = {};
  INITIAL_TEMPLATE_PRODUCTS.forEach((p) => {
    if (p.video) {
      initialMap[p.id] = p.video;
    } else {
      // Default sample video for any template that hasn't set one yet
      initialMap[p.id] = {
        id: p.id,
        templateId: p.id,
        headerTitle: `${DEFAULT_TUTORIAL_VIDEO.headerTitle} - ${p.title}`,
        videoUrl: DEFAULT_TUTORIAL_VIDEO.videoUrl,
        captionTitle: DEFAULT_TUTORIAL_VIDEO.captionTitle,
        captionDesc: DEFAULT_TUTORIAL_VIDEO.captionDesc,
        detailUrl: DEFAULT_TUTORIAL_VIDEO.detailUrl,
      };
    }
  });

  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(initialMap, null, 2), "utf8");
  } catch (e) {
    // Ignore write error in read-only environments
  }

  return initialMap;
}

function saveVideosToDisk(data: Record<number, TemplateVideo>) {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing template videos file:", error);
  }
}

// GET /api/template-videos - Returns all videos
export async function GET() {
  const videos = getVideosFromDisk();
  return NextResponse.json(videos);
}

// POST /api/template-videos - Add or update a video for a template
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { templateId, headerTitle, videoUrl, captionTitle, captionDesc, detailUrl } = body;

    if (!templateId || !videoUrl) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp templateId và videoUrl hợp lệ." },
        { status: 400 }
      );
    }

    const videos = getVideosFromDisk();
    const id = Number(templateId);

    videos[id] = {
      id,
      templateId: id,
      headerTitle: headerTitle || DEFAULT_TUTORIAL_VIDEO.headerTitle,
      videoUrl,
      captionTitle: captionTitle || DEFAULT_TUTORIAL_VIDEO.captionTitle,
      captionDesc: captionDesc || DEFAULT_TUTORIAL_VIDEO.captionDesc,
      detailUrl: detailUrl || DEFAULT_TUTORIAL_VIDEO.detailUrl,
    };

    saveVideosToDisk(videos);
    return NextResponse.json({ success: true, video: videos[id] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Lỗi xử lý yêu cầu." }, { status: 500 });
  }
}

// DELETE /api/template-videos?templateId=1 - Delete video for a template
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const templateIdStr = searchParams.get("templateId");

    if (!templateIdStr) {
      return NextResponse.json({ error: "Thiếu tham số templateId." }, { status: 400 });
    }

    const templateId = Number(templateIdStr);
    const videos = getVideosFromDisk();

    if (videos[templateId]) {
      delete videos[templateId];
      saveVideosToDisk(videos);
      return NextResponse.json({ success: true, message: `Đã xóa video của mẫu #${templateId}` });
    }

    return NextResponse.json({ success: false, message: "Không tìm thấy video." }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Lỗi xử lý yêu cầu." }, { status: 500 });
  }
}
