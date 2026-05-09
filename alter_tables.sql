-- Correcciones sugeridas para ampliar Perfiles y Proyectos

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cargo text default 'Laboratorista';

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS client text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS coordinates text;
