import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { VisualEditor } from "./VisualEditorPage";
import { TemplateLibrary } from "@/components/TemplateLibrary";
import { TemplatePreview } from "@/components/TemplatePreview";
import { Palette, Code2 } from "lucide-react";
import { Toaster, toast } from "sonner";
import instance from "@/lib/axios";
import "../App.css";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  html: string;
  css: string;
  thumbnail: string;
}

type AppState =
  | { view: "library" }
  | { view: "editor"; template: Template }
  | { view: "preview"; template: Template };

const EditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appState, setAppState] = useState<AppState>({ view: "library" });

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        if (id) {
          const response = await instance.get(`/api/templates/${id}`);
          const templateData = response.data.data;
          setAppState({
            view: "editor",
            template: {
              id: templateData._id,
              name: templateData.name,
              description: templateData.description || "",
              category: templateData.category || "",
              html: templateData.html,
              css: templateData.css,
              thumbnail: templateData.thumbnail || "",
            },
          });
        } else {
          setAppState({ view: "library" });
        }
      } catch (error) {
        console.error("Error fetching template:", error);
        toast("Failed to load template.", {
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [id, navigate]);

  const handleEditTemplate = (template: Template) => {
    setAppState({ view: "editor", template });
    navigate(`/editor/${template.id}`);
  };

  const handlePreviewTemplate = (template: Template) => {
    setAppState({ view: "preview", template });
    navigate(`/preview/${template.id}`);
  };

  const handleSaveTemplate = async (template: Template) => {
    try {
      await instance.put(`/api/templates/${template.id}`, {
        name: template.name,
        html: template.html,
        css: template.css,
        description: template.description,
        category: template.category,
        thumbnail: template.thumbnail,
      });
      toast(`Template "${template.name}" saved successfully.`);
    } catch (error) {
      console.error("Error saving template:", error);
      toast("Failed to save template.", {
        variant: "destructive",
      });
    }
  };

  const handleBackToLibrary = () => {
    setAppState({ view: "library" });
    navigate("/");
    toast("Returned to template library.");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-white border-b-4" />
      </div>
    );
  }

  if (appState.view === "editor") {
    return (
      <>
        <Toaster position="bottom-right" theme="dark" />
        <VisualEditor
          template={appState.template}
          onBack={handleBackToLibrary}
          onSave={handleSaveTemplate}
        />
      </>
    );
  }

  if (appState.view === "preview") {
    return (
      <TemplatePreview
        template={appState.template}
        onBack={handleBackToLibrary}
        onEdit={handleEditTemplate}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Toaster position="bottom-right" theme="dark" />
      <div className="container mx-auto">
        <div className="pt-8 pb-6 px-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Web Template Editor
              </h1>
              <p className="text-white">
                Create and customize beautiful web templates
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="library" className="w-full">
          <div className="px-6 mb-6">
            <TabsList className="grid w-fit grid-cols-2 bg-[#252528]">
              <TabsTrigger
                value="library"
                className="flex items-center gap-2 text-white data-[state=active]:bg-[#161618] data-[state=active]:text-white"
              >
                <Palette className="w-4 h-4 text-white" />
                Template Library
              </TabsTrigger>
              <TabsTrigger
                value="editor"
                className="flex items-center gap-2 text-white data-[state=active]:bg-[#161618] data-[state=active]:text-white"
              >
                <Code2 className="w-4 h-4 text-white" />
                Visual Editor
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="library" className="mt-0">
            <TemplateLibrary
              onEditTemplate={handleEditTemplate}
              onPreviewTemplate={handlePreviewTemplate}
            />
          </TabsContent>

          <TabsContent value="editor" className="mt-0">
            <VisualEditor
              template={null}
              onBack={handleBackToLibrary}
              onSave={handleSaveTemplate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EditorPage;