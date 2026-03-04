'use client';

import { useState, useEffect } from 'react';
import { Room } from 'livekit-client';
import { useLivestreamStore } from '@/lib/stores/livestreamStore';
import { toggleDetection } from '@/lib/api/detection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Scan,
  Eye,
  EyeOff,
  Settings,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface DetectionControlsProps {
  room: Room;
  className?: string;
}

/**
 * Host controls for object detection settings
 */
export function DetectionControls({ room, className }: DetectionControlsProps) {
  const {
    detectionSettings,
    isDetectionActive,
    toggleDetection: toggleDetectionLocal,
    setDetectionVisibleToViewers,
    updateDetectionSettings,
    setDetectionActive,
  } = useLivestreamStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPrompt, setNewPrompt] = useState('');

  const roomName = room?.name || '';

  // Preset prompts for quick selection
  const presetPrompts = [
    'a bottle',
    'a mouse',
    'a headset',
    'a keyboard',
    'a phone',
    'a laptop',
    'a camera',
    'a book',
    'a cup',
    'a pen',
  ];

  /**
   * Add a new prompt to the detection list
   */
  const handleAddPrompt = () => {
    if (!newPrompt.trim()) return;

    const prompt = newPrompt.trim().toLowerCase();
    // Ensure prompt starts with "a " or "an " for consistency
    const formattedPrompt = prompt.startsWith('a ') || prompt.startsWith('an ')
      ? prompt
      : `a ${prompt}`;

    // Check if prompt already exists
    if (detectionSettings.textPrompts.includes(formattedPrompt)) {
      setNewPrompt('');
      return;
    }

    updateDetectionSettings({
      textPrompts: [...detectionSettings.textPrompts, formattedPrompt],
    });
    setNewPrompt('');
  };

  /**
   * Remove a prompt from the detection list
   */
  const handleRemovePrompt = (promptToRemove: string) => {
    updateDetectionSettings({
      textPrompts: detectionSettings.textPrompts.filter((p) => p !== promptToRemove),
    });
  };

  /**
   * Add a preset prompt
   */
  const handleAddPreset = (preset: string) => {
    if (detectionSettings.textPrompts.includes(preset)) return;

    updateDetectionSettings({
      textPrompts: [...detectionSettings.textPrompts, preset],
    });
  };

  /**
   * Toggle detection on the backend and broadcast to viewers
   */
  const handleToggleDetection = async () => {
    if (!roomName) return;

    setIsUpdating(true);
    setError(null);

    try {
      // Update backend
      const response = await toggleDetection({
        room_name: roomName,
        enabled: !detectionSettings.enabled,
        visible_to_viewers: detectionSettings.visibleToViewers,
      });

      // Update local state
      toggleDetectionLocal();

      // Broadcast to viewers via LiveKit data channel
      await broadcastDetectionState(!detectionSettings.enabled);

      console.log('Detection toggled:', response.message);
    } catch (err) {
      console.error('Failed to toggle detection:', err);
      setError('Failed to toggle detection. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Toggle viewer visibility
   */
  const handleToggleViewerVisibility = async () => {
    if (!roomName) return;

    const newVisibility = !detectionSettings.visibleToViewers;

    try {
      // Update backend
      await toggleDetection({
        room_name: roomName,
        enabled: detectionSettings.enabled,
        visible_to_viewers: newVisibility,
      });

      // Update local state
      setDetectionVisibleToViewers(newVisibility);

      // Broadcast to viewers
      await broadcastDetectionState(detectionSettings.enabled, newVisibility);
    } catch (err) {
      console.error('Failed to update viewer visibility:', err);
    }
  };

  /**
   * Broadcast detection state to viewers via LiveKit data channel
   */
  const broadcastDetectionState = async (enabled: boolean, visibleToViewers?: boolean) => {
    if (!room) return;

    try {
      const stateData = {
        type: 'detection_state',
        enabled,
        visibleToViewers: visibleToViewers ?? detectionSettings.visibleToViewers,
        timestamp: Date.now(),
      };

      await room.localParticipant.sendText(JSON.stringify(stateData), {
        topic: 'detection',
      });
    } catch (error) {
      console.error('Failed to broadcast detection state:', error);
    }
  };

  return (
    <Card className={cn('bg-black/50 backdrop-blur-sm border-white/10', className)}>
      <div className="p-3">
        {/* Header with toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Object Detection</h3>
            {isDetectionActive && (
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                Active
              </Badge>
            )}
          </div>

          <Button
            size="sm"
            variant={detectionSettings.enabled ? 'default' : 'outline'}
            onClick={handleToggleDetection}
            disabled={isUpdating}
            className="min-w-[80px]"
          >
            {detectionSettings.enabled ? 'On' : 'Off'}
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-3 p-2 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Quick toggle for viewer visibility */}
        <div className="flex items-center justify-between py-2 border-t border-white/10">
          <Label htmlFor="viewer-visibility" className="text-sm text-white/80 flex items-center gap-2">
            {detectionSettings.visibleToViewers ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
            Visible to viewers
          </Label>
          <Switch
            id="viewer-visibility"
            checked={detectionSettings.visibleToViewers}
            onCheckedChange={handleToggleViewerVisibility}
            disabled={!detectionSettings.enabled}
          />
        </div>

        {/* Advanced settings toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-2 text-white/60 hover:text-white"
        >
          <Settings className="w-4 h-4 mr-2" />
          Advanced Settings
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 ml-auto" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-auto" />
          )}
        </Button>

        {/* Advanced settings panel */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-4">
            {/* Detection info */}
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded">
              <p className="text-xs text-blue-300">
                Using Grounding DINO for zero-shot object detection
              </p>
            </div>

            {/* Detection Prompts Configuration */}
            <div className="space-y-2">
              <Label className="text-sm text-white/80">Detection Prompts</Label>

              {/* Current prompts display */}
              <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                {detectionSettings.textPrompts.map((prompt) => (
                  <Badge
                    key={prompt}
                    variant="secondary"
                    className="bg-white/10 text-white hover:bg-white/20 pr-1 text-xs"
                  >
                    {prompt}
                    <button
                      onClick={() => handleRemovePrompt(prompt)}
                      className="ml-1.5 hover:bg-white/20 rounded-full p-0.5"
                      disabled={detectionSettings.textPrompts.length === 1}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              {/* Add new prompt input */}
              <div className="flex gap-2">
                <Input
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPrompt();
                    }
                  }}
                  placeholder="Enter object to detect..."
                  className="flex-1 h-8 bg-white/5 border-white/10 text-white placeholder:text-white/40 text-xs"
                />
                <Button
                  size="sm"
                  onClick={handleAddPrompt}
                  disabled={!newPrompt.trim()}
                  className="h-8 px-3"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Preset prompts */}
              <div className="space-y-1.5">
                <p className="text-xs text-white/50">Quick add:</p>
                <div className="flex flex-wrap gap-1.5">
                  {presetPrompts
                    .filter((preset) => !detectionSettings.textPrompts.includes(preset))
                    .slice(0, 8)
                    .map((preset) => (
                      <Button
                        key={preset}
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddPreset(preset)}
                        className="h-6 px-2 text-xs bg-white/5 border-white/20 hover:bg-white/10 text-white/70 hover:text-white"
                      >
                        + {preset}
                      </Button>
                    ))}
                </div>
              </div>

              <p className="text-xs text-white/40">
                Add objects you want to detect. Changes apply instantly to live detection.
              </p>
            </div>

            {/* Show labels */}
            <div className="flex items-center justify-between">
              <Label htmlFor="show-labels" className="text-sm text-white/80">
                Show labels
              </Label>
              <Switch
                id="show-labels"
                checked={detectionSettings.showLabels}
                onCheckedChange={(checked) =>
                  updateDetectionSettings({ showLabels: checked })
                }
              />
            </div>

            {/* Show confidence */}
            <div className="flex items-center justify-between">
              <Label htmlFor="show-confidence" className="text-sm text-white/80">
                Show confidence
              </Label>
              <Switch
                id="show-confidence"
                checked={detectionSettings.showConfidence}
                onCheckedChange={(checked) =>
                  updateDetectionSettings({ showConfidence: checked })
                }
              />
            </div>

            {/* Confidence threshold */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-white/80">Box confidence threshold</Label>
                <span className="text-xs text-white/60">
                  {(detectionSettings.confidenceThreshold * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                value={[detectionSettings.confidenceThreshold * 100]}
                onValueChange={([value]) =>
                  updateDetectionSettings({ confidenceThreshold: value / 100 })
                }
                min={10}
                max={90}
                step={5}
                className="w-full"
              />
            </div>

            {/* Text threshold */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-white/80">Text matching threshold</Label>
                <span className="text-xs text-white/60">
                  {(detectionSettings.textThreshold * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                value={[detectionSettings.textThreshold * 100]}
                onValueChange={([value]) =>
                  updateDetectionSettings({ textThreshold: value / 100 })
                }
                min={10}
                max={90}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-white/40">
                Controls how closely detected objects must match text prompts
              </p>
            </div>

            {/* FPS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-white/80">Detection speed</Label>
                <span className="text-xs text-white/60">
                  {detectionSettings.fps} FPS
                </span>
              </div>
              <Slider
                value={[detectionSettings.fps]}
                onValueChange={([value]) =>
                  updateDetectionSettings({ fps: value })
                }
                min={1}
                max={3}
                step={0.5}
                className="w-full"
              />
              <p className="text-xs text-white/40">
                Higher FPS = more detections but higher API usage
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
