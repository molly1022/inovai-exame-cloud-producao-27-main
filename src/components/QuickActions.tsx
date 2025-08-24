
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
}

interface QuickActionsProps {
  onNavigate: (path: string) => void;
  actions: QuickAction[];
}

const QuickActions = ({ onNavigate, actions }: QuickActionsProps) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Ações Rápidas</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action) => (
          <Card key={action.title} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardContent className="p-4">
              <Button
                onClick={() => onNavigate(action.path)}
                className="w-full h-auto flex flex-col items-center space-y-2 p-4 bg-green-500 hover:bg-green-600 text-white border-0"
                variant="default"
              >
                <action.icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
