import prisma from "../db.server";

export async function action({ request }) {
  const { id } = await request.json();

  await prisma.timer.update({
    where: { id: id },
    data: { status: "expired" },
  });

  return Response.json({ success: true });
}
