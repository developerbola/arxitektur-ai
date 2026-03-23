import React from "react";
import {
  MousePointer2,
  Square,
  DoorClosed,
  Maximize,
  Hand,
  Undo2,
  Redo2,
  Save,
  Download,
  Settings,
  Share2,
  Loader2,
} from "lucide-react";
import { useStore } from "../../store/useStore";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- Shared Components ---

const ToolGroup = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-1 bg-white border rounded-xl p-1 shadow-sm px-2">
    {children}
  </div>
);

const ToolbarButton = ({
  icon: Icon,
  label,
  isActive,
  onClick,
  shortcut,
}: {
  icon: any;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  shortcut?: string;
}) => (
  <Tooltip>
    <TooltipTrigger
      render={
        <Button
          variant={isActive ? "default" : "ghost"}
          size="icon"
          onClick={onClick}
          className={`h-9 w-9 ${isActive ? "bg-blue-600 hover:bg-blue-700" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
        >
          <Icon className="w-5 h-5" />
        </Button>
      }
    />
    <TooltipContent side="bottom" className="flex items-center gap-2">
      <span>{label}</span>
      {shortcut && (
        <Badge variant="secondary" className="px-1 py-0 text-[10px] font-mono">
          {shortcut}
        </Badge>
      )}
    </TooltipContent>
  </Tooltip>
);

import { supabase } from "../../lib/supabase";
import { LogOut, User } from "lucide-react";

// --- Layout Parts ---

export const MainHeader = () => {
  const [user, setUser] = React.useState<any>(null);
  const { project_id } = useParams();
  const { currentProject, setProject, canvasElements, setCanvasElements } = useStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [projectName, setProjectName] = React.useState("Loading...");
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  React.useEffect(() => {
    if (!project_id) return;
    
    const fetchProject = async () => {
      try {
        const { data } = await supabase
          .from("projects")
          .select("*, canvas_elements(*)")
          .eq("id", project_id)
          .single();
        
        if (data) {
          setProject({ id: data.id, name: data.name });
          setProjectName(data.name);
          if (data.canvas_elements) {
            setCanvasElements(data.canvas_elements);
          }
        }
      } catch (err) {
        console.error("Failed to load project", err);
      }
    };
    
    fetchProject();
  }, [project_id, setProject, setCanvasElements]);

  const handleNameSave = async () => {
    setIsEditing(false);
    if (!project_id || projectName === currentProject?.name) return;

    try {
      setProject({ id: project_id, name: projectName });
      await supabase
        .from("projects")
        .update({ name: projectName, updated_at: new Date() })
        .eq("id", project_id);
    } catch (err) {
      console.error("Failed to save project name", err);
    }
  };

  const handleSaveCAD = async () => {
    if (!project_id) return;
    setIsSaving(true);
    try {
      await supabase.from("canvas_elements").delete().eq("project_id", project_id);
      
      if (canvasElements.length > 0) {
        const elementsToInsert = canvasElements.map(el => ({
          id: el.id,
          project_id: project_id,
          type: el.type,
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          rotation: el.rotation || 0,
          metadata: el.metadata || {}
        }));
        await supabase.from("canvas_elements").insert(elementsToInsert);
      }
    } catch (err) {
      console.error("Failed to sync project CAD elements to remote db", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-4 z-[60]">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          {isEditing ? (
            <input
              type="text"
              autoFocus
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSave();
                if (e.key === 'Escape') {
                  setProjectName(currentProject?.name || "Untitled Project");
                  setIsEditing(false);
                }
              }}
              className="text-sm font-semibold text-slate-900 leading-none bg-transparent border-b-2 border-blue-500 outline-none w-48 transition-all"
            />
          ) : (
            <span 
              className="text-sm font-semibold text-slate-900 leading-none cursor-text hover:text-blue-600 transition-colors px-1 -mx-1 rounded"
              onClick={() => setIsEditing(true)}
              title="Click to edit project name"
            >
              {currentProject?.name || projectName}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <select 
          value={i18n.language} 
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          className="bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none hover:bg-slate-200 transition-colors mr-2 cursor-pointer"
        >
          <option value="en">EN</option>
          <option value="uz">UZ</option>
          <option value="uz-Cyrl">ЎЗ</option>
          <option value="ru">RU</option>
        </select>

        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-500 mr-2 hover:bg-slate-100">
          {t("header.dashboard")}
        </Button>
        <div className="flex items-center gap-2 mr-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
        
        <Separator orientation="vertical" className="h-4 mx-1" />
        
        <div className="flex items-center gap-3 pl-2">
          <Tooltip>
            <TooltipTrigger
              render={
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden cursor-help">
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              }
            />
            <TooltipContent side="bottom" className="text-[11px]">
              {user?.email}
            </TooltipContent>
          </Tooltip>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSignOut}
            className="h-8 px-3 text-slate-500 hover:text-red-600 hover:bg-red-50 gap-2 font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            {t("header.signOut")}
          </Button>
          
          <Button 
            onClick={handleSaveCAD}
            disabled={isSaving}
            className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white gap-2 shadow-sm rounded-xl">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? t("header.saving") : t("header.save")}
          </Button>
        </div>
      </div>
    </header>
  );
};

export const FloatingToolbar = () => {
  const { selectedTool, setSelectedTool, undo, redo } = useStore();

  // Handle Keyboard Shortcuts for tools and undo/redo
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      const isMod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      // Undo/Redo
      if (isMod && key === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      // Tools
      if (!isMod) {
        switch (key) {
          case 'v': setSelectedTool('select'); break;
          case 'h': setSelectedTool('move'); break;
          case 'r': setSelectedTool('room'); break;
          case 'd': setSelectedTool('door'); break;
          case 'i': setSelectedTool('window'); break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, setSelectedTool]);

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-4 z-50">
      <ToolGroup>
        <ToolbarButton
          icon={MousePointer2}
          label="Select"
          isActive={selectedTool === "select"}
          onClick={() => setSelectedTool("select")}
          shortcut="V"
        />
        <ToolbarButton
          icon={Hand}
          label="Pan/Move"
          isActive={selectedTool === "move"}
          onClick={() => setSelectedTool("move")}
          shortcut="H"
        />
        <Separator orientation="vertical" className="h-6 mx-1" />
        <ToolbarButton
          icon={Square}
          label="Room"
          isActive={selectedTool === "room"}
          onClick={() => setSelectedTool("room")}
          shortcut="R"
        />
        <ToolbarButton
          icon={DoorClosed}
          label="Door"
          isActive={selectedTool === "door"}
          onClick={() => setSelectedTool("door")}
          shortcut="D"
        />
        <ToolbarButton
          icon={Maximize}
          label="Window"
          isActive={selectedTool === "window"}
          onClick={() => setSelectedTool("window")}
          shortcut="I"
        />
      </ToolGroup>

      <ToolGroup>
        <ToolbarButton
          icon={Undo2}
          label="Undo"
          onClick={undo}
          shortcut="⌘Z"
        />
        <ToolbarButton
          icon={Redo2}
          label="Redo"
          onClick={redo}
          shortcut="⇧⌘Z"
        />
      </ToolGroup>

      <ToolGroup>
        <ToolbarButton 
          icon={Download} 
          label="Export" 
          onClick={() => (window as any).exportCanvas?.()} 
        />
      </ToolGroup>
    </div>
  );
};
