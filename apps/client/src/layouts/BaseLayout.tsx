import { Navbar } from "@/components/Navbar";
import { ScrollArea } from "@radix-ui/react-scroll-area";

export const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-dvh">
      <header className="h-[65px]">
        <Navbar />
      </header>
      <ScrollArea>
        <main className="min-h-[calc(100dvh-65px)]">{children}</main>
      </ScrollArea>
      <footer className="text-center">footer</footer>
    </div>
  );
};
