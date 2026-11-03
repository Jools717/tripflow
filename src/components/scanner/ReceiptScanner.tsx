import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, AlertCircle, X } from 'lucide-react';
import {
  compressImage,
  loadImageToCanvas,
  recognizeReceiptText,
  parseReceiptData,
  transformCanvas,
  warpPerspective,
  enhanceDocumentContrast
} from '../../utils/imageOptimizer';
import { parseCurrencyNumber } from '../../utils/helpers';
import { Expense, MediaReceipt, PaymentMethod } from '../../types/expense';
import ScannerCameraView from './ScannerCameraView';
import ScannerPipelineProgress from './ScannerPipelineProgress';
import ScannerReviewForm from './ScannerReviewForm';
import ScannerLightbox, { CornersState } from './ScannerLightbox';
import { ScannedItem } from './ScannerItemsTable';

interface ReceiptScannerProps {
  defaultCategory?: string;
  categoryName?: string;
  exchangeRate?: number;
  onSaveExpenseWithReceipt: (expenseItem: Expense, mediaItem?: MediaReceipt) => void;
  onClose?: () => void;
}

export default function ReceiptScanner({
  defaultCategory = 'mercado',
  categoryName = 'Mercado de Alimentos',
  exchangeRate = 1280,
  onSaveExpenseWithReceipt,
  onClose
}: ReceiptScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);

  // Status: 'idle' | 'processing' | 'review'
  const [scanStatus, setScanStatus] = useState<'idle' | 'processing' | 'review'>('idle');
  const [pipelineStep, setPipelineStep] = useState(1);
  const [pipelineStatusText, setPipelineStatusText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Live Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [frameOrientation, setFrameOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoCropGuide, setAutoCropGuide] = useState(true);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Compression & OCR metrics
  const [compressionStats, setCompressionStats] = useState<{
    originalSizeKb?: number;
    compressedSizeKb: number;
    reductionPercent: number;
  } | null>(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [previewBase64, setPreviewBase64] = useState<string | null>(null);
  const [originalCanvasRef, setOriginalCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const [rawOcrText, setRawOcrText] = useState('');
  const [isUpsideDown, setIsUpsideDown] = useState(false);

  // Lightbox / Photo Inspection Modal
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxInitialPerspective, setLightboxInitialPerspective] = useState(false);
  const [isApplyingPerspective, setIsApplyingPerspective] = useState(false);

  // Extracted & Editable Fields
  const [storeName, setStoreName] = useState('');
  const [receiptDate, setReceiptDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [receiptTime, setReceiptTime] = useState('');
  const [amountARS, setAmountARS] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [receiptNote, setReceiptNote] = useState('');
  const [itemsList, setItemsList] = useState<ScannedItem[]>([]);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(d => d.kind === 'videoinput');
          setHasMultipleCameras(videoDevices.length > 1);
        })
        .catch(() => {});
    }
  }, []);

  const stopLiveCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopLiveCamera();
    };
  }, []);

  const startLiveCamera = async (mode = facingMode) => {
    try {
      setErrorMessage('');
      setRotationAngle(0);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta cámara directa. Por favor usa el botón de subir imagen.');
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      mediaStreamRef.current = stream;
      setIsCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(err => console.warn('Video play error:', err));
        }
      }, 100);
    } catch (err) {
      console.warn('No se pudo iniciar cámara directa:', err);
      setIsCameraActive(false);
      setErrorMessage('No se pudo activar la cámara directa (permiso denegado o no disponible). Puedes usar el botón de "Subir Foto / Archivo".');
    }
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startLiveCamera(nextMode);
  };

  const rotateCamera90 = () => {
    setRotationAngle(prev => (prev + 90) % 360);
  };

  const processReceiptCanvas = async (sourceCanvas: HTMLCanvasElement, skipAutoPipeline = false) => {
    setErrorMessage('');
    setScanStatus('processing');
    setOcrProgress(0);

    try {
      let finalProcessingCanvas = sourceCanvas;

      if (!skipAutoPipeline) {
        setPipelineStep(1);
        setPipelineStatusText('Optimizando encuadre y preservando cabecera...');
        await new Promise(r => setTimeout(r, 160));

        setPipelineStep(2);
        setPipelineStatusText('Nivelando iluminación y removiendo sombras...');
        await new Promise(r => setTimeout(r, 160));

        setPipelineStep(3);
        setPipelineStatusText('Aplicando realce óptico continuo de alta definición...');
        finalProcessingCanvas = enhanceDocumentContrast(sourceCanvas);
        await new Promise(r => setTimeout(r, 160));
      }

      setPipelineStep(4);
      setPipelineStatusText('Extrayendo productos, cantidades, precios y total...');

      const compressed = await compressImage(finalProcessingCanvas, 1300, 0.80);
      setCompressionStats({
        originalSizeKb: compressed.originalSizeKb,
        compressedSizeKb: compressed.compressedSizeKb,
        reductionPercent: compressed.reductionPercent
      });
      setPreviewBase64(compressed.base64);
      setOriginalCanvasRef(finalProcessingCanvas);

      const ocrSourceDataUrl = finalProcessingCanvas.toDataURL('image/png');
      const ocrResult = await recognizeReceiptText(ocrSourceDataUrl, (pct) => {
        setOcrProgress(pct);
      });

      setRawOcrText(ocrResult.rawText);

      const parsed = parseReceiptData(ocrResult.rawText);
      setStoreName(parsed.detectedStore || 'Ticket de Compra');
      if (parsed.detectedDate) setReceiptDate(parsed.detectedDate);
      if (parsed.detectedTime) setReceiptTime(parsed.detectedTime);
      if (parsed.detectedTotalARS > 0) setAmountARS(parsed.detectedTotalARS.toString());
      setItemsList(parsed.detectedItems || []);
      setIsUpsideDown(parsed.isUpsideDownDetected || false);

      setScanStatus('review');
    } catch (err) {
      console.error('Error en pipeline de procesamiento de imagen:', err);
      setErrorMessage('No se pudo procesar la imagen automáticamente. Intenta con otra foto con mejor iluminación.');
      setScanStatus('idle');
    }
  };

  const captureFrameFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const wrapper = wrapperRef.current;
    const guide = guideRef.current;

    const rawWidth = video.videoWidth || 1280;
    const rawHeight = video.videoHeight || 720;

    const isRotated90or270 = rotationAngle === 90 || rotationAngle === 270;
    const targetWidth = isRotated90or270 ? rawHeight : rawWidth;
    const targetHeight = isRotated90or270 ? rawWidth : rawHeight;

    const rotCanvas = document.createElement('canvas');
    rotCanvas.width = targetWidth;
    rotCanvas.height = targetHeight;

    const rotCtx = rotCanvas.getContext('2d');
    if (!rotCtx) return;
    rotCtx.imageSmoothingEnabled = true;
    rotCtx.imageSmoothingQuality = 'high';
    rotCtx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
    rotCtx.rotate((rotationAngle * Math.PI) / 180);
    rotCtx.drawImage(video, -rawWidth / 2, -rawHeight / 2, rawWidth, rawHeight);

    let finalCanvas = rotCanvas;

    if (autoCropGuide && guide && wrapper) {
      try {
        const wrapperRect = wrapper.getBoundingClientRect();
        const guideRect = guide.getBoundingClientRect();
        const videoAspect = targetWidth / targetHeight;
        const wrapperAspect = wrapperRect.width / wrapperRect.height;

        let renderW: number;
        let renderH: number;
        let offsetX: number;
        let offsetY: number;
        if (wrapperAspect > videoAspect) {
          renderW = wrapperRect.width;
          renderH = wrapperRect.width / videoAspect;
          offsetX = 0;
          offsetY = (wrapperRect.height - renderH) / 2;
        } else {
          renderH = wrapperRect.height;
          renderW = wrapperRect.height * videoAspect;
          offsetY = 0;
          offsetX = (wrapperRect.width - renderW) / 2;
        }

        const scale = targetWidth / renderW;
        const guideRelX = guideRect.left - (wrapperRect.left + offsetX);
        const guideRelY = guideRect.top - (wrapperRect.top + offsetY);

        let cropX = Math.round(guideRelX * scale);
        let cropY = Math.round(guideRelY * scale);
        let cropW = Math.round(guideRect.width * scale);
        let cropH = Math.round(guideRect.height * scale);

        const padX = Math.round(cropW * 0.08);
        const padY = Math.round(cropH * 0.08);
        cropX = Math.max(0, cropX - padX);
        cropY = Math.max(0, cropY - padY);
        cropW = Math.min(targetWidth - cropX, cropW + padX * 2);
        cropH = Math.min(targetHeight - cropY, cropH + padY * 2);

        if (cropW > 120 && cropH > 120) {
          const cropCanvas = document.createElement('canvas');
          cropCanvas.width = cropW;
          cropCanvas.height = cropH;
          const cCtx = cropCanvas.getContext('2d');
          if (cCtx) {
            cCtx.imageSmoothingEnabled = true;
            cCtx.imageSmoothingQuality = 'high';
            cCtx.drawImage(rotCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
            finalCanvas = cropCanvas;
          }
        }
      } catch (cropErr) {
        console.warn('Fallo al recortar según visor, usando marco completo:', cropErr);
      }
    }

    stopLiveCamera();
    processReceiptCanvas(finalCanvas);
  };

  const handleTransform = async (angleDelta = 0, flipHorizontal = false) => {
    if (!originalCanvasRef) return;
    try {
      const transformed = transformCanvas(originalCanvasRef, angleDelta, flipHorizontal);
      setOriginalCanvasRef(transformed);
      await processReceiptCanvas(transformed);
    } catch (err) {
      console.warn('Error transformando imagen:', err);
    }
  };

  const handleApplyPerspectiveWarp = async (corners: CornersState) => {
    if (!originalCanvasRef) return;
    setIsApplyingPerspective(true);
    try {
      const w = originalCanvasRef.width;
      const h = originalCanvasRef.height;
      const nativeCorners = {
        topLeft: { x: (corners.tl.x / 100) * w, y: (corners.tl.y / 100) * h },
        topRight: { x: (corners.tr.x / 100) * w, y: (corners.tr.y / 100) * h },
        bottomRight: { x: (corners.br.x / 100) * w, y: (corners.br.y / 100) * h },
        bottomLeft: { x: (corners.bl.x / 100) * w, y: (corners.bl.y / 100) * h }
      };

      const warpedCanvas = warpPerspective(originalCanvasRef, nativeCorners);
      const enhancedCanvas = enhanceDocumentContrast(warpedCanvas);

      setOriginalCanvasRef(enhancedCanvas);
      setIsLightboxOpen(false);
      await processReceiptCanvas(enhancedCanvas, true);
    } catch (err) {
      console.error('Error aplicando recomposición de perspectiva:', err);
      setErrorMessage('No se pudo aplanar la perspectiva. Verifica que las 4 esquinas formen un cuadrilátero válido.');
    } finally {
      setIsApplyingPerspective(false);
    }
  };

  const handleApplyDocumentFilter = async () => {
    if (!originalCanvasRef) return;
    try {
      const enhancedCanvas = enhanceDocumentContrast(originalCanvasRef);
      setOriginalCanvasRef(enhancedCanvas);
      await processReceiptCanvas(enhancedCanvas, true);
    } catch (err) {
      console.warn('Error aplicando filtro documento:', err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopLiveCamera();
    try {
      setScanStatus('processing');
      const canvas = await loadImageToCanvas(file, 1800);
      await processReceiptCanvas(canvas);
    } catch (err) {
      console.error('Error cargando archivo:', err);
      setErrorMessage('No se pudo cargar la imagen seleccionada.');
      setScanStatus('idle');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    stopLiveCamera();
    setIsLightboxOpen(false);
    setScanStatus('idle');
    setCompressionStats(null);
    setOcrProgress(0);
    setPreviewBase64(null);
    setOriginalCanvasRef(null);
    setRawOcrText('');
    setStoreName('');
    setReceiptDate(new Date().toISOString().split('T')[0]);
    setReceiptTime('');
    setAmountARS('');
    setReceiptNote('');
    setItemsList([]);
    setIsUpsideDown(false);
    setErrorMessage('');
  };

  const handleAddItem = () => {
    setItemsList(prev => [
      ...prev,
      {
        id: 'item-' + Date.now(),
        name: '',
        quantity: 1,
        unitPrice: 0,
        total: 0
      }
    ]);
  };

  const handleItemChange = (id: string, field: 'name' | 'quantity' | 'unitPrice' | 'total', value: string) => {
    setItemsList(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        const q = field === 'quantity' ? (parseCurrencyNumber(value) || 0) : (parseCurrencyNumber(item.quantity) || 0);
        const u = field === 'unitPrice' ? (parseCurrencyNumber(value) || 0) : (parseCurrencyNumber(item.unitPrice) || 0);
        updated.total = Math.round(q * u);
      } else if (field === 'total') {
        updated.total = parseCurrencyNumber(value) || 0;
      }
      return updated;
    }));
  };

  const handleDeleteItem = (id: string) => {
    setItemsList(prev => prev.filter(item => item.id !== id));
  };

  const handleSyncTotalFromItems = () => {
    const sum = itemsList.reduce((acc, it) => acc + (parseCurrencyNumber(it.total) || 0), 0);
    if (sum > 0) {
      setAmountARS(sum.toString());
    }
  };

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    const finalARS = parseCurrencyNumber(amountARS) || 0;
    if (finalARS <= 0) {
      alert('Por favor verifica el monto total.');
      return;
    }

    const receiptId = 'rec-' + Date.now();
    const cleanStore = storeName.trim() || 'Comercio';

    const itemsSummary = itemsList.length > 0
      ? ` • [Ítems]: ` + itemsList.map(it => `${it.name}${Number(it.quantity) > 1 ? ` (x${it.quantity})` : ''} $${Number(it.total).toLocaleString()}`).join(', ')
      : '';

    const timePrefix = receiptTime ? `[Hora: ${receiptTime}] ` : '';
    const fullNote = (receiptNote.trim() ? receiptNote.trim() : `${timePrefix}Escaneado con cámara OCR`) + itemsSummary;

    const mediaItem: MediaReceipt = {
      uuid: receiptId,
      filename: `ticket-${cleanStore.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.webp`,
      description: rawOcrText ? `[OCR ${cleanStore}]: ${rawOcrText.slice(0, 500)}` : `Ticket ${cleanStore}`,
      extension: 'webp',
      content_type: 'image/webp',
      content_base64: previewBase64 || ''
    };

    const expenseItem: Expense = {
      id: 'exp-' + Date.now(),
      date: receiptDate,
      concept: cleanStore,
      category: defaultCategory,
      amountARS: Math.round(finalARS),
      paymentMethod,
      paidBy: paymentMethod === 'tarjeta' ? 'Tarjeta' : 'Efectivo',
      note: fullNote,
      receipt_id: receiptId,
      items: itemsList.map(it => ({
        id: it.id,
        name: it.name,
        price: Number(it.total) || 0
      }))
    };

    onSaveExpenseWithReceipt(expenseItem, mediaItem);
    handleReset();
    if (onClose) onClose();
  };

  const parsedAmountARS = parseCurrencyNumber(amountARS) || 0;
  const computedUSD = exchangeRate > 0 ? parsedAmountARS / exchangeRate : 0;
  const itemsSumARS = itemsList.reduce((acc, it) => acc + (parseCurrencyNumber(it.total) || 0), 0);

  return (
    <div className="receipt-scanner-card">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <div className="scanner-header-row">
        <div className="scanner-header-title">
          <Camera size={22} className="text-emerald" />
          <div>
            <h4>Escáner de Facturas & Tickets</h4>
            <span className="scanner-header-sub">
              Toma foto al ticket para transcribir y registrar en <strong>{categoryName}</strong>
            </span>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={() => { stopLiveCamera(); onClose(); }}
            className="btn-close-scanner"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="scanner-error-alert">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {scanStatus === 'idle' && (
        !isCameraActive ? (
          <div className="scanner-dropzone">
            <div className="scanner-prompt-content">
              <div className="scanner-icon-bubble">
                <Camera size={34} className="text-emerald" />
              </div>

              <h5>Captura o sube la foto de tu factura</h5>
              <p>
                Puedes activar la cámara en vivo de tu portátil o celular para encuadrar el ticket,
                o seleccionar una foto de tu galería/archivos.
              </p>

              <div className="scanner-actions-group">
                <button
                  type="button"
                  className="btn-trigger-camera"
                  onClick={() => startLiveCamera()}
                >
                  <Camera size={18} />
                  <span>Activar Cámara en Vivo</span>
                </button>

                <button
                  type="button"
                  className="btn-trigger-upload"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} />
                  <span>Subir Foto / Archivo</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <ScannerCameraView
            videoRef={videoRef}
            wrapperRef={wrapperRef}
            guideRef={guideRef}
            rotationAngle={rotationAngle}
            frameOrientation={frameOrientation}
            setFrameOrientation={setFrameOrientation}
            autoCropGuide={autoCropGuide}
            setAutoCropGuide={setAutoCropGuide}
            hasMultipleCameras={hasMultipleCameras}
            onStopCamera={stopLiveCamera}
            onRotateCamera90={rotateCamera90}
            onCaptureFrame={captureFrameFromCamera}
            onToggleFacingMode={toggleFacingMode}
          />
        )
      )}

      {scanStatus === 'processing' && (
        <ScannerPipelineProgress
          pipelineStep={pipelineStep}
          pipelineStatusText={pipelineStatusText}
          ocrProgress={ocrProgress}
          compressionStats={compressionStats}
        />
      )}

      {scanStatus === 'review' && previewBase64 && (
        <ScannerReviewForm
          previewBase64={previewBase64}
          compressionStats={compressionStats}
          isUpsideDown={isUpsideDown}
          storeName={storeName}
          setStoreName={setStoreName}
          receiptDate={receiptDate}
          setReceiptDate={setReceiptDate}
          receiptTime={receiptTime}
          setReceiptTime={setReceiptTime}
          amountARS={amountARS}
          setAmountARS={setAmountARS}
          computedUSD={computedUSD}
          parsedAmountARS={parsedAmountARS}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          receiptNote={receiptNote}
          setReceiptNote={setReceiptNote}
          itemsList={itemsList}
          itemsSumARS={itemsSumARS}
          onAddItem={handleAddItem}
          onItemChange={handleItemChange}
          onDeleteItem={handleDeleteItem}
          onSyncTotalFromItems={handleSyncTotalFromItems}
          onTransform={handleTransform}
          onOpenLightbox={(perspectiveMode) => {
            setLightboxInitialPerspective(perspectiveMode);
            setIsLightboxOpen(true);
          }}
          onApplyDocumentFilter={handleApplyDocumentFilter}
          onReset={handleReset}
          onApprove={handleApprove}
        />
      )}

      <ScannerLightbox
        isOpen={isLightboxOpen}
        previewBase64={previewBase64}
        onClose={() => setIsLightboxOpen(false)}
        onTransform={handleTransform}
        onApplyPerspectiveWarp={handleApplyPerspectiveWarp}
        isApplyingPerspective={isApplyingPerspective}
        onReset={handleReset}
        initialPerspectiveMode={lightboxInitialPerspective}
      />
    </div>
  );
}

