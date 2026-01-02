import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export async function action({ request }) {
  try {
    const { session } = await authenticate.admin(request);
    const data = await request.json();

    const timer = await prisma.timer.create({
      data: {
        shop: session.shop,
        name: data.name || "Untitled Timer",
        title: data.title,
        subheading: data.subheading,
        buttonText: data.buttonText,
        link: data.link,
        timerType: data.timerType,
        endDate: data.endDate,
        endTime: data.endTime,
        fixedMinutes: data.fixedMinutes,
        // CRITICAL: Ensure this is saved correctly as JSON
        timerLabels: data.timerLabels || {
          days: "Days",
          hrs: "Hrs",
          mins: "Mins",
          secs: "Secs",
        },
        bgColor: data.bgColor,
        borderRadius: String(data.borderRadius),
        borderSize: String(data.borderSize),
        borderColor: data.borderColor,
        paddingTopBottom: String(data.paddingTopBottom),
        paddingInside: String(data.paddingInside),
        fontFamily: data.fontFamily,
        titleSize: String(data.titleSize),
        titleColor: data.titleColor,
        productTarget: data.productTarget,
        geoTarget: data.geoTarget,
        type: data.type || "product-page", // Ensure this exists
        status: "published",
      },
    });

    return Response.json({ result: timer });
  } catch (error) {
    console.error("Prisma Error:", error);
    // Returning a 500 JSON response prevents the "Unexpected token U" error
    return Response.json({ error: error.message }, { status: 500 });
  }
}
