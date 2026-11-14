
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

      // 2. Read and validate request
      const body = await req.json();

      const loginId = String(body.login_id || "").trim();
      const employeeId = String(body.employee_id || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const roleId = Number(body.role_id);

      if (
        !loginId ||
        !employeeId ||
        !email ||
        !Number.isInteger(roleId) ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        return Response.json(
          { error: "Please provide valid login, employee, email and role details." },
          { status: 400 }
        );
      }

      // 3. Verify employee exists
      const { data: employee, error: employeeError } =
        await ctx.supabaseAdmin
          .from("employee_master")
          .select("employee_id, employee_name")
          .eq("employee_id", employeeId)
          .maybeSingle();

      if (employeeError || !employee) {
        return Response.json(
          { error: "Employee record not found." },
          { status: 404 }
        );
      }

      // 4. Verify role exists and is active
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
          { error: "Selected role does not exist or is inactive." },
          { status: 400 }
        );
      }

      // Do not allow creation of additional Admin accounts
      if (role.role_name?.toLowerCase() === "admin") {
        return Response.json(
          { error: "Additional Admin accounts cannot be created here." },
          { status: 403 }
        );
      }

      // 5. Check for existing login ID
      const { data: existingLogin } =
        await ctx.supabaseAdmin
          .from("login_master")
          .select("login_id")
          .eq("login_id", loginId)
          .maybeSingle();

      if (existingLogin) {
        return Response.json(
          { error: "This Login ID is already registered." },
          { status: 409 }
        );
      }

      // 6. Check whether employee already has a login
      const { data: existingEmployeeLogin } =
        await ctx.supabaseAdmin
          .from("login_master")
          .select("login_id")
          .eq("employee_id", employeeId)
          .maybeSingle();

      if (existingEmployeeLogin) {
        return Response.json(
          { error: "This employee already has a login account." },
          { status: 409 }
        );
      }

      // 7. Check whether email is already registered
      const { data: existingEmail } =
        await ctx.supabaseAdmin
          .from("login_master")
          .select("login_id")
          .ilike("email", email)
          .maybeSingle();

      if (existingEmail) {
        return Response.json(
          { error: "This email is already registered." },
          { status: 409 }
        );
      }

      // 8. Send Supabase invitation
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

        return Response.json(
          { error: inviteError?.message || "Unable to send invitation." },
          { status: 400 }
        );
      }

      // 9. Link Auth account with login_master
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
            auth_user_id: inviteData.user.id,
          });

      if (insertError) {
        // Clean up Auth user if database linking fails
        const { error: cleanupError } =
          await ctx.supabaseAdmin.auth.admin.deleteUser(
            inviteData.user.id
          );

        if (cleanupError) {
          console.error("Auth cleanup error:", cleanupError);
        }

        console.error("Login record insertion error:", insertError);

        return Response.json(
          { error: "Invitation was created, but login linking failed. Please contact the administrator." },
          { status: 500 }
        );
      }

      return Response.json(
        {
          success: true,
          message: "Invitation sent successfully.",
          login_id: loginId,
          employee_id: employeeId,
        },
        { status: 201 }
      );

    } catch (error) {
      console.error("Manage login error:", error);

      return Response.json(
        { error: "An unexpected error occurred while creating the login." },
        { status: 500 }
      );
    }
  }),
};
