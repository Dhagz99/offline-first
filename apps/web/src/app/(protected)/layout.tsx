import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-dvh overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Application */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Fixed Header */}
        <Header />

        {/* Scrollable Page Content */}
        <main
          id="main-content"
          className="
            min-h-0 min-w-0 flex-1
            overflow-x-hidden overflow-y-auto
            bg-[#F8FAFC]
          "
        >
          <div className="mx-auto w-full max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}