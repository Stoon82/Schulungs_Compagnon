import { useState } from 'react';
import { Award, Download, Palette, Type } from 'lucide-react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

/**
 * CertificateGenerator - Generate and customize certificates
 * Auto-generates on module completion with verification QR code
 */
function CertificateGenerator({ 
  participantName, 
  moduleTitle, 
  completionDate,
  verificationCode,
  onGenerate 
}) {
  const [customization, setCustomization] = useState({
    primaryColor: '#8b5cf6',
    secondaryColor: '#ec4899',
    fontFamily: 'serif',
    logoUrl: '',
    customText: 'hat erfolgreich das Modul abgeschlossen'
  });
  const [generating, setGenerating] = useState(false);

  const generateCertificate = async () => {
    setGenerating(true);

    try {
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Background gradient (simulated with rectangles)
      pdf.setFillColor(15, 23, 42); // Dark background
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      // Border
      pdf.setDrawColor(139, 92, 246); // Purple
      pdf.setLineWidth(2);
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

      // Inner border
      pdf.setDrawColor(236, 72, 153); // Pink
      pdf.setLineWidth(0.5);
      pdf.rect(15, 15, pageWidth - 30, pageHeight - 30);

      // Title
      pdf.setFontSize(40);
      pdf.setTextColor(139, 92, 246);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ZERTIFIKAT', pageWidth / 2, 40, { align: 'center' });

      // Subtitle
      pdf.setFontSize(16);
      pdf.setTextColor(156, 163, 175);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Schulungs Compagnon', pageWidth / 2, 50, { align: 'center' });

      // Custom text
      pdf.setFontSize(14);
      pdf.setTextColor(241, 245, 249);
      pdf.text(customization.customText, pageWidth / 2, 70, { align: 'center' });

      // Participant name
      pdf.setFontSize(32);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text(participantName, pageWidth / 2, 95, { align: 'center' });

      // Module title
      pdf.setFontSize(20);
      pdf.setTextColor(236, 72, 153);
      pdf.setFont('helvetica', 'italic');
      pdf.text(moduleTitle, pageWidth / 2, 115, { align: 'center' });

      // Completion date
      pdf.setFontSize(12);
      pdf.setTextColor(156, 163, 175);
      pdf.setFont('helvetica', 'normal');
      const formattedDate = new Date(completionDate).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      pdf.text(`Abgeschlossen am ${formattedDate}`, pageWidth / 2, 135, { align: 'center' });

      // Generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://schulungs-compagnon.app/verify/${verificationCode}`,
        {
          width: 200,
          margin: 1,
          color: {
            dark: '#8b5cf6',
            light: '#ffffff'
          }
        }
      );

      // Add QR code
      pdf.addImage(qrCodeDataUrl, 'PNG', pageWidth - 45, pageHeight - 45, 30, 30);

      // Verification code text
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175);
      pdf.text('Verifizierungscode:', pageWidth - 45, pageHeight - 12, { align: 'left' });
      pdf.setFontSize(10);
      pdf.setTextColor(139, 92, 246);
      pdf.setFont('courier', 'normal');
      pdf.text(verificationCode, pageWidth - 45, pageHeight - 8, { align: 'left' });

      // Signature line
      pdf.setDrawColor(156, 163, 175);
      pdf.setLineWidth(0.5);
      pdf.line(40, pageHeight - 30, 100, pageHeight - 30);
      pdf.setFontSize(10);
      pdf.setTextColor(156, 163, 175);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Trainer', 70, pageHeight - 25, { align: 'center' });

      // Download PDF
      pdf.save(`Zertifikat-${participantName.replace(/\s+/g, '-')}-${Date.now()}.pdf`);

      // Save certificate record to database
      if (onGenerate) {
        await onGenerate({
          participantName,
          moduleTitle,
          completionDate,
          verificationCode,
          customization
        });
      }

      alert('Zertifikat erfolgreich erstellt!');
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Fehler beim Erstellen des Zertifikats');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Award size={24} className="text-purple-400" />
          Zertifikat erstellen
        </h3>
        <p className="text-gray-400 mt-1">
          Personalisieren Sie das Zertifikat für {participantName}
        </p>
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-purple-500/30 rounded-lg p-8 text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>

        <h2 className="text-4xl font-bold text-purple-400 mb-2">ZERTIFIKAT</h2>
        <p className="text-gray-400 text-sm mb-6">Schulungs Compagnon</p>
        
        <p className="text-gray-300 mb-4">{customization.customText}</p>
        
        <h3 className="text-3xl font-bold text-white mb-4">{participantName}</h3>
        
        <p className="text-xl text-pink-400 italic mb-6">{moduleTitle}</p>
        
        <p className="text-sm text-gray-400">
          Abgeschlossen am {new Date(completionDate).toLocaleDateString('de-DE')}
        </p>

        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-gray-500">
            Verifizierungscode: {verificationCode}
          </p>
        </div>
      </div>

      {/* Customization Options */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Palette size={20} />
          Anpassungen
        </h4>

        <div className="space-y-4">
          {/* Primary Color */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Primärfarbe
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={customization.primaryColor}
                onChange={(e) => setCustomization({ ...customization, primaryColor: e.target.value })}
                className="w-16 h-10 rounded border-2 border-white/20 cursor-pointer"
              />
              <input
                type="text"
                value={customization.primaryColor}
                onChange={(e) => setCustomization({ ...customization, primaryColor: e.target.value })}
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sekundärfarbe
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={customization.secondaryColor}
                onChange={(e) => setCustomization({ ...customization, secondaryColor: e.target.value })}
                className="w-16 h-10 rounded border-2 border-white/20 cursor-pointer"
              />
              <input
                type="text"
                value={customization.secondaryColor}
                onChange={(e) => setCustomization({ ...customization, secondaryColor: e.target.value })}
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Custom Text */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Type size={16} />
              Benutzerdefinierter Text
            </label>
            <input
              type="text"
              value={customization.customText}
              onChange={(e) => setCustomization({ ...customization, customText: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Logo URL (optional)
            </label>
            <input
              type="text"
              value={customization.logoUrl}
              onChange={(e) => setCustomization({ ...customization, logoUrl: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateCertificate}
        disabled={generating}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            Erstelle Zertifikat...
          </>
        ) : (
          <>
            <Download size={20} />
            Zertifikat herunterladen
          </>
        )}
      </button>
    </div>
  );
}

export default CertificateGenerator;
