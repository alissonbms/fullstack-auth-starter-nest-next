interface CenteredContainerProps {
  children: React.ReactNode;
  muted?: boolean;
}

const CenteredContainer = ({
  children,
  muted = true,
}: CenteredContainerProps) => {
  return (
    <div
      className={`flex h-[100vh] w-[100vw] items-center justify-center ${
        muted ? "bg-muted" : ""
      }`}
    >
      {children}
    </div>
  );
};

export default CenteredContainer;
