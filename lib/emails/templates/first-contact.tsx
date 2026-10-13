import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Tailwind,
  pixelBasedPreset,
  Section,
  Row,
  Column,
  Img,
} from "react-email";
import { LOGO_URL } from "../config";

type FirstContactEmailProps = {
  name: string;
  url: string;
};

export function FirstContactEmail({ name, url }: FirstContactEmailProps) {
  return (
    <Html lang="en">
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                primary: "#081F31",
                "primary-foreground": "#F3EEE3",
              },
            },
          },
        }}
      >
        <Head />
        <Preview>Next steps with Damastery</Preview>
        <Body className="bg-zinc-50 font-sans text-zinc-900">
          <Container className="mx-auto my-[40px] max-w-[480px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            {/* Header with logo */}
            <Section className="bg-primary px-[32px] py-[24px]">
              <Row>
                <Column align="left">
                  <Text className="m-0 text-[20px] font-bold text-primary-foreground">
                    Damastery
                  </Text>
                </Column>
                <Column align="left">
                  <Img
                    src={LOGO_URL}
                    alt="Damastery"
                    height="32"
                    style={{ display: "block", marginLeft: "auto" }}
                  />
                </Column>
              </Row>
            </Section>

            {/* Content */}
            <Section className="px-[32px] py-[32px]">
              <Heading className="m-0 mb-[16px] p-0 text-[24px] font-semibold tracking-tight text-zinc-950">
                Let's get started
              </Heading>

              <Text className="text-[15px] leading-[24px] text-zinc-600">
                Hi {name.split(" ")[0]}, thanks for reaching out! We're thrilled to connect with you.
              </Text>

              <Text className="mt-[16px] text-[15px] leading-[24px] text-zinc-600">
                To take the next step and officially create your account, please click the secure link below.
              </Text>

              <Section className="my-[32px]">
                <Button
                  href={url}
                  className="rounded-md bg-zinc-950 px-6 py-3 text-center text-[14px] font-medium text-white no-underline"
                >
                  Complete your setup
                </Button>
              </Section>

              <Text className="m-0 text-[15px] leading-[24px] text-zinc-600">
                If you didn't request this link, you can safely ignore this email.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="bg-primary px-[32px] py-[20px]">
              <Text className="m-0 text-[13px] leading-[24px] text-primary-foreground">
                © 2026 Damastery. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}