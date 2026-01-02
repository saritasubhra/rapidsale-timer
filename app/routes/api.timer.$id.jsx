import prisma from "../db.server";

export async function loader({ params }) {
  const timer = await prisma.timer.findFirst({
    where: {
      id: params.id,
      status: "published",
    },
  });

  if (!timer) {
    throw new Response("Not found", { status: 404 });
  }

  return Response.json(timer);
}
