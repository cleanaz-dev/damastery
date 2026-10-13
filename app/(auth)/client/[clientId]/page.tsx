interface Params {
  params: Promise<{
    clientId: string;
  }>;
}

export default async function ClientPage({ params }: Params) {
  const { clientId } = await params;
  return (
    <main>
      <h1>Client ID: {clientId}</h1>
    </main>
  );
}
