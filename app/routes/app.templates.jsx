import {
  Page,
  Card,
  Text,
  Button,
  InlineGrid,
  BlockStack,
} from "@shopify/polaris";
import { useNavigate } from "react-router";

const TIMER_TYPES = [
  {
    id: "product-page",
    title: "Product page",
    description: "Block in product page below add to cart button.",
  },
  {
    id: "top-bottom-bar",
    title: "Top/bottom bar",
    description: "Fixed or sticky bar on top or bottom of any page.",
  },
  {
    id: "landing-page",
    title: "Landing page",
    description: "Block in home, collection, password, or any other page.",
    locked: true,
  },
  {
    id: "cart-page",
    title: "Cart page",
    description: "Block in cart page below checkout button.",
    locked: true,
  },
  {
    id: "email-timer",
    title: "Email timer",
    description: "Add countdown timer to email marketing campaigns.",
    locked: true,
  },
];

export default function Templates() {
  const navigate = useNavigate();

  return (
    <Page
      title="Choose timer type"
      backAction={{
        content: "Home",
        onAction: () => navigate("/app"),
      }}
    >
      <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="400">
        {TIMER_TYPES.map((timer) => (
          <Card key={timer.id} padding="400">
            <BlockStack gap="300">
              {/* Fake preview placeholder */}
              <div
                style={{
                  height: 120,
                  background: "#f1f2f4",
                  borderRadius: 8,
                }}
              />

              <BlockStack gap="100">
                <Text variant="headingSm">{timer.title}</Text>
                <Text variant="bodySm" tone="subdued">
                  {timer.description}
                </Text>
              </BlockStack>

              {timer.locked ? (
                <Button variant="secondary" disabled>
                  Upgrade now
                </Button>
              ) : (
                <Button
                  fullWidth
                  onClick={() => navigate(`/app/timer/${timer.id}`)}
                >
                  Select this timer type
                </Button>
              )}
            </BlockStack>
          </Card>
        ))}
      </InlineGrid>
    </Page>
  );
}
