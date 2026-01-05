import prisma from "../db.server";

export async function loader({ params }) {
  const timer = await prisma.timer.findFirst({
    where: {
      id: params.id,
      status: "active",
    },
  });

  if (!timer) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(timer);
}
