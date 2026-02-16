import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { useSettings } from '../../../../state/settings';
import { useTheme } from 'next-themes';

export default function AppearancePage() {
  const { textScale, setTextScale } = useSettings();
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-2xl space-y-8">
      <div className="space-y-4">
        <Label>Theme</Label>
        <RadioGroup value={theme} onValueChange={setTheme}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dark" id="dark" />
            <Label htmlFor="dark" className="font-normal cursor-pointer">
              Dark
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="light" id="light" />
            <Label htmlFor="light" className="font-normal cursor-pointer">
              Light
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="system" id="system" />
            <Label htmlFor="system" className="font-normal cursor-pointer">
              System
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <Label>Text Scale</Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[textScale]}
            onValueChange={([value]) => setTextScale(value)}
            min={0.8}
            max={1.2}
            step={0.1}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground w-12 text-right">
            {Math.round(textScale * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
