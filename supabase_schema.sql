-- Enable the PostGIS extension (once per project)
CREATE EXTENSION IF NOT EXISTS postgis;

-- ----------------------------------------------------------------------
-- tickets – core table for civic issue reports
-- ----------------------------------------------------------------------
CREATE TABLE public.tickets (
    id            uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
    user_phone_id text      NOT NULL,                       -- hashed phone identifier
    category      text      NOT NULL CHECK (
                     category IN ('Pothole','Lighting','Water','Waste','Infrastructure')
                   ),
    description   text      NOT NULL,                       -- AI‑generated short summary
    severity      int       NOT NULL CHECK (severity BETWEEN 1 AND 5),
    status        text      NOT NULL DEFAULT 'Open' CHECK (
                     status IN ('Open','In_Progress','Resolved')
                   ),
    lat           double precision NOT NULL,
    lng           double precision NOT NULL,
    location      geography(Point, 4326) GENERATED ALWAYS AS
                    (ST_SetSRID(ST_MakePoint(lng, lat), 4326)) STORED,
    image_url     text      NOT NULL,                       -- Supabase storage URL
    report_count  int       NOT NULL DEFAULT 1,
    created_at    timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast geospatial radius queries (≈50 m)
CREATE INDEX tickets_location_idx
    ON public.tickets USING GIST (location);

-- Composite index to rank tickets by severity + report count (used on dashboard)
CREATE INDEX tickets_severity_report_idx
    ON public.tickets (severity DESC, report_count DESC);
