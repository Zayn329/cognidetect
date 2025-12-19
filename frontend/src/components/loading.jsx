import { Loader } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Loader className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-medium text-muted-foreground">Initializing CogniDetect...</p>
      </div>
    </div>
  );
}