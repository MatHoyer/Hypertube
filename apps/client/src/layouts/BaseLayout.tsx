import { Navbar } from "@/components/Navbar";
import { ScrollArea } from "@/components/ui/scroll-area";

export const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-dvh w-dvw bg-background overflow-hidden">
      <header className="h-[65px] w-full">
        <Navbar />
      </header>
      <ScrollArea className="h-[calc(100dvh-65px)] w-full">
        <div className="p-4">
          <main className="min-h-[calc(100dvh-65px)]">{children}</main>
          <footer className="text-center">footer</footer>
        </div>
      </ScrollArea>
    </div>
  );
};
