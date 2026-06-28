-- RPC to check for duplicate tickets within a given radius using PostGIS
CREATE OR REPLACE FUNCTION public.check_duplicate_ticket(
    p_category text,
    p_lat double precision,
    p_lng double precision,
    p_radius_meters double precision
)
RETURNS TABLE (id uuid, upvote_count int)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.upvote_count
    FROM public.tickets t
    WHERE t.category = p_category
      AND t.status != 'resolved'
      AND ST_Distance(
            t.location,
            ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)
          ) <= p_radius_meters
    ORDER BY t.created_at ASC
    LIMIT 1;
END;
$$;

-- RPC to increment the upvote_count and bounty_amount of an existing ticket
CREATE OR REPLACE FUNCTION public.increment_ticket_count(t_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.tickets
    SET upvote_count = upvote_count + 1,
        bounty_amount = bounty_amount + 5
    WHERE id = t_id;
END;
$$;
