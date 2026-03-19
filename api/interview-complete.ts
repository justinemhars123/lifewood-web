import { createClient } from "@supabase/supabase-js";

async function readRequestBody(req: any) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string" && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  const chunks: Uint8Array[] = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8").trim();
  if (!rawBody) return {};

  try {
    return JSON.parse(rawBody);
  } catch {
    return {};
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
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
      message: "The server is missing Supabase environment variables for interview completion.",
    });
  }

  const body = await readRequestBody(req);

  const applicantId = String(body?.applicantId || "").trim();
  const transcript = Array.isArray(body?.qaTranscript) ? body.qaTranscript : [];
  const interviewScore =
    typeof body?.interviewScore === "number" ? body.interviewScore : null;
  const evaluationSummary =
    typeof body?.evaluationSummary === "string" ? body.evaluationSummary : null;

  if (!applicantId) {
    return res.status(400).json({ message: "Missing applicantId." });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { error: updateApplicantError } = await supabase
      .from("applicants")
      .update({ status: "Interview Completed" })
      .eq("id", applicantId);

    if (updateApplicantError) {
      throw updateApplicantError;
    }

    let savedInterviewResult = false;

    const { data: existingRows, error: existingRowsError } = await supabase
      .from("interview_results")
      .select("id")
      .eq("applicant_id", applicantId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (existingRowsError) {
      console.error("Failed to look up existing interview_results row:", existingRowsError);
    } else if (existingRows && existingRows.length > 0) {
      const { error: updateInterviewError } = await supabase
        .from("interview_results")
        .update({
          qa_transcript: transcript,
          interview_score: interviewScore,
          evaluation_summary: evaluationSummary,
        })
        .eq("id", existingRows[0].id);

      if (updateInterviewError) {
        console.error("Failed to update interview_results row:", updateInterviewError);
      } else {
        savedInterviewResult = true;
      }
    } else {
      const { error: insertInterviewError } = await supabase
        .from("interview_results")
        .insert({
          applicant_id: applicantId,
          qa_transcript: transcript,
          interview_score: interviewScore,
          evaluation_summary: evaluationSummary,
        });

      if (insertInterviewError) {
        console.error("Failed to insert interview_results row:", insertInterviewError);
      } else {
        savedInterviewResult = true;
      }
    }

    return res.status(200).json({
      success: true,
      savedInterviewResult,
    });
  } catch (error: any) {
    console.error("Interview completion API failed:", error);
    return res.status(500).json({
      message: error?.message || "Failed to complete interview persistence.",
    });
  }
}
