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
      className={`flex min-h-full min-w-full items-center justify-center ${
        muted ? "bg-muted" : ""
      }`}
    >
      {children}
    </div>
  );
};

export default CenteredContainer;
