import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const { id } = await request.json();

  try {
    await prisma.timer.delete({
      where: {
        id: id,
        shop: session.shop,
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
};
