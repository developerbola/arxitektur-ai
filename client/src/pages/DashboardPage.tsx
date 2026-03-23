import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Plus,
  Clock,
  ChevronRight,
  HardHat,
  Building2,
  PaintBucket,
  Layers,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import axios from "axios";
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export default function DashboardPage({ session }: { session: Session }) {
  const { t, i18n } = useTranslation();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/projects`, {
        headers: {
          "x-user-id": session.user.id,
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      setProjects(response.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    try {
      setCreating(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/projects`,
        {
          name: "New Architecture Project",
        },
        {
          headers: {
            "x-user-id": session.user.id,
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      const data = response.data;
      if (data) {
        navigate(`/project/${data.id}`);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#3b82f6]/30">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Arxitektur
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <select 
              value={i18n.language} 
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-sm font-medium text-slate-300 outline-none hover:bg-white/10 transition-colors"
            >
              <option value="en">English</option>
              <option value="uz">O'zbek</option>
              <option value="uz-Cyrl">Ўзбек</option>
              <option value="ru">Русский</option>
            </select>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold">
                {session.user.email?.[0].toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-300">
                {session.user.email}
              </span>
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2"
            >
              {t("header.signOut")}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight mb-2">
                {t("dashboard.welcome")}
              </h2>
              <p className="text-slate-400 text-lg">
                {t("dashboard.subtitle")}
              </p>
            </div>

            <button
              onClick={createProject}
              disabled={creating}
              className="group flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
              {creating ? t("dashboard.initializing") : t("dashboard.newProject")}
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-white/5 rounded-3xl border border-white/10"
                />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                <PaintBucket className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{t("dashboard.noProjects")}</h3>
              <p className="text-slate-400 max-w-md mb-8">
                {t("dashboard.emptyState")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="group relative flex flex-col h-64 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none" />

                  <div className="relative z-10 flex justify-between items-start mb-auto">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-500">
                      {project.name.toLowerCase().includes("office") ? (
                        <Building2 className="w-6 h-6 text-blue-400" />
                      ) : (
                        <HardHat className="w-6 h-6 text-emerald-400" />
                      )}
                    </div>

                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/10">
                      <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="relative z-10 mt-auto">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }).format(new Date(project.updated_at))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
