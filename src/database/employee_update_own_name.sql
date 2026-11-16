CREATE POLICY "employee_update_own_name"
ON public.employee_master
FOR UPDATE
TO authenticated
USING (
    employee_id = public.current_employee_id()
)
WITH CHECK (
    employee_id = public.current_employee_id()
);