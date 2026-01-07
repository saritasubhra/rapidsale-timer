import prisma from "../db.server";

export async function loader({ request }) {
  const url = new URL(request.url);

  const shop = url.searchParams.get("shop");
  const type = url.searchParams.get("type");

  if (!shop || !type) {
    return new Response("Missing params", { status: 400 });
  }

  const timer = await prisma.timer.findFirst({
    where: {
      shop,
      type, // "product-page"
      status: "active",
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!timer) {
    return Response.json(null);
  }

  return Response.json(timer, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    },
  });
}
