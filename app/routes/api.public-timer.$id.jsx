import prisma from "../db.server";

export const loader = async ({ params }) => {
  const { id } = params;

  const timer = await prisma.timer.findUnique({
    where: { id },
  });

  if (!timer || timer.status !== "active") {
    return Response.json(
      { error: "Timer not found or inactive" },
      { status: 404 },
    );
  }

  // Return the data to the storefront
  return Response.json(timer);
};
