import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { id } = await request.json();

  try {
    const timer = await prisma.timer.update({
      where: { id: id, shop: session.shop },
      data: { status: "active" },
    });

    // Return the shop URL so the frontend knows where to redirect
    return Response.json({ success: true, shop: session.shop });
  } catch (error) {
    return Response.json({ success: false }, { status: 500 });
  }
};
