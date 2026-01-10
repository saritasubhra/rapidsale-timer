import {
  Page,
  Card,
  Tabs,
  TextField,
  BlockStack,
  Layout,
  Box,
  Text,
  Badge,
  Button,
  InlineStack,
  RadioButton,
  Select,
  Divider,
  ChoiceList,
  Icon,
  InlineGrid,
} from "@shopify/polaris";

import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { CalendarIcon, SearchIcon, XIcon } from "@shopify/polaris-icons";

const today = new Date().toISOString().split("T")[0];

export default function TimerEditor() {
  const { type } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hrs: "00",
    mins: "00",
    secs: "00",
  });

  const isBar = type === "top-bottom-bar";

  const [formData, setFormData] = useState({
    // Content
    name: "Timer name",
    title: "Hurry up! Sale ends in:",
    subheading: "",
    callToAction: "Button",
    buttonText: "Shop now!",
    link: "https://your-store.myshopify.com",
    timerLabels: { days: "Days", hrs: "Hrs", mins: "Mins", secs: "Secs" },

    timerType: "date",
    endDate: today,
    endTime: "23:59",
    fixedMinutes: "120",
    onceItEnds: "unpublish",

    // Design

    template: "Custom",
    bgType: "single",
    bgColor: "#FFFFFF",
    borderRadius: "8",
    borderSize: "0",
    borderColor: "#c5c8d1",
    paddingTopBottom: "30",
    paddingInside: "20",
    fontFamily: "theme",
    titleSize: "28",
    titleColor: "#202223",

    // Placement

    productTarget: "all",
    geoTarget: "all",
    type: isBar ? "top-bottom-bar" : "product-page",
  });

  const handleUpdate = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { id: "content", content: "Content" },
    { id: "design", content: "Design" },
    { id: "placement", content: "Placement" },
  ];

  // --- PREVIEW RENDER LOGIC ---

  const previewStyles = {
    backgroundColor: formData.bgColor,
    // If it's a bar, we usually want 0 radius; otherwise use the setting
    borderRadius: `${formData.borderRadius}px`,
    border: `${formData.borderSize}px solid ${formData.borderColor}`,
    padding: `${parseInt(formData.paddingTopBottom) || 0}px 20px`,
    textAlign: "center",
    width: "100%",
  };

  const titleTextStyle = {
    color: formData.titleColor,
    fontSize: `${formData.titleSize}px`,
    // Line height 1 prevents the text box from creating extra vertical space
    lineHeight: "1",
    fontFamily:
      formData.fontFamily === "theme"
        ? "inherit"
        : `${formData.fontFamily}, sans-serif`,
  };

  const timerTextStyle = {
    fontSize: "32px", // Base size for the timer
    fontFamily:
      formData.fontFamily === "theme"
        ? "inherit"
        : `${formData.fontFamily}, sans-serif`,
  };

  useEffect(() => {
    // 1. Define the target end time
    let endTimeStamp;

    if (formData.timerType === "date") {
      endTimeStamp = new Date(
        `${formData.endDate}T${formData.endTime}`,
      ).getTime();
    } else {
      // For 'fixed', we treat it as "X minutes from right now"
      // Note: In a real app, you'd probably save the 'start' time so it doesn't reset on refresh
      const durationMs = Number(formData.fixedMinutes) * 60 * 1000;
      endTimeStamp = Date.now() + durationMs;
    }

    const calculateTimeLeft = () => {
      const now = Date.now();
      const diffMs = endTimeStamp - now;

      if (diffMs <= 0) {
        setTimeLeft({ days: "00", hrs: "00", mins: "00", secs: "00" });
        return;
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hrs = Math.floor((totalSeconds % 86400) / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;

      setTimeLeft({
        days: String(days).padStart(2, "0"),
        hrs: String(hrs).padStart(2, "0"),
        mins: String(mins).padStart(2, "0"),
        secs: String(secs).padStart(2, "0"),
      });
    };

    // Run once immediately
    calculateTimeLeft();

    // Set the interval
    const interval = setInterval(calculateTimeLeft, 1000);

    // Clean up
    return () => clearInterval(interval);

    // Dependencies: only restart the logic if these specific settings change
  }, [
    formData.timerType,
    formData.endDate,
    formData.endTime,
    formData.fixedMinutes,
  ]);

  const TimerDigits = (
    <div style={{ ...timerTextStyle, lineHeight: "1" }}>
      <BlockStack gap="100" align="center">
        <Text variant="heading3xl" as="span" fontSize="inherit">
          {timeLeft.days} : {timeLeft.hrs} : {timeLeft.mins} : {timeLeft.secs}
        </Text>
        <InlineStack gap="400" align="center">
          {Object.entries(formData.timerLabels).map(([key, label]) => (
            <Text key={key} variant="bodyXs" tone="subdued">
              {label}
            </Text>
          ))}
        </InlineStack>
      </BlockStack>
    </div>
  );

  return (
    <Page
      backAction={{
        content: "Templates",
        onAction: () => navigate("/app/templates"),
      }}
      title={formData.name}
      titleMetadata={<Badge tone="attention">Not published</Badge>}
      primaryAction={{
        content: "Publish",
        onAction: async () => {
          const res = await fetch("/api/timer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });

          await res.json();

          shopify.toast.show("Timer Saved!");
        },
      }}
    >
      <BlockStack gap="500">
        {/* --- TOP BAR PREVIEW --- */}
        {isBar && (
          <div style={previewStyles}>
            <InlineStack align="center" blockAlign="center" gap="800">
              {/* FIX: Use a div with titleTextStyle instead of <Text variant="..."> 
          This ensures fontSize and titleColor are actually applied.
      */}
              <div style={titleTextStyle}>
                {formData.title} {formData.subheading}
              </div>

              {TimerDigits}

              <Button variant="primary" tone="critical">
                {formData.buttonText}
              </Button>
            </InlineStack>
          </div>
        )}

        <Layout>
          {/* LEFT PANEL: CONFIGURATION */}
          <Layout.Section variant="oneHalf">
            <Card padding="0">
              <Tabs
                tabs={tabs}
                selected={selectedTab}
                onSelect={setSelectedTab}
              />

              <Box padding="400">
                <BlockStack gap="400">
                  {/* 1. CONTENT TAB */}

                  {selectedTab === 0 && (
                    <BlockStack gap="400">
                      <TextField
                        label="Countdown name"
                        value={formData.name}
                        onChange={(v) => handleUpdate("name", v)}
                        autoComplete="off"
                      />

                      <TextField
                        label="Title"
                        value={formData.title}
                        onChange={(v) => handleUpdate("title", v)}
                        autoComplete="off"
                      />

                      <TextField
                        label="Subheading"
                        value={formData.subheading}
                        onChange={(v) => handleUpdate("subheading", v)}
                        autoComplete="off"
                      />

                      <Select
                        label="Call to action"
                        options={[{ label: "Button", value: "Button" }]}
                        value={formData.callToAction}
                        onChange={(v) => handleUpdate("callToAction", v)}
                      />

                      <TextField
                        label="Button Text"
                        value={formData.buttonText}
                        onChange={(v) => handleUpdate("buttonText", v)}
                        autoComplete="off"
                      />

                      <Text variant="headingSm">Timer Type</Text>

                      <RadioButton
                        label="Countdown to a date"
                        checked={formData.timerType === "date"}
                        onChange={() => handleUpdate("timerType", "date")}
                      />

                      <RadioButton
                        label="Fixed minutes"
                        checked={formData.timerType === "fixed"}
                        onChange={() => handleUpdate("timerType", "fixed")}
                      />

                      {formData.timerType === "date" ? (
                        <BlockStack gap="200">
                          <TextField
                            label="End date"
                            prefix={<Icon source={CalendarIcon} />}
                            value={formData.endDate}
                            onChange={(v) => handleUpdate("endDate", v)}
                            type="date"
                          />

                          <TextField
                            label="End time"
                            value={formData.endTime}
                            onChange={(v) => handleUpdate("endTime", v)}
                            type="time"
                          />
                        </BlockStack>
                      ) : (
                        <TextField
                          label="Minutes"
                          type="number"
                          value={formData.fixedMinutes}
                          onChange={(v) => handleUpdate("fixedMinutes", v)}
                          autoComplete="off"
                        />
                      )}

                      <Button onClick={() => setSelectedTab(1)} fullWidth>
                        Continue to Design
                      </Button>
                    </BlockStack>
                  )}

                  {/* 2. DESIGN TAB */}

                  {selectedTab === 1 && (
                    <BlockStack gap="400">
                      <Select
                        label="Template"
                        options={[{ label: "Custom", value: "Custom" }]}
                        value={formData.template}
                        onChange={(v) => handleUpdate("template", v)}
                      />

                      <Text variant="headingMd">Card</Text>
                      <RadioButton
                        label="Single color background"
                        checked={formData.bgType === "single"}
                        onChange={() => handleUpdate("bgType", "single")}
                      />
                      <InlineStack gap="200" align="start">
                        <div
                          style={{
                            width: 35,
                            height: 35,
                            backgroundColor: formData.bgColor,
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                          }}
                        />
                        <TextField
                          label="Background Color"
                          labelHidden
                          value={formData.bgColor}
                          onChange={(v) => handleUpdate("bgColor", v)}
                          autoComplete="off"
                        />
                      </InlineStack>

                      <InlineGrid columns={2} gap="400">
                        <TextField
                          label="Border radius"
                          suffix="px"
                          value={formData.borderRadius}
                          onChange={(v) => handleUpdate("borderRadius", v)}
                          type="number"
                        />
                        <TextField
                          label="Border size"
                          suffix="px"
                          value={formData.borderSize}
                          onChange={(v) => handleUpdate("borderSize", v)}
                          type="number"
                        />
                      </InlineGrid>

                      <Text variant="headingMd">Spacing</Text>
                      <InlineGrid columns={2} gap="400">
                        <TextField
                          label="Outside top/bottom"
                          suffix="px"
                          value={formData.paddingTopBottom}
                          onChange={(v) => handleUpdate("paddingTopBottom", v)}
                          type="number"
                        />
                        <TextField
                          label="Inside top/bottom"
                          suffix="px"
                          value={formData.paddingInside}
                          onChange={(v) => handleUpdate("paddingInside", v)}
                          type="number"
                        />
                      </InlineGrid>

                      <Divider />
                      <Text variant="headingMd">Typography</Text>

                      <Select
                        label="Font"
                        options={[
                          { label: "Use your theme fonts", value: "theme" },
                          { label: "Inter", value: "Inter" },
                          { label: "Roboto", value: "Roboto" },
                          { label: "Monospace", value: "monospace" },
                          { label: "Cursive", value: "cursive" },
                        ]}
                        value={formData.fontFamily}
                        onChange={(v) => handleUpdate("fontFamily", v)}
                      />

                      <InlineGrid columns={2} gap="400">
                        <TextField
                          label="Title size"
                          suffix="px"
                          value={formData.titleSize}
                          onChange={(v) => handleUpdate("titleSize", v)}
                          type="number"
                        />
                        <InlineStack gap="200">
                          <div
                            style={{
                              width: 35,
                              height: 35,
                              backgroundColor: formData.titleColor,
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                            }}
                          />
                          <TextField
                            label="Title color"
                            labelHidden
                            value={formData.titleColor}
                            onChange={(v) => handleUpdate("titleColor", v)}
                            autoComplete="off"
                          />
                        </InlineStack>
                      </InlineGrid>
                    </BlockStack>
                  )}

                  {/* 3. PLACEMENT TAB */}

                  {selectedTab === 2 && (
                    <BlockStack gap="400">
                      <Text variant="headingMd">Select Products</Text>

                      <RadioButton
                        label="All products"
                        checked={formData.productTarget === "all"}
                        onChange={() => handleUpdate("productTarget", "all")}
                      />

                      <RadioButton
                        label="Specific products"
                        checked={formData.productTarget === "specific"}
                        onChange={() =>
                          handleUpdate("productTarget", "specific")
                        }
                      />

                      <Divider />

                      <Text variant="headingMd">Geolocation targeting</Text>

                      <RadioButton
                        label="All world"
                        checked={formData.geoTarget === "all"}
                        onChange={() => handleUpdate("geoTarget", "all")}
                      />
                    </BlockStack>
                  )}
                </BlockStack>
              </Box>
            </Card>
          </Layout.Section>

          {/* RIGHT PANEL: LIVE PREVIEW */}

          <Layout.Section variant="oneHalf">
            {!isBar && (
              <div style={{ position: "sticky", top: "20px" }}>
                <BlockStack gap="400">
                  <div style={previewStyles}>
                    <BlockStack gap="300">
                      <div style={titleTextStyle}>{formData.title}</div>

                      {/* Timer wrap - applying same logic for consistency */}
                      <div style={{ ...timerTextStyle, lineHeight: "1" }}>
                        <Text variant="heading3xl" as="span" fontSize="inherit">
                          {timeLeft.days} : {timeLeft.hrs} : {timeLeft.mins} :{" "}
                          {timeLeft.secs}
                        </Text>
                      </div>

                      <InlineStack gap="400" align="center">
                        <Text variant="bodyXs" tone="subdued">
                          {formData.timerLabels.days}
                        </Text>

                        <Text variant="bodyXs" tone="subdued">
                          {formData.timerLabels.hrs}
                        </Text>

                        <Text variant="bodyXs" tone="subdued">
                          {formData.timerLabels.mins}
                        </Text>

                        <Text variant="bodyXs" tone="subdued">
                          {formData.timerLabels.secs}
                        </Text>
                      </InlineStack>

                      <Box paddingTop="200">
                        <Button variant="primary" tone="critical">
                          {formData.buttonText}
                        </Button>
                      </Box>
                    </BlockStack>
                  </div>

                  {/* Static Upsell Banner */}

                  <Card background="bg-surface-secondary">
                    <BlockStack gap="200">
                      <InlineStack align="space-between">
                        <Text variant="headingSm">
                          Combine with Free Shipping Bar
                        </Text>

                        <Icon source={XIcon} tone="subdued" />
                      </InlineStack>

                      <Text variant="bodySm">Build urgency and boost AOV.</Text>

                      <Button size="slim">Install now</Button>
                    </BlockStack>
                  </Card>
                </BlockStack>
              </div>
            )}
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
