import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export async function action({ request }) {
  try {
    const { session } = await authenticate.admin(request);
    const data = await request.json();

    // --- CALCULATION LOGIC FOR OPTION 4 ---
    let expiryDate = null;

    if (data.timerType === "date" && data.endDate) {
      // Combine date and time strings (e.g., "2026-01-20" + "T" + "23:59")
      const timePart = data.endTime || "00:00";
      expiryDate = new Date(`${data.endDate}T${timePart}`);
    } else if (data.timerType === "fixed" && data.fixedMinutes) {
      // Add minutes to the current time
      expiryDate = new Date();
      expiryDate.setMinutes(
        expiryDate.getMinutes() + parseInt(data.fixedMinutes),
      );
    }

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
        timerLabels: data.timerLabels,

        // --- UPDATED FIELDS ---
        status: "active", // Start as active, not just "published"
        expiresAt: expiryDate, // This will now show a timestamp in Prisma Studio

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
        type: data.type || "product-page",
      },
    });

    return Response.json({ id: timer.id }); // Using 'id' to match your frontend fetch
  } catch (error) {
    console.error("Prisma Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
