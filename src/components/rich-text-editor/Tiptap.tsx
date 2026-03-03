import useApi from "@/hooks/use-api";
import { Dropcursor } from "@tiptap/extension-dropcursor";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";
import MenuBar from "./MenuBar";
import RichTextImageUploader from "./RichTextImageUploader";
import Table from "./Table";

interface TiptapProps {
  content: string;
  onChange: (content: string) => void;
  news_uuid?: string;
}

const Tiptap = ({ content, onChange, news_uuid }: TiptapProps) => {
  const api = useApi();
  const previousImagesRef = useRef<Set<string>>(new Set());

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-6",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal ml-6",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TableKit.configure({
        table: {
          resizable: true,
        },
      }),
      Image.configure({
        resize: {
          enabled: true,
          alwaysPreserveAspectRatio: true,
        },
      }),
      Dropcursor,
    ],
    content: content,
    editorProps: {
      attributes: {
        class:
          "p-3 rounded-md min-h-[150px] border border-gray-300 outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      onChange(newContent);

      if (news_uuid) {
        detectAndDeleteRemovedImages(newContent);
      }
    },
  });

  // Extract image URLs from HTML content
  const extractImageUrls = (html: string): Set<string> => {
    const urls = new Set<string>();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const images = doc.querySelectorAll("img");

    images.forEach((img) => {
      const src = img.getAttribute("src");
      if (src && src.includes("/news-picture/show-gallery/")) {
        urls.add(src);
      }
    });

    return urls;
  };

  // Extract filename from URL
  const extractFilename = (url: string): string | null => {
    const match = url.match(/\/news-picture\/show-gallery\/([^?#]+)/);
    return match ? match[1] : null;
  };

  // Detect and delete removed images
  const detectAndDeleteRemovedImages = (newContent: string) => {
    const currentImages = extractImageUrls(newContent);

    previousImagesRef.current.forEach((oldUrl) => {
      if (!currentImages.has(oldUrl)) {
        const filename = extractFilename(oldUrl);
        if (filename) {
          deleteImageFromServer(filename);
        }
      }
    });

    previousImagesRef.current = currentImages;
  };

  // Delete image from server
  const deleteImageFromServer = async (filename: string) => {
    try {
      await api.delete(`news-picture/gallery/${news_uuid}/${filename}`);
      console.log(`Deleted image: ${filename}`);
    } catch (error) {
      console.error(`Failed to delete image ${filename}:`, error);
    }
  };

  // Initialize previous images when content changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
      previousImagesRef.current = extractImageUrls(content);
    }
  }, [content, editor]);

  // Initialize tracked images on mount
  useEffect(() => {
    if (content) {
      previousImagesRef.current = extractImageUrls(content);
    }
  }, []);

  return (
    <>
      <MenuBar editor={editor} />
      <Table editor={editor} />
      {news_uuid && (
        <RichTextImageUploader editor={editor} news_uuid={news_uuid} />
      )}
      <EditorContent editor={editor} />
    </>
  );
};

export default Tiptap;
