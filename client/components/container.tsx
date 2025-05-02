interface ContainerProps {
  children: React.ReactNode;
  muted?: boolean;
}

const Container = ({ children, muted = true }: ContainerProps) => {
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

export default Container;
