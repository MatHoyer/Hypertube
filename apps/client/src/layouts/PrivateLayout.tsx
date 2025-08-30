export const PrivateLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="size-full">
      {/* <LanguageSwitcher /> */}
      {children}
      {/* <SignOutButton /> */}
    </div>
  );
};
