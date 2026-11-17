
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return Response.json(
        { error: "Method not allowed." },
        { status: 405 }
      );
    }

    let createdEmployeeId: string | null = null;
    let invitedUserId: string | null = null;

    try {
      // 1. Verify administrator permissions
      const { data: isAdmin, error: adminError } =
        await ctx.supabase.rpc("is_admin");

      if (adminError || isAdmin !== true) {
        return Response.json(
          { error: "Administrator access required." },
          { status: 403 }
        );
      }

      // 2. Read request
      const body = await req.json();

      const loginId = String(body.login_id || "").trim();
      const employeeId = String(body.employee_id || "").trim();
      const employeeName = String(body.employee_name || "").trim();
      const email = String(body.email || "").trim().toLowerCase();

      const companyId = Number(body.company_id);
      const officeId = Number(body.office_id);
      const designationId = Number(body.designation_id);
      const roleId = Number(body.role_id);

      if (
        !loginId ||
        !employeeId ||
        !employeeName ||
        !email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !Number.isInteger(companyId) ||
        !Number.isInteger(officeId) ||
        !Number.isInteger(designationId) ||
        !Number.isInteger(roleId)
      ) {
        return Response.json(
          { error: "Please provide all valid employee and login details." },
          { status: 400 }
        );
      }

      // 3. Verify application role
      const { data: role, error: roleError } =
        await ctx.supabaseAdmin
          .from("role_master")
          .select("id, role_name, status")
          .eq("id", roleId)
          .maybeSingle();

      if (
        roleError ||
        !role ||
        role.status?.toLowerCase() !== "active"
      ) {
        return Response.json(
          { error: "Selected application role does not exist or is inactive." },
          { status: 400 }
        );
      }

      if (role.role_name?.toLowerCase() === "admin") {
        return Response.json(
          { error: "Additional Admin accounts cannot be created here." },
          { status: 403 }
        );
      }

      // 4. Verify company
      const { data: company, error: companyError } =
        await ctx.supabaseAdmin
          .from("company_master")
          .select("id")
          .eq("id", companyId)
          .maybeSingle();

      if (companyError || !company) {
        return Response.json(
          { error: "Selected company does not exist." },
          { status: 400 }
        );
      }

      // 5. Verify office belongs to selected company
      const { data: office, error: officeError } =
        await ctx.supabaseAdmin
          .from("office_master")
          .select("id")
          .eq("id", officeId)
          .eq("company_id", companyId)
          .maybeSingle();

      if (officeError || !office) {
        return Response.json(
          { error: "Selected office does not belong to this company." },
          { status: 400 }
        );
      }

      // 6. Verify designation
      const { data: designation, error: designationError } =
        await ctx.supabaseAdmin
          .from("designation_master")
          .select("id")
          .eq("id", designationId)
          .maybeSingle();

      if (designationError || !designation) {
        return Response.json(
          { error: "Selected designation does not exist." },
          { status: 400 }
        );
      }

      // 7. Check duplicate login ID
      const { data: existingLogin, error: loginCheckError } =
        await ctx.supabaseAdmin
          .from("login_master")
          .select("login_id")
          .eq("login_id", loginId)
          .maybeSingle();

      if (loginCheckError) throw loginCheckError;

      if (existingLogin) {
        return Response.json(
          { error: "This Login ID is already registered." },
          { status: 409 }
        );
      }

      // 8. Check duplicate employee ID
      const { data: existingEmployee, error: employeeCheckError } =
        await ctx.supabaseAdmin
          .from("employee_master")
          .select("employee_id")
          .eq("employee_id", employeeId)
          .maybeSingle();

      if (employeeCheckError) throw employeeCheckError;

      if (existingEmployee) {
        return Response.json(
          { error: "This Employee ID is already registered." },
          { status: 409 }
        );
      }

      // 9. Check duplicate email in login master
      const { data: existingEmail, error: emailCheckError } =
        await ctx.supabaseAdmin
          .from("login_master")
          .select("login_id")
          .ilike("email", email)
          .maybeSingle();

      if (emailCheckError) throw emailCheckError;

      if (existingEmail) {
        return Response.json(
          { error: "This email is already registered." },
          { status: 409 }
        );
      }

      // 10. Create employee record first
      const { data: employee, error: employeeInsertError } =
        await ctx.supabaseAdmin
          .from("employee_master")
          .insert({
            employee_id: employeeId,
            employee_name: employeeName,
            company_id: companyId,
            office_id: officeId,
            designation_id: designationId,
          })
          .select("employee_id, employee_name")
          .single();

      if (employeeInsertError || !employee) {
        console.error("Employee insertion error:", employeeInsertError);

        return Response.json(
          {
            error:
              employeeInsertError?.message ||
              "Unable to create employee record.",
          },
          { status: 400 }
        );
      }

      createdEmployeeId = employee.employee_id;

      // 11. Send Supabase invitation
      const { data: inviteData, error: inviteError } =
        await ctx.supabaseAdmin.auth.admin.inviteUserByEmail(
          email,
          {
            redirectTo: "http://localhost:5173",
            data: {
              employee_id: employeeId,
              login_id: loginId,
            },
          }
        );

      if (inviteError || !inviteData.user) {
        console.error("Invitation error:", inviteError);

        // Remove employee if invitation fails
        const { error: cleanupError } =
          await ctx.supabaseAdmin
            .from("employee_master")
            .delete()
            .eq("employee_id", employeeId);

        if (cleanupError) {
          console.error("Employee cleanup error:", cleanupError);
        }

        createdEmployeeId = null;

        return Response.json(
          {
            error:
              inviteError?.message ||
              "Unable to send invitation.",
          },
          { status: 400 }
        );
      }

      invitedUserId = inviteData.user.id;

      // 12. Create login master record
      const { error: insertError } =
        await ctx.supabaseAdmin
          .from("login_master")
          .insert({
            login_id: loginId,
            employee_name: employee.employee_name,
            email,
            role_id: roleId,
            status: "Active",
            employee_id: employeeId,
            auth_user_id: invitedUserId,
          });

      if (insertError) {
        console.error("Login insertion error:", insertError);

        // Clean up invited Auth user
        const { error: authCleanupError } =
          await ctx.supabaseAdmin.auth.admin.deleteUser(
            invitedUserId
          );

        if (authCleanupError) {
          console.error("Auth cleanup error:", authCleanupError);
        }

        invitedUserId = null;

        // Clean up employee record
        const { error: employeeCleanupError } =
          await ctx.supabaseAdmin
            .from("employee_master")
            .delete()
            .eq("employee_id", employeeId);

        if (employeeCleanupError) {
          console.error("Employee cleanup error:", employeeCleanupError);
        }

        createdEmployeeId = null;

        return Response.json(
          {
            error:
              "Invitation was created, but login linking failed. " +
              "Please check the database and contact the administrator.",
          },
          { status: 500 }
        );
      }

      // 13. Success
      createdEmployeeId = null;
      invitedUserId = null;

      return Response.json(
        {
          success: true,
          message: "Employee and login account created successfully. Invitation sent.",
          login_id: loginId,
          employee_id: employeeId,
        },
        { status: 201 }
      );

    } catch (error) {
      console.error("Manage login error:", error);

      // Best-effort cleanup for unexpected errors
      if (invitedUserId) {
        const { error: authCleanupError } =
          await ctx.supabaseAdmin.auth.admin.deleteUser(invitedUserId);

        if (authCleanupError) {
          console.error("Auth cleanup error:", authCleanupError);
        }
      }

      if (createdEmployeeId) {
        const { error: employeeCleanupError } =
          await ctx.supabaseAdmin
            .from("employee_master")
            .delete()
            .eq("employee_id", createdEmployeeId);

        if (employeeCleanupError) {
          console.error("Employee cleanup error:", employeeCleanupError);
        }
      }

      return Response.json(
        { error: error instanceof Error ? error.message : "Unexpected error while creating login." },
        { status: 500 }
      );
    }
  }),
};
