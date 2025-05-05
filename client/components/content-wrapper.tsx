interface ContentWrapperProps {
  children: React.ReactNode;
}

const ContentWrapper = ({ children }: ContentWrapperProps) => {
  return (
    <div className="flex justify-center">
      <div className="flex w-full max-w-screen-xl px-4">{children}</div>
    </div>
  );
};

export default ContentWrapper;
