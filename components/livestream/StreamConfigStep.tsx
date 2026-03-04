'use client';

/**
 * StreamConfigStep Component
 * Step 2 of the PreLive wizard - Configure stream settings
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Bot, Users, Scan, Sparkles, Video } from 'lucide-react';
import { StreamConfig } from './PreLiveWizard';

interface StreamConfigStepProps {
  config: StreamConfig;
  onConfigChange: (config: Partial<StreamConfig>) => void;
  selectedProductCount: number;
}

export function StreamConfigStep({
  config,
  onConfigChange,
  selectedProductCount,
}: StreamConfigStepProps) {
  return (
    <div className="space-y-6">
      {/* Stream Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Stream Title (Optional)</Label>
        <Input
          id="title"
          placeholder="e.g., Flash Sale - New Arrivals!"
          value={config.title}
          onChange={(e) => onConfigChange({ title: e.target.value })}
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground">
          Give your stream a catchy title to attract viewers
        </p>
      </div>

      {/* Maximum Viewers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="maxViewers">Maximum Viewers</Label>
          <Badge variant="outline">{config.maxParticipants}</Badge>
        </div>
        <Slider
          id="maxViewers"
          min={10}
          max={500}
          step={10}
          value={[config.maxParticipants]}
          onValueChange={([value]) => onConfigChange({ maxParticipants: value })}
        />
        <p className="text-xs text-muted-foreground">
          Limit the number of concurrent viewers (10 - 500)
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-4">
        {/* AI Assistant */}
        <Card className={config.enableAgent ? 'border-primary' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">AI Assistant</CardTitle>
                  <CardDescription className="text-xs">
                    Help describe products and engage viewers
                  </CardDescription>
                </div>
              </div>
              <Switch
                checked={config.enableAgent}
                onCheckedChange={(checked) => onConfigChange({ enableAgent: checked })}
              />
            </div>
          </CardHeader>
          {config.enableAgent && (
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Product descriptions
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  Viewer engagement
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <Video className="h-3 w-3 mr-1" />
                  Live translations
                </Badge>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Auto Detection */}
        <Card className={config.autoDetection ? 'border-primary' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Scan className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Auto Product Detection</CardTitle>
                  <CardDescription className="text-xs">
                    AI detects when you show selected products on camera
                  </CardDescription>
                </div>
              </div>
              <Switch
                checked={config.autoDetection}
                onCheckedChange={(checked) => onConfigChange({ autoDetection: checked })}
                disabled={selectedProductCount === 0}
              />
            </div>
          </CardHeader>
          {config.autoDetection && (
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                Detection will be configured for {selectedProductCount} selected product
                {selectedProductCount !== 1 ? 's' : ''}. Products will be automatically
                highlighted when shown on camera.
              </p>
            </CardContent>
          )}
          {selectedProductCount === 0 && (
            <CardContent className="pt-0">
              <p className="text-xs text-orange-600">
                Select products first to enable auto-detection
              </p>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Summary */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>Max {config.maxParticipants} viewers</span>
            </div>
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-muted-foreground" />
              <span>AI {config.enableAgent ? 'enabled' : 'disabled'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Scan className="h-4 w-4 text-muted-foreground" />
              <span>Detection {config.autoDetection ? 'on' : 'off'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
