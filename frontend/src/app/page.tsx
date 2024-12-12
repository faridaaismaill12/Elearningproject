import Layout from "./routes/layout";

export default function Home() {
  return (
    <div className="flex max-w-8xl mx-auto">
      <Layout>
        <h1>Welcome to the Home Page</h1>
        <p>This is some content inside the layout.</p>
      </Layout>
    </div>
  );
}

