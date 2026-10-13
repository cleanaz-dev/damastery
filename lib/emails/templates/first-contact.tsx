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
  Section,
  Hr,
} from "react-email";

type FirstContactEmailProps = {
  name: string;
  url: string;
};

export function FirstContactEmail({ name, url }: FirstContactEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Next steps with Damastery</Preview>
      <Tailwind>
        <Body className="bg-zinc-50 font-sans text-zinc-900">
          <Container className="mx-auto my-[40px] max-w-[480px] rounded-xl border border-zinc-200 bg-white p-[32px] shadow-sm">
            
            {/* Logo Section */}
            <Section className="mb-[32px]">
              <Text className="m-0 text-xl font-bold tracking-tight text-zinc-950">
                Damastery
              </Text>
            </Section>

            {/* Header */}
            <Heading className="m-0 mb-[16px] p-0 text-[24px] font-semibold tracking-tight text-zinc-950">
              Let's get started
            </Heading>

            {/* Body Text */}
            <Text className="text-[15px] leading-[24px] text-zinc-600">
              Hi {name.split(" ")[0]}, thanks for reaching out! We're thrilled to connect with you. 
            </Text>

            <Text className="mt-[16px] text-[15px] leading-[24px] text-zinc-600">
              To take the next step and officially create your account, please click the secure link below.
            </Text>

            {/* Call to Action */}
            <Section className="my-[32px]">
              <Button
                href={url}
                className="rounded-md bg-zinc-950 px-6 py-3 text-center text-[14px] font-medium text-white no-underline transition-colors hover:bg-zinc-800"
              >
                Complete your setup
              </Button>
            </Section>

            <Text className="text-[15px] leading-[24px] text-zinc-600">
              If you didn't request this link, you can safely ignore this email.
            </Text>

            {/* Footer Divider */}
            <Hr className="mx-0 my-[24px] w-full border border-zinc-200" />

            {/* Footer Text */}
            <Text className="text-[13px] leading-[24px] text-zinc-500">
              © 2026 Damastery. All rights reserved. <br />
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}