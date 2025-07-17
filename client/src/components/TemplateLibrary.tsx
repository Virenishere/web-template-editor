import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit3, Palette, Trash2 } from "lucide-react";
import instance from "@/lib/axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Template {
  _id: string;
  name: string;
  html: string;
  css: string;
  createdAt: string;
  updatedAt: string;
}

export function TemplateLibrary() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newTemplateName, setNewTemplateName] = useState("");
  const [editTemplateId, setEditTemplateId] = useState<string | null>(null);
  const [editTemplateName, setEditTemplateName] = useState("");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const response = await instance.get("/api/templates");
        setTemplates(response.data.data);
        setError("");
        toast("Template library loaded successfully.");
      } catch (err: any) {
        setError("Failed to fetch templates.");
        console.error(err);
        toast("Failed to fetch templates.", {
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleCreateTemplate = async () => {
    if (!newTemplateName) {
      toast("Template name is required.", { variant: "destructive" });
      return;
    }
    try {
      const response = await instance.post("/api/templates", {
        name: newTemplateName,
        html: "<p>New Template</p>",
        css: "body { background-color: #ffffff; }",
      });
      setTemplates([...templates, response.data.data]);
      setNewTemplateName("");
      setOpenCreateDialog(false);
      toast(`Template "${newTemplateName}" created successfully.`);
      navigate(`/editor/${response.data.data._id}`);
    } catch (err) {
      console.error("Error creating template:", err);
      toast("Failed to create template.", {
        variant: "destructive",
      });
    }
  };

  const handleUpdateTemplateName = async (id: string, name: string) => {
    try {
      const response = await instance.put(`/api/templates/${id}`, {
        name,
        html: templates.find((t) => t._id === id)?.html,
        css: templates.find((t) => t._id === id)?.css,
      });
      setTemplates(templates.map((t) => (t._id === id ? response.data.data : t)));
      setEditTemplateId(null);
      setEditTemplateName("");
      toast(`Template name updated to "${name}".`);
    } catch (err) {
      console.error("Error updating template name:", err);
      toast("Failed to update template name.", {
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await instance.delete(`/api/templates/${id}`);
      setTemplates(templates.filter((t) => t._id !== id));
      toast("Template deleted successfully.");
    } catch (err) {
      console.error("Error deleting template:", err);
      toast("Failed to delete template.", {
        variant: "destructive",
      });
    }
  };

  const categories = [
    "All",
    ...Array.from(new Set(templates.map((t) => t.name.split(" ")[0]))),
  ];

  const filteredTemplates =
    selectedCategory === "All"
      ? templates
      : templates.filter((t) => t.name.startsWith(selectedCategory));

  return (
    <div className="p-6 space-y-6 bg-[#0f0f0f] rounded-2xl border-white border-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Template Library</h1>
          <p className="text-muted-foreground mt-2">
            Choose a template to start editing
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#252528] cursor-pointer">Create New Template</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="Enter template name"
                  />
                </div>
                <Button onClick={handleCreateTemplate}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={`
                capitalize
                ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "bg-transparent text-white border-white/20 hover:bg-white/10"
                }
                cursor-pointer transition-colors duration-200
              `}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {loading && <p className="text-white">Loading templates...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card
            key={template._id}
            className="bg-[#0f0f0f] shadow-card hover:shadow-lg transition-all duration-300 group"
          >
            <CardHeader className="pb-3">
              <div className="aspect-video rounded-lg overflow-hidden bg-white mb-4 relative">
                <iframe
                  title={`template-${template._id}`}
                  className="w-full h-full border-none"
                  sandbox=""
                  srcDoc={`
                    <html>
                      <head>
                        <style>${template.css}</style>
                      </head>
                      <body>${template.html}</body>
                    </html>
                  `}
                />
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  <Palette className="w-3 h-3 mr-1" />
                  {template.name.split(" ")[0]}
                </Badge>
              </div>
              {editTemplateId === template._id ? (
                <div className="flex gap-2 items-center">
                  <Input
                    value={editTemplateName}
                    onChange={(e) => setEditTemplateName(e.target.value)}
                    placeholder="Enter template name"
                    className="text-xl text-white bg-[#2a2a2a] border-white/20"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleUpdateTemplateName(template._id, editTemplateName)}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditTemplateId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <CardTitle
                  className="text-xl text-white cursor-pointer"
                  onClick={() => {
                    setEditTemplateId(template._id);
                    setEditTemplateName(template.name);
                  }}
                >
                  {template.name}
                </CardTitle>
              )}
              <CardDescription className="text-sm text-white">
                Created on{" "}
                {new Date(template.createdAt).toLocaleDateString("en-GB")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-black border-white/20 hover:bg-white/70 cursor-pointer transition-colors duration-200"
                  onClick={() => navigate(`/preview/${template._id}`)}
                >
                  <Eye className="w-4 h-4 mr-2 text-black" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-primary border-1 hover:bg-white/30 cursor-pointer"
                  onClick={() => navigate(`/editor/${template._id}`)}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-black hover:bg-white/30 cursor-pointer"
                  onClick={() => handleDeleteTemplate(template._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}