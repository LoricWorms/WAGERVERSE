CREATE OR REPLACE FUNCTION get_tournament_standings(p_tournament_id UUID)
RETURNS TABLE (
    team_id UUID,
    team_name TEXT,
    team_logo_url TEXT,
    wins BIGINT,
    losses BIGINT,
    points BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH team_results AS (
        SELECT
            t.id AS team_id,
            t.name AS team_name,
            t.logo_url AS team_logo_url,
            CASE
                WHEN m.winner_id = t.id THEN 1
                ELSE 0
            END AS is_win,
            CASE
                WHEN m.winner_id IS NOT NULL AND m.winner_id != t.id THEN 1
                ELSE 0
            END AS is_loss
        FROM
            public.teams t
        JOIN
            public.matches m ON m.team1_id = t.id OR m.team2_id = t.id
        WHERE
            m.tournament_id = p_tournament_id
            AND m.status = 'done' -- Only consider finished matches
    )
    SELECT
        tr.team_id,
        tr.team_name,
        tr.team_logo_url,
        SUM(tr.is_win) AS wins,
        SUM(tr.is_loss) AS losses,
        SUM(tr.is_win * 3) AS points -- 3 points for a win
    FROM
        team_results tr
    GROUP BY
        tr.team_id, tr.team_name, tr.team_logo_url
    ORDER BY
        points DESC, wins DESC;
END;
$$;
