import { Layout, LayoutContent } from "@/layouts/PageLayout";

export const HomePage = () => {
  return (
    <Layout size="lg">
      <LayoutContent>
        <h1 className="text-2xl">Dashboard</h1>
        <div>
          <p>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quaerat
            quos dignissimos doloremque enim necessitatibus accusamus dolorum
            aperiam, at tempora vel?
          </p>
        </div>
        <div>
          <p>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quaerat
            quos dignissimos doloremque enim necessitatibus accusamus dolorum
            aperiam, at tempora vel?
          </p>
        </div>
      </LayoutContent>
    </Layout>
  );
};
