"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Check,
  Radio,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/lib/locale-context";
import { useAuth } from "@/lib/auth-context";
import {
  listAllDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  type StreamDestination,
  type StreamPlatform,
  type StreamQuality,
} from "@/lib/api/streaming";

type PlatformPreset = StreamPlatform | "youtube";

interface PlatformPresetConfig {
  label: string;
  rtmpUrl: string;
  platform: StreamPlatform;
}

const PLATFORM_PRESETS: Record<PlatformPreset, PlatformPresetConfig> = {
  youtube: { label: "destinations.presets.youtube", rtmpUrl: "rtmp://a.rtmp.youtube.com/live2", platform: "custom" },
  taobao: { label: "destinations.presets.taobao", rtmpUrl: "rtmp://live.push.taobao.com/app/", platform: "taobao" },
  douyin: { label: "destinations.presets.douyin", rtmpUrl: "rtmp://push.live.douyin.com/live", platform: "douyin" },
  xiaohongshu: { label: "destinations.presets.xiaohongshu", rtmpUrl: "rtmp://push.live.xiaohongshu.com/live", platform: "xiaohongshu" },
  custom: { label: "destinations.presets.custom", rtmpUrl: "", platform: "custom" },
};

const QUALITY_OPTIONS: StreamQuality[] = ["low", "medium", "high", "ultra"];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
  streaming: "bg-blue-100 text-blue-700",
  error: "bg-red-100 text-red-700",
  disabled: "bg-gray-100 text-gray-400",
};

function getDestinationId(dest: StreamDestination): string {
  return dest._id || dest.id || "";
}

export function DestinationPanel() {
  const { t } = useLocale();
  const { user } = useAuth();
  const sellerId = user?.id || "";

  const [destinations, setDestinations] = useState<StreamDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<StreamDestination | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  // Form state
  const [formPreset, setFormPreset] = useState<PlatformPreset>("youtube");
  const [formName, setFormName] = useState("");
  const [formRtmpUrl, setFormRtmpUrl] = useState(PLATFORM_PRESETS.youtube.rtmpUrl);
  const [formStreamKey, setFormStreamKey] = useState("");
  const [formQuality, setFormQuality] = useState<StreamQuality>("high");

  const fetchDestinations = useCallback(async () => {
    if (!sellerId) return;
    setLoading(true);
    try {
      const res = await listAllDestinations(sellerId);
      setDestinations(res.destinations || []);
    } catch {
      toast.error(t("errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [sellerId, t]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  const resetForm = () => {
    setFormPreset("youtube");
    setFormName("");
    setFormRtmpUrl(PLATFORM_PRESETS.youtube.rtmpUrl);
    setFormStreamKey("");
    setFormQuality("high");
    setEditingDest(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (dest: StreamDestination) => {
    setEditingDest(dest);
    const matchedPreset = (Object.entries(PLATFORM_PRESETS) as [PlatformPreset, PlatformPresetConfig][]).find(
      ([, cfg]) => dest.rtmp_url === cfg.rtmpUrl && cfg.rtmpUrl !== ""
    );
    setFormPreset(matchedPreset ? matchedPreset[0] : "custom");
    setFormName(dest.destination_name);
    setFormRtmpUrl(dest.rtmp_url);
    setFormStreamKey(dest.stream_key);
    setFormQuality(dest.quality || "high");
    setDialogOpen(true);
  };

  const handlePresetChange = (preset: PlatformPreset) => {
    setFormPreset(preset);
    setFormRtmpUrl(PLATFORM_PRESETS[preset].rtmpUrl);
  };

  const handleSubmit = async () => {
    if (!formName.trim() || !formRtmpUrl.trim() || !formStreamKey.trim()) {
      toast.error(t("errors.validation"));
      return;
    }
    setSubmitting(true);
    try {
      if (editingDest) {
        await updateDestination(getDestinationId(editingDest), {
          destination_name: formName,
          rtmp_url: formRtmpUrl,
          stream_key: formStreamKey,
          quality: formQuality,
        });
        toast.success(t("destinations.updateSuccess"));
      } else {
        await createDestination(sellerId, {
          platform: PLATFORM_PRESETS[formPreset].platform,
          destination_name: formName,
          rtmp_url: formRtmpUrl,
          stream_key: formStreamKey,
          quality: formQuality,
        });
        toast.success(t("destinations.createSuccess"));
      }
      setDialogOpen(false);
      resetForm();
      await fetchDestinations();
    } catch {
      toast.error(t("errors.saveFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (dest: StreamDestination) => {
    if (!confirm(t("destinations.deleteConfirm"))) return;
    try {
      await deleteDestination(getDestinationId(dest));
      toast.success(t("destinations.deleteSuccess"));
      await fetchDestinations();
    } catch {
      toast.error(t("errors.deleteFailed"));
    }
  };

  const handleToggle = async (dest: StreamDestination, enabled: boolean) => {
    try {
      await updateDestination(getDestinationId(dest), { is_enabled: enabled });
      setDestinations((prev) =>
        prev.map((d) =>
          getDestinationId(d) === getDestinationId(dest) ? { ...d, is_enabled: enabled } : d
        )
      );
    } catch {
      toast.error(t("errors.saveFailed"));
    }
  };

  const toggleKeyReveal = (id: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("destinations.copied"));
  };

  const maskKey = (key: string) => {
    if (!key || key.length <= 4) return key;
    return "***" + key.slice(-4);
  };

  const fullIngestPath = `${formRtmpUrl}${formRtmpUrl.endsWith("/") ? "" : "/"}${formStreamKey}`;

  return (
    <>
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">{t("destinations.title")}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={openAddDialog}
          className="h-7 px-2 text-xs flex items-center gap-1 border-slate-200 hover:bg-slate-50"
        >
          <Plus className="w-3 h-3" />
          {t("common.add")}
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        </div>
      )}

      {/* Empty State */}
      {!loading && destinations.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <Radio className="w-8 h-8 text-slate-300" />
          <p className="text-xs text-slate-500 leading-4 px-2">{t("destinations.empty")}</p>
        </div>
      )}

      {/* Destination List */}
      {!loading && destinations.length > 0 && (
        <div className="flex flex-col gap-2">
          {destinations.map((dest) => {
            const destId = getDestinationId(dest);
            const keyRevealed = revealedKeys.has(destId);
            const displayKey = keyRevealed ? dest.stream_key : maskKey(dest.stream_key);
            const presetMatch = (Object.entries(PLATFORM_PRESETS) as [PlatformPreset, PlatformPresetConfig][]).find(
              ([, cfg]) => cfg.platform === dest.platform && cfg.rtmpUrl === dest.rtmp_url && cfg.rtmpUrl !== ""
            );
            const platformLabel = presetMatch
              ? t(presetMatch[1].label)
              : dest.platform === "custom"
              ? t("destinations.presets.custom")
              : dest.platform;

            return (
              <div
                key={destId}
                className={`border rounded-lg p-2.5 transition-colors ${
                  dest.is_enabled
                    ? "border-slate-200 bg-white"
                    : "border-slate-100 bg-slate-50 opacity-60"
                }`}
              >
                {/* Row 1: Name + toggle */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="font-medium text-xs text-foreground truncate flex-1">
                    {dest.destination_name}
                  </span>
                  <Switch
                    checked={dest.is_enabled}
                    onCheckedChange={(checked) => handleToggle(dest, checked)}
                    className="scale-75"
                  />
                </div>

                {/* Row 2: Platform + status badges */}
                <div className="flex items-center gap-1 flex-wrap mb-1.5">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                    {platformLabel}
                  </Badge>
                  <Badge className={`text-[10px] px-1.5 py-0 h-4 ${STATUS_COLORS[dest.status] || STATUS_COLORS.inactive}`}>
                    {t(`destinations.status.${dest.status}`)}
                  </Badge>
                </div>

                {/* Row 3: Stream key (masked) */}
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-1.5">
                  <span className="font-mono truncate">{displayKey}</span>
                  <button onClick={() => toggleKeyReveal(destId)} className="hover:text-foreground shrink-0">
                    {keyRevealed ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                  </button>
                  <button onClick={() => copyToClipboard(dest.rtmp_url)} className="hover:text-foreground shrink-0 ml-auto">
                    <Copy className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Row 4: Edit/Delete */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditDialog(dest)}
                    className="text-[10px] text-slate-500 hover:text-foreground flex items-center gap-0.5"
                  >
                    <Pencil className="w-2.5 h-2.5" />
                    {t("common.edit")}
                  </button>
                  <button
                    onClick={() => handleDelete(dest)}
                    className="text-[10px] text-red-400 hover:text-red-600 flex items-center gap-0.5 ml-auto"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    {t("common.delete")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { resetForm(); } setDialogOpen(open); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingDest ? t("destinations.editTitle") : t("destinations.addNew")}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-2">
            {/* Platform Preset Selector */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {t("destinations.form.platform")}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(PLATFORM_PRESETS) as PlatformPreset[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => handlePresetChange(key)}
                    className={`h-7 px-2.5 rounded-md text-xs font-medium transition-colors ${
                      formPreset === key
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {t(PLATFORM_PRESETS[key].label)}
                  </button>
                ))}
              </div>
            </div>

            {/* Destination Name */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {t("destinations.form.name")}
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={t("destinations.form.namePlaceholder")}
                className="text-sm"
              />
            </div>

            {/* RTMP URL */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {t("destinations.form.rtmpUrl")}
              </label>
              <Input
                value={formRtmpUrl}
                onChange={(e) => setFormRtmpUrl(e.target.value)}
                className="text-sm font-mono"
              />
            </div>

            {/* Stream Key */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {t("destinations.form.streamKey")}
              </label>
              <Input
                value={formStreamKey}
                onChange={(e) => setFormStreamKey(e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Quality */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {t("destinations.form.quality")}
              </label>
              <Select value={formQuality} onValueChange={(v) => setFormQuality(v as StreamQuality)}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUALITY_OPTIONS.map((q) => (
                    <SelectItem key={q} value={q}>
                      {t(`destinations.quality.${q}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Full Ingest Path Preview */}
            {formStreamKey && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  {t("destinations.form.fullPath")}
                </label>
                <div className="flex gap-2">
                  <Input
                    value={fullIngestPath}
                    readOnly
                    className="text-xs font-mono bg-slate-50 flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(fullIngestPath)}
                    className="h-9 w-9 shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 h-9 text-sm font-medium bg-gradient-to-b from-[#1999ee] via-[#115bca] to-[#0b3aa8] border border-[#5081ff] text-white hover:opacity-90"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                {editingDest ? t("common.save") : t("common.submit")}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setDialogOpen(false); resetForm(); }}
                className="h-9 text-sm"
              >
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
