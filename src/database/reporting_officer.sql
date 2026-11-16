
CREATE OR REPLACE FUNCTION public.reporting_officer_decision(
    p_application_id bigint,
    p_decision text,
    p_remarks text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_actor_id varchar;
    v_role text;
    v_status varchar;
    v_reporting_officer_id varchar;
    v_employee_id varchar;
    v_new_status varchar;
BEGIN
    v_actor_id := public.current_employee_id();

    IF v_actor_id IS NULL THEN
        RAISE EXCEPTION 'Active employee account not found.';
    END IF;

    SELECT lower(rm.role_name)
    INTO v_role
    FROM public.login_master lm
    JOIN public.role_master rm ON rm.id = lm.role_id
    WHERE lm.auth_user_id = auth.uid()
      AND lower(lm.status) = 'active'
      AND lower(rm.status) = 'active';

    IF v_role IS DISTINCT FROM 'reporting officer' THEN
        RAISE EXCEPTION 'Only a Reporting Officer can perform this action.';
    END IF;

    IF lower(p_decision) NOT IN ('forward', 'reject') THEN
        RAISE EXCEPTION 'Invalid decision.';
    END IF;

    SELECT employee_id, status, reporting_officer_id
    INTO v_employee_id, v_status, v_reporting_officer_id
    FROM public.leave_details
    WHERE id = p_application_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Leave application not found.';
    END IF;

    IF v_status <> 'Pending' THEN
        RAISE EXCEPTION 'This application is no longer pending.';
    END IF;

    IF v_reporting_officer_id IS DISTINCT FROM v_actor_id THEN
        RAISE EXCEPTION 'This application is not assigned to you.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.employee_reporting_map erm
        WHERE erm.employee_id = v_employee_id
          AND erm.reporting_officer_id = v_actor_id
          AND erm.is_active = true
    ) THEN
        RAISE EXCEPTION 'Your active officer assignment could not be verified.';
    END IF;

    v_new_status := CASE
        WHEN lower(p_decision) = 'forward' THEN 'Forwarded'
        ELSE 'Rejected'
    END;

    UPDATE public.leave_details
    SET status = v_new_status,
        reporting_officer_remarks = NULLIF(btrim(p_remarks), ''),
        reporting_action_at = now()
    WHERE id = p_application_id;

    INSERT INTO public.approval_history (
        leave_application_id,
        actor_id,
        action,
        remarks
    )
    VALUES (
        p_application_id,
        v_actor_id,
        v_new_status,
        NULLIF(btrim(p_remarks), '')
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.reporting_officer_decision(bigint, text, text)
TO authenticated;
