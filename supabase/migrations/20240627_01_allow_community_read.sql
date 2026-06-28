-- Allow public read on communities (dev only)
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read"
ON public.communities
FOR SELECT
USING (true);
