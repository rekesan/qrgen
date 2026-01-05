import { useState, useRef } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import {
  Download,
  Settings,
  Image as ImageIcon,
  Type,
  Palette,
  Trash2,
  Maximize,
  AlertCircle,
} from "lucide-react";

type TQRCode = React.ComponentProps<typeof QRCodeSVG>;

export default function App() {
  // --- State Management ---
  const [value, setValue] = useState("https://example.com");
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState("#1077D6");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [level, setLevel] = useState<TQRCode["level"]>("H");
  const [marginSize, setMarginSize] = useState(0);

  // Logo State
  const [logoSrc, setLogoSrc] = useState<string | ArrayBuffer | null>("");
  const [logoSize, setLogoSize] = useState(40);
  const [logoExcavate, setLogoExcavate] = useState(true);

  const qrRef = useRef(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // --- Handlers ---

  // Handle Logo Upload and convert to Base64 to avoid CORS issues during download
  const handleLogoUpload: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadSVG = () => {
    if (!qrRef.current) return;

    const svgData = new XMLSerializer().serializeToString(qrRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "qrcode.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadImage = (format: string) => {
    if (!qrCanvasRef.current) return;

    let canvas = qrCanvasRef.current;
    if (format === "jpeg") {
      const newCanvas = document.createElement("canvas");
      const ctx = newCanvas.getContext("2d");
      newCanvas.width = size;
      newCanvas.height = size;

      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(canvas, 0, 0);
        canvas = newCanvas;
      }
    }

    const mimeType = `image/${format}`;
    const dataUrl = canvas.toDataURL(mimeType);

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `qrcode.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* --- Header --- */}
        <div className="col-span-1 md:col-span-12 mb-4">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            QRCode Generator
          </h1>
          <p className="text-slate-500">
            Create customized QR codes with logos, colors, and high-quality
            export options.
          </p>
        </div>

        {/* --- Left Column: Controls --- */}
        <div className="col-span-1 md:col-span-4 space-y-6">
          {/* Content Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4 text-indigo-600">
              <Type size={20} />
              <h2 className="font-semibold text-lg">Content</h2>
            </div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              URL or Text
            </label>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none h-24 text-slate-700"
              placeholder="https://yourwebsite.com"
            />
          </div>

          {/* Appearance Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4 text-pink-600">
              <Palette size={20} />
              <h2 className="font-semibold text-lg">Appearance</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Foreground
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-10 w-10 rounded cursor-pointer border-0 p-0 overflow-hidden shadow-sm"
                  />
                  <span className="text-sm font-mono text-slate-600">
                    {fgColor}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-10 w-10 rounded cursor-pointer border-0 p-0 overflow-hidden shadow-sm"
                  />
                  <span className="text-sm font-mono text-slate-600">
                    {bgColor}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium text-slate-700">
                    Size (px)
                  </label>
                  <span className="text-xs text-slate-500">{size}px</span>
                </div>
                <input
                  type="range"
                  min={128}
                  max={1024}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium text-slate-700">
                    Margin
                  </label>
                  <span className="text-xs text-slate-500">{marginSize}px</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={marginSize}
                    onChange={(e) => setMarginSize(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Logo Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <ImageIcon size={20} />
                <h2 className="font-semibold text-lg">Logo Overlay</h2>
              </div>
              {logoSrc && (
                <button
                  onClick={() => setLogoSrc("")}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 size={12} /> Remove
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              {logoSrc && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium text-slate-700">
                        Logo Size
                      </label>
                      <span className="text-xs text-slate-500">
                        {logoSize}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={size / 3}
                      value={logoSize}
                      onChange={(e) => setLogoSize(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="excavate"
                      type="checkbox"
                      checked={logoExcavate}
                      onChange={(e) => setLogoExcavate(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <label
                      htmlFor="excavate"
                      className="text-sm text-slate-600 select-none"
                    >
                      Remove blocks around the logo
                    </label>
                  </div>
                </div>
              )}

              <div className="flex flex-row flex-wrap space-x-4">
                <img
                  src="sparrk.png"
                  width={40}
                  height={40}
                  alt="Sparrk logo"
                  className="shadow-sm cursor-pointer hover:opacity-90"
                  onClick={(e) => {
                    setLogoSrc(e.currentTarget.src);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Settings Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4 text-slate-600">
              <Settings size={20} />
              <h2 className="font-semibold text-lg">Settings</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Error Correction Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["L", "M", "Q", "H"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLevel(lvl)}
                    className={`py-2 text-sm font-medium rounded-md border transition-colors ${
                      level === lvl
                        ? "bg-slate-800 text-white border-slate-800"
                        : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Higher levels allow for more damage/logos but result in a denser
                code. Use 'H' for logos.
              </p>
            </div>
          </div>
        </div>

        {/* --- Right Column: Preview --- */}
        <div className="col-span-1 md:col-span-8 flex flex-col">
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Pattern */}
            <div
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(#cbd5e1 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            ></div>

            <div className="relative z-10 bg-white p-4 shadow-2xl rounded-lg border border-slate-100">
              <QRCodeSVG
                ref={qrRef}
                value={value}
                size={size}
                fgColor={fgColor}
                bgColor={bgColor}
                level={level}
                marginSize={marginSize}
                imageSettings={
                  logoSrc && typeof logoSrc === "string"
                    ? {
                        src: logoSrc,
                        height: logoSize,
                        width: logoSize,
                        excavate: logoExcavate,
                      }
                    : undefined
                }
              />
              {/* Hidden QRCodeCanvas for download functionality */}
              <div
                style={{
                  position: "absolute",
                  left: "-9999px",
                  top: "-9999px",
                }}
              >
                <QRCodeCanvas
                  ref={qrCanvasRef}
                  value={value}
                  size={size}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level={level}
                  marginSize={marginSize}
                  imageSettings={
                    logoSrc && typeof logoSrc === "string"
                      ? {
                          src: logoSrc,
                          height: logoSize,
                          width: logoSize,
                          excavate: logoExcavate,
                        }
                      : undefined
                  }
                />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg z-10">
              <button
                onClick={() => downloadImage("png")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 font-medium"
              >
                <Download size={18} /> PNG
              </button>
              <button
                onClick={() => downloadImage("jpeg")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium shadow-sm"
              >
                <Download size={18} /> JPEG
              </button>
              <button
                onClick={downloadSVG}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium shadow-sm"
              >
                <Maximize size={18} /> SVG
              </button>
            </div>

            <div className="mt-6 flex items-start gap-2 text-slate-400 max-w-md mx-auto">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p className="text-xs text-center">
                For best results with logos, choose 'H' (High) error correction.
                Ensure your foreground and background colors have high contrast.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
