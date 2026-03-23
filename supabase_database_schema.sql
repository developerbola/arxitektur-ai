
CREATE TABLE public.ai_history (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  project_id uuid,
  prompt text NOT NULL,
  response jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_history_pkey PRIMARY KEY (id),
  CONSTRAINT ai_history_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
CREATE TABLE public.canvas_elements (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL,
  type text NOT NULL,
  x double precision NOT NULL,
  y double precision NOT NULL,
  width double precision NOT NULL,
  height double precision NOT NULL,
  rotation double precision DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT canvas_elements_pkey PRIMARY KEY (id),
  CONSTRAINT canvas_elements_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Untitled Project'::text,
  thumbnail_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT projects_pkey PRIMARY KEY (id)
);