import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed." });
  }

  const supabaseUrl = (
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ""
  ).trim();

  const supabaseKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ""
  ).trim();

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      message: "The server is missing Supabase environment variables for applicant lookup.",
    });
  }

  const applicantId = String(req.query?.applicantId || "").trim();

  if (!applicantId) {
    return res.status(400).json({ message: "Missing applicantId." });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data, error } = await supabase
      .from("applicants")
      .select("first_name, last_name")
      .eq("id", applicantId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const firstName = String(data?.first_name || "").trim();
    const lastName = String(data?.last_name || "").trim();
    const applicantName = [firstName, lastName].filter(Boolean).join(" ").trim();

    return res.status(200).json({
      applicantName,
      firstName,
    });
  } catch (error: any) {
    console.error("Interview applicant lookup failed:", error);
    return res.status(500).json({
      message: error?.message || "Failed to load applicant details.",
    });
  }
}
