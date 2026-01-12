import { useLoaderData, useNavigate } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { useState } from "react";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const timers = await prisma.timer.findMany({
    where: {
      shop: session.shop,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      timerType: true,
      endDate: true,
      expiresAt: true,
      fixedMinutes: true,
      status: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({
    timers,
    shop: session.shop,
    extensionId: process.env.SHOPIFY_RAPIDSALE_TIMER_ID,
  });
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();
  const product = responseJson.data.productCreate.product;
  const variantId = product.variants.edges[0].node.id;
  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyReactRouterTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );
  const variantResponseJson = await variantResponse.json();

  return {
    product: responseJson.data.productCreate.product,
    variant: variantResponseJson.data.productVariantsBulkUpdate.productVariants,
  };
};

export default function Index() {
  const { timers, shop, extensionId } = useLoaderData();
  const [timerList, setTimerList] = useState(timers || []);
  const shopify = useAppBridge();
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    try {
      const res = await fetch("/api/timer-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        shopify.toast.show("Timer deleted!");

        setTimerList((prev) => prev.filter((timer) => timer.id !== id));
      }
    } catch (err) {
      shopify.toast.show("Failed to delete timer", { isError: true });
    }
  };

  const handlePublish = async () => {
    const editorUrl = `https://${shop}/admin/themes/current/editor?context=apps`;
    window.open(editorUrl, "_blank");
  };
  // const handlePublish = async () => {
  //   const editorUrl = `https://${shop}/admin/themes/current/editor?context=apps&activateAppId=${extensionId}`;
  //   window.open(editorUrl, "_blank");
  // };
  // const handlePublish = async (id) => {
  //   try {
  //     const res = await fetch("/api/timer-publish", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ id }),
  //     });
  //     const data = await res.json();

  //     if (data.success) {
  //       shopify.toast.show("Timer Published!");

  //       setTimerList((prev) =>
  //         prev.map((t) => (t.id === id ? { ...t, status: "active" } : t)),
  //       );

  //       window.open(
  //         `https://${data.shop}/admin/themes/current/editor?template=product&addAppBlockId=rapidsale-timer`,
  //         "_blank",
  //       );
  //     }
  //   } catch (err) {
  //     shopify.toast.show("Failed to publish", { isError: true });
  //   }
  // };

  const isExpired = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  return (
    <s-page heading="My Countdown Timers">
      <s-button
        slot="primary-action"
        onClick={() => navigate("/app/templates")}
      >
        Create New Timer
      </s-button>

      <s-section heading="Manage your timers">
        {timerList.length === 0 ? (
          <s-paragraph>No timers created yet.</s-paragraph>
        ) : (
          <s-box borderWidth="base" borderRadius="base">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #dfe3e8",
                  }}
                >
                  <th style={{ padding: "12px" }}>Name</th>
                  <th style={{ padding: "12px" }}>Status</th>{" "}
                  {/* STATUS HEADER */}
                  <th style={{ padding: "12px" }}>Created At</th>
                  <th style={{ padding: "12px" }}>Expires In/On</th>
                  <th style={{ padding: "12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {timerList.map((timer) => (
                  <tr
                    key={timer.id}
                    style={{ borderBottom: "1px solid #dfe3e8" }}
                  >
                    <td style={{ padding: "12px" }}>
                      <strong>{timer.name}</strong>
                    </td>

                    {/* STATUS TAB/BADGE */}
                    <td style={{ padding: "12px" }}>
                      {isExpired(timer.expiresAt) ? (
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "10px",
                            fontSize: "12px",
                            backgroundColor: "#fdecea",
                            color: "#b42318",
                            fontWeight: 600,
                          }}
                        >
                          Expired
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "10px",
                            fontSize: "12px",
                            backgroundColor:
                              timer.status === "active" ? "#e3fbe3" : "#f1f1f1",
                            color:
                              timer.status === "active" ? "#008000" : "#666",
                            fontWeight: 600,
                          }}
                        >
                          {timer.status || "draft"}
                        </span>
                      )}
                    </td>

                    <td style={{ padding: "12px" }}>
                      {new Date(timer.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {new Date(timer.endDate).toLocaleDateString()}
                    </td>

                    <td style={{ padding: "12px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <s-button
                          variant="secondary"
                          tone="critical"
                          onClick={() => handleDelete(timer.id)}
                        >
                          Delete
                        </s-button>

                        {!isExpired(timer.expiresAt) && (
                          <s-button
                            variant="primary"
                            onClick={() => handlePublish(timer.id)}
                          >
                            Publish & View
                          </s-button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </s-box>
        )}
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
