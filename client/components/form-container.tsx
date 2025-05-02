import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Container from "./container";

interface FormContainerProps {
  children: React.ReactNode;
  title: string;
  description: string;
  imageAlt: string;
  imagePath: string;
}

const FormContainer = ({
  children,
  title,
  description,
  imageAlt,
  imagePath,
}: FormContainerProps) => {
  return (
    <Container muted={true}>
      <div className="grid w-full max-w-[1200px] px-10 md:min-h-[500px] md:grid-cols-2">
        <Card className="justify-center gap-10 md:rounded-none md:rounded-l-2xl">
          <CardHeader className="flex flex-col items-center gap-2">
            <CardTitle className="text-center text-4xl">{title}</CardTitle>
            <CardDescription className="text-center text-lg">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>

        <div className="hidden overflow-hidden md:relative md:block md:rounded-r-2xl">
          <Image
            alt={imageAlt}
            src={imagePath}
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>
    </Container>
  );
};

export default FormContainer;
