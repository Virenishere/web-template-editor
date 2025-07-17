import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router"; // Updated import
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit3 } from "lucide-react";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import instance from "@/lib/axios";

interface Template {
  _id: string;
  name: string;
  html: string;
  css: string;
  createdAt: string;
  updatedAt: string;
}

export function TemplatePreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await instance.get(`/api/templates/${id}`);
        setTemplate(response.data.data);
        setLoading(false);
        toast("Template Loaded", {
          description: `Template "${response.data.data.name}" loaded successfully.`,
        });
      } catch (err) {
        console.error("Error fetching template:", err);
        toast("Failed to load template.", {
          description: "Template not found or server error.",
          variant: "destructive",
        });
        setLoading(false);
        navigate("/"); // Navigate to homepage on error
      }
    };
    fetchTemplate();
  }, [id, navigate]);

  const srcdoc = useMemo(() => {
    if (!template) return "";

    const sanitizedCSS = DOMPurify.sanitize(template.css, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      ALLOWED_STYLE: [
        "background-color",
        "color",
        "font-size",
        "font-weight",
        "padding",
        "margin",
        "border",
        "border-radius",
        "position",
        "left",
        "top",
        "width",
        "height",
        "z-index",
        "cursor",
      ],
    });
    const sanitizedHTML = DOMPurify.sanitize(template.html, {
      FORBID_TAGS: ["script", "iframe"],
    });

    if (!sanitizedHTML || !sanitizedCSS) {
      console.warn("TemplatePreview: Sanitized HTML or CSS is empty");
      toast("Failed to render template preview.", {
        description: "Template content is invalid after sanitization.",
        variant: "destructive",
      });
      return "";
    }

    return `
      <html>
        <head><style>${sanitizedCSS}</style></head>
        <body>${sanitizedHTML}</body>
      </html>
    `;
  }, [template]);

  if (loading) {
    return <div className="text-white">Loading template...</div>;
  }

  if (!template) {
    return <div className="text-white">Template not found.</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-[#0f0f0f]">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          className=" border-white/20 hover:bg-white/55 cursor-pointer"
          onClick={() => {
            navigate("/"); // Navigate to homepage
            toast("Back to Library", {
              description: "Returned to the template library.",
            });
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Library
        </Button>
        <Button
          className="border-white/20 hover:bg-white/55 cursor-pointer bg-white text-black"
          onClick={() => {
            navigate(`/editor/${template._id}`);
            toast(`Editing template "${template.name}".`, {
              description: "Template editor opened.",
            });
          }}
        >
          <Edit3 className="h-4 w-4 mr-2" />
          Edit Template
        </Button>
      </div>
      <div className="w-full h-[600px] border border-gray-700 rounded-lg overflow-hidden">
        <iframe
          title={`preview-${template._id}`}
          className="w-full h-full border-none"
          sandbox=""
          srcDoc={srcdoc}
        />
      </div>
    </div>
  );
}