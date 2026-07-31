import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ExperienceCardProps {
  title: string;
  duration: string;
  description: string;
}

export default function ExperienceCard({
  title,
  duration,
  description,
}: ExperienceCardProps) {
  return (
    <Card className="border-t-2 border-accent pt-0">
      <CardHeader>
        <CardTitle className="font-heading text-xl font-semibold">
          {title}
        </CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          {duration}
        </span>
      </CardContent>
    </Card>
  );
}
