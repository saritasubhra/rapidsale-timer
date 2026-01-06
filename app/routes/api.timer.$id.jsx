import prisma from "../db.server";

export async function loader({ params }) {
  const corsHeaders = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });

  const timer = await prisma.timer.findFirst({
    where: {
      id: params.id,
    },
  });

  if (!timer) {
    throw new Response("Not found", { status: 404, headers: corsHeaders });
  }

  return Response.json(JSON.stringify(timer), {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    },
  });
}
